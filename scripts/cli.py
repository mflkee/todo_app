#!/usr/bin/env python3
import httpx
import json
import os
from pathlib import Path
import click

CONFIG_DIR = Path.home() / ".todo_cli"
CONFIG_FILE = CONFIG_DIR / "config.json"


def config():
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    if CONFIG_FILE.exists():
        return json.loads(CONFIG_FILE.read_text())
    return {}


def save_config(cfg):
    CONFIG_FILE.write_text(json.dumps(cfg, indent=2))


def headers():
    cfg = config()
    token = cfg.get("token")
    if not token:
        click.echo("Ошибка: не выполнен вход. Сначала: todo login", err=True)
        raise SystemExit(1)
    return {"Authorization": f"Bearer {token}"}


def base():
    return config().get("base_url", "http://localhost:8000")


@click.group()
def cli():
    pass


@cli.command()
@click.option("--url", default="http://localhost:8000", help="Base URL")
@click.argument("login")
@click.argument("password")
def login(url, login, password):
    """Вход и сохранение токена"""
    r = httpx.post(f"{url}/api/v1/auth/login", data={"username": login, "password": password})
    if r.status_code != 200:
        click.echo(f"Ошибка: {r.json().get('detail', r.text)}")
        return
    cfg = config()
    cfg["token"] = r.json()["access_token"]
    cfg["base_url"] = url
    cfg["login"] = login
    save_config(cfg)
    click.echo(f"✓ Вход выполнен как {login}")


@cli.command()
@click.argument("login")
@click.argument("password")
@click.argument("first_name")
@click.argument("last_name")
@click.option("--url", default="http://localhost:8000")
def register(url, login, password, first_name, last_name):
    """Регистрация нового пользователя"""
    r = httpx.post(f"{url}/api/v1/auth/register", json={
        "login": login, "password": password,
        "first_name": first_name, "last_name": last_name,
    })
    if r.status_code == 201:
        click.echo(f"✓ Пользователь {login} зарегистрирован")
    else:
        click.echo(f"Ошибка: {r.json().get('detail', r.text)}")


@cli.group()
def task():
    """Управление задачами"""


@task.command("list")
@click.option("--status", help="pending / completed")
@click.option("--category-id", type=int)
@click.option("--priority", type=int)
@click.option("--sort-by", default="created_at", help="created_at / priority / due_date")
@click.option("--page", default=1)
@click.option("--page-size", default=10)
def task_list(status, category_id, priority, sort_by, page, page_size):
    """Список задач"""
    params = {"sort_by": sort_by, "page": page, "page_size": page_size}
    if status: params["status"] = status
    if category_id is not None: params["category_id"] = category_id
    if priority is not None: params["priority"] = priority
    r = httpx.get(f"{base()}/api/v1/tasks/", params=params, headers=headers())
    if r.status_code != 200:
        click.echo(f"Ошибка: {r.text}", err=True)
        return
    tasks = r.json()
    if not tasks:
        click.echo("Нет задач")
        return
    for t in tasks:
        status_icon = "✓" if t["status"] == "completed" else "○"
        duration = f" ({t['actual_duration']}м)" if t["actual_duration"] else ""
        click.echo(f"  {status_icon} {t['id'][:8]}  {t['title']}{duration}  [p{t['priority']}]")


@task.command("create")
@click.argument("title")
@click.option("--description", "-d", default="")
@click.option("--priority", "-p", type=int, default=1)
@click.option("--category-id", type=int)
def task_create(title, description, priority, category_id):
    """Создать задачу"""
    data = {"title": title, "description": description, "priority": priority}
    if category_id is not None:
        data["category_id"] = category_id
    r = httpx.post(f"{base()}/api/v1/tasks/", json=data, headers=headers())
    if r.status_code == 201:
        click.echo(f"✓ Задача создана: {r.json()['id']}")
    else:
        click.echo(f"Ошибка: {r.json().get('detail', r.text)}")


