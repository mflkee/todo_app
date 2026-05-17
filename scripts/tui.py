#!/usr/bin/env python3
import httpx
import json
import os
import tempfile
import atexit
import sys

BASE_URL = "http://localhost:8000"
TOKEN_FILE = os.path.join(tempfile.gettempdir(), ".todo_cli_token")


def clean(s):
    return "".join(c for c in s if not "\ud800" <= c <= "\udfff")


atexit.register(lambda: os.path.exists(TOKEN_FILE) and os.remove(TOKEN_FILE))


def save_token(token):
    with open(TOKEN_FILE, "w") as f:
        f.write(token)


def load_token():
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE) as f:
            return f.read().strip()
    return None


def headers():
    t = load_token()
    return {"Authorization": f"Bearer {t}"} if t else {}


def err_msg(r):
    try:
        return r.json().get("detail", r.text)
    except Exception:
        return r.text


def api(method, path, **kwargs):
    kwargs.setdefault("headers", {}).update(headers())
    return httpx.request(method, f"{BASE_URL}{path}", **kwargs)


def menu(title, items):
    print(f"\n  ╔══ {title} ")
    for key, text in items:
        print(f"  ║  {key}. {text}")
    print(f"  ║  0. Выход")
    print(f"  ╚══════════════════")
    try:
        return input("  → ").strip()
    except (EOFError, KeyboardInterrupt):
        return "0"


def login_flow():
    while True:
        choice = menu("Вход", [("1", "Войти"), ("2", "Регистрация")])
        if choice == "1":
            login = clean(input("  Логин: ").strip())
            password = clean(input("  Пароль: ").strip())
            r = api("POST", "/api/v1/auth/login", data={"username": login, "password": password})
            if r.status_code == 200:
                save_token(r.json()["access_token"])
                print(f"  ✓ Добро пожаловать, {login}!")
                return True
            print(f"  ✗ {err_msg(r)}")
        elif choice == "2":
            login = clean(input("  Логин: ").strip())
            password = clean(input("  Пароль (мин. 8 символов): ").strip())
            if len(password) < 8:
                print("  ✗ Минимум 8 символов"); continue
            first = clean(input("  Имя: ").strip())
            last = clean(input("  Фамилия: ").strip())
            r = api("POST", "/api/v1/auth/register", json={
                "login": login, "password": password,
                "first_name": first, "last_name": last,
            })
            if r.status_code == 201:
                print("  ✓ Зарегистрирован! Теперь войдите.")
            else:
                print(f"  ✗ {err_msg(r)}")
        else:
            return False


def task_list_flow():
    s = clean(input("  Статус (pending/completed/enter=все): ").strip().lower())
    c = clean(input("  Категория (ID/enter=все): ").strip())
    params = {}
    if s and s not in ("все", "all"):
        params["status"] = s
    if c and c.isdigit():
        params["category_id"] = int(c)
    r = api("GET", "/api/v1/tasks/", params=params)
    if r.status_code != 200:
        print(f"  ✗ {err_msg(r)}"); return
    tasks = r.json()
    if not tasks:
        print("  — Нет задач"); return
    print()
    for t in tasks:
        icon = "✓" if t["status"] == "completed" else "○"
        dur = f" ({t['actual_duration']}м)" if t["actual_duration"] else ""
        print(f"  {icon} {t['id']}  {t['title']}{dur}  [p{t['priority']}]")


def task_create_flow():
    title = clean(input("  Название: ").strip())
    if not title:
        print("  ✗ Название не может быть пустым"); return
    desc = clean(input("  Описание (enter=пусто): ").strip())
    pri = clean(input("  Приоритет (1-5, enter=1): ").strip() or "1")
    cat = clean(input("  ID категории (enter=без): ").strip())
    data = {"title": title, "description": desc, "priority": int(pri)}
    if cat:
        if not cat.isdigit():
            print("  ✗ ID категории — число"); return
        data["category_id"] = int(cat)
    r = api("POST", "/api/v1/tasks/", json=data)
    if r.status_code == 201:
        print(f"  ✓ Создана: {r.json()['id']}")
    else:
        print(f"  ✗ {err_msg(r)}")


def task_detail_flow():
    tid = clean(input("  UUID задачи: ").strip())
    if not tid:
        print("  ✗ Введите UUID"); return
    r = api("GET", f"/api/v1/tasks/{tid}")
    if r.status_code != 200:
        print(f"  ✗ {err_msg(r)}"); return
    t = r.json()
    if isinstance(t, list):
        print("  ✗ Задача не найдена"); return
    icon = "✓ выполнена" if t["status"] == "completed" else "○ ожидает"
    print(f"  ID:        {t['id']}")
    print(f"  Название:  {t['title']}")
    print(f"  Описание:  {t.get('description', '')}")
    print(f"  Статус:    {icon}")
    print(f"  Приоритет: {t['priority']}")
    print(f"  Категория: {t.get('category_id', '—')}")
    print(f"  Длит-сть:  {t.get('actual_duration', '—')} мин")
    print(f"  Создана:   {t['created_at']}")


def task_complete_flow():
    tid = clean(input("  UUID задачи: ").strip())
    dur = clean(input("  Фактическое время (мин): ").strip())
    if not dur.isdigit():
        print("  ✗ Введите число"); return
    r = api("PATCH", f"/api/v1/tasks/{tid}/complete", json={"actual_duration": int(dur)})
    if r.status_code == 200:
        print(f"  ✓ Выполнена за {dur} мин")
    else:
        print(f"  ✗ {err_msg(r)}")


def task_predict_flow():
    tid = clean(input("  UUID задачи: ").strip())
    r = api("GET", f"/api/v1/tasks/predict/{tid}")
    if r.status_code == 200:
        print(f"  ⏱ Предсказание: {r.json()['predicted_duration_minutes']} мин")
    else:
        print(f"  ✗ {err_msg(r)}")


def categories_flow():
    r = api("GET", "/api/v1/tasks/categories")
    if r.status_code != 200:
        print(f"  ✗ {err_msg(r)}"); return
    cats = r.json()
    if cats:
        print()
        for c in cats:
            print(f"  #{c['id']}  {c['name']}")
    else:
        print("  — Нет категорий")
    name = clean(input("  Новая категория (enter=пропустить): ").strip())
    if name:
        r = api("POST", "/api/v1/tasks/categories", json={"name": name})
        if r.status_code == 201:
            print(f"  ✓ Создана: #{r.json()['id']} {r.json()['name']}")
        else:
            print(f"  ✗ {err_msg(r)}")


def main_loop():
    print("\n  ╔══════════════════════════╗")
    print("  ║     To-Do TUI v1.0       ║")
    print("  ╚══════════════════════════╝")
    if not login_flow():
        return

    while True:
        choice = menu("Меню", [
            ("1", "Список задач"),
            ("2", "Создать задачу"),
            ("3", "Детали задачи"),
            ("4", "Выполнить задачу"),
            ("5", "Предсказать время"),
            ("6", "Категории"),
            ("7", "Сменить пользователя"),
        ])
        {
            "1": task_list_flow,
            "2": task_create_flow,
            "3": task_detail_flow,
            "4": task_complete_flow,
            "5": task_predict_flow,
            "6": categories_flow,
            "7": lambda: (
                os.path.exists(TOKEN_FILE) and os.remove(TOKEN_FILE),
                print("  — Токен удалён"),
                login_flow() or sys.exit()
            )[-1],
            "0": lambda: None,
        }.get(choice, lambda: None)()

        if choice == "0":
            break

    print("\n  До свидания!")


if __name__ == "__main__":
    main_loop()
