import httpx
import asyncio
import sys

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"

USERS = [
    {"first_name": "Иван", "last_name": "Петров", "login": "demo_ivan", "password": "StrongPass1"},
    {"first_name": "Мария", "last_name": "Сидорова", "login": "demo_masha", "password": "StrongPass2"},
    {"first_name": "Алексей", "last_name": "Кузнецов", "login": "demo_alex", "password": "StrongPass3"},
]


async def main():
    async with httpx.AsyncClient(base_url=BASE_URL) as c:
        for u in USERS:
            await c.post("/api/v1/auth/register", json=u)

        for u in USERS:
            r = await c.post("/api/v1/auth/login", data={"username": u["login"], "password": u["password"]})
            token = r.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}

            cw = (await c.post("/api/v1/tasks/categories", json={"name": "Работа"}, headers=headers)).json()
            cp = (await c.post("/api/v1/tasks/categories", json={"name": "Личное"}, headers=headers)).json()
            cs = (await c.post("/api/v1/tasks/categories", json={"name": "Учёба"}, headers=headers)).json()

            tasks = [
                ("Написать отчёт",          "Еженедельный отчёт",                    3, cw["id"], 120),
                ("Купить продукты",          "Молоко, хлеб, яйца, сыр, масло",      2, cp["id"], 45),
                ("Изучить FastAPI",          "Документация по middleware",           1, cs["id"], 90),
                ("Созвониться с заказчиком",  "Обсудить интеграцию",                 4, cw["id"], 30),
                ("Зарядка",                  "Утренняя тренировка",                  1, cp["id"], 30),
                ("LeetCode задачи",          "Динамическое программирование",        2, cs["id"], 60),
            ]

            ids = []
            for title, desc, priority, category_id, duration in tasks:
                t = (await c.post("/api/v1/tasks/", json={
                    "title": title, "description": desc, "priority": priority, "category_id": category_id
                }, headers=headers)).json()
                ids.append(t["id"])
                await c.patch(f"/api/v1/tasks/{t['id']}/complete", json={"actual_duration": duration}, headers=headers)

            nt = (await c.post("/api/v1/tasks/", json={
                "title": "Новая задача",
                "description": "Описание для проверки предсказания",
                "priority": 2
            }, headers=headers)).json()

            pred = (await c.get(f"/api/v1/tasks/predict/{nt['id']}", headers=headers)).json()["predicted_duration_minutes"]

            print("─" * 50)
            print(f"  {u['first_name']} {u['last_name']} ({u['login']})")
            print("─" * 50)
            print(f"  Обучающих задач:       {len(ids)}")
            print(f"  Новая задача:         «{nt['title']}»")
            print(f"  Приоритет:             {nt['priority']}")
            print(f"  Категория:             {nt.get('category_id', '—')}")
            print(f"  Длина описания:        {len(nt.get('description', ''))} симв.")
            print(f"  Предсказание:          {pred} мин.")
            print()

        print("=" * 50)
        print("  Все предсказания получены.")
        print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