@task.command("get")
@click.argument("task_id")
def task_get(task_id):
    """Информация о задаче"""
    r = httpx.get(f"{base()}/api/v1/tasks/{task_id}", headers=headers())
    if r.status_code != 200:
        click.echo(f"Ошибка: {r.text}", err=True)
        return
    t = r.json()
    click.echo(f"  ID:          {t['id']}")
    click.echo(f"  Название:    {t['title']}")
    click.echo(f"  Описание:    {t.get('description', '')}")
    click.echo(f"  Статус:      {'✓ выполнена' if t['status'] == 'completed' else '○ ожидает'}")
    click.echo(f"  Приоритет:   {t['priority']}")
    click.echo(f"  Категория:   {t.get('category_id', '—')}")
    click.echo(f"  Длит-сть:    {t.get('actual_duration', '—')} мин")
    click.echo(f"  Создана:     {t['created_at']}")


@task.command("update")
@click.argument("task_id")
@click.option("--title")
@click.option("--description")
@click.option("--priority", type=int)
def task_update(task_id, title, description, priority):
    """Обновить задачу"""
    data = {}
    if title: data["title"] = title
    if description is not None: data["description"] = description
    if priority: data["priority"] = priority
    r = httpx.put(f"{base()}/api/v1/tasks/{task_id}", json=data, headers=headers())
    if r.status_code == 200:
        click.echo(f"✓ Задача {task_id[:8]} обновлена")
    else:
        click.echo(f"Ошибка: {r.json().get('detail', r.text)}")


@task.command("delete")
@click.argument("task_id")
def task_delete(task_id):
    """Удалить задачу"""
    r = httpx.delete(f"{base()}/api/v1/tasks/{task_id}", headers=headers())
    if r.status_code == 200:
        click.echo(f"✓ Задача {task_id[:8]} удалена")
    else:
        click.echo(f"Ошибка: {r.text}", err=True)


@task.command("complete")
@click.argument("task_id")
@click.argument("duration", type=int)
def task_complete(task_id, duration):
    """Отметить задачу выполненной"""
    r = httpx.patch(f"{base()}/api/v1/tasks/{task_id}/complete",
                    json={"actual_duration": duration}, headers=headers())
    if r.status_code == 200:
        click.echo(f"✓ Задача {task_id[:8]} выполнена за {duration} мин")
    else:
        click.echo(f"Ошибка: {r.text}")


@task.command("predict")
@click.argument("task_id")
def task_predict(task_id):
    """Предсказать время выполнения"""
    r = httpx.get(f"{base()}/api/v1/tasks/predict/{task_id}", headers=headers())
    if r.status_code == 200:
        click.echo(f"  Предсказанное время: {r.json()['predicted_duration_minutes']} мин")
    else:
        click.echo(f"Ошибка: {r.text}", err=True)


@cli.group()
def category():
    """Управление категориями"""


@category.command("list")
def category_list():
    """Список категорий"""
    r = httpx.get(f"{base()}/api/v1/tasks/categories", headers=headers())
    if r.status_code != 200:
        click.echo(f"Ошибка: {r.text}", err=True)
        return
    cats = r.json()
    if not cats:
        click.echo("Нет категорий")
        return
    for c in cats:
        click.echo(f"  #{c['id']}  {c['name']}")


@category.command("create")
@click.argument("name")
def category_create(name):
    """Создать категорию"""
    r = httpx.post(f"{base()}/api/v1/tasks/categories", json={"name": name}, headers=headers())
    if r.status_code == 201:
        click.echo(f"✓ Категория создана: #{r.json()['id']} {r.json()['name']}")
    else:
        click.echo(f"Ошибка: {r.json().get('detail', r.text)}")


@cli.command()
def logout():
    """Выход (удаление токена)"""
    cfg = config()
    cfg.pop("token", None)
    cfg.pop("login", None)
    save_config(cfg)
    click.echo("✓ Выполнен выход")


if __name__ == "__main__":
    cli()
