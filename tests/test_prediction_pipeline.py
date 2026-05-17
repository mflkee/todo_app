import pytest
import pytest_asyncio
from httpx import AsyncClient
from app.main import app
from app.database import get_db

from tests.test_api import override_get_db, engine

app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    from app.database import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def async_client():
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


USERS = [
    {"first_name": "Иван", "last_name": "Петров", "login": "ivan_p", "password": "StrongPass1"},
    {"first_name": "Мария", "last_name": "Сидорова", "login": "masid", "password": "StrongPass2"},
    {"first_name": "Алексей", "last_name": "Кузнецов", "login": "alexk", "password": "StrongPass3"},
]


@pytest.mark.asyncio
async def test_full_prediction_pipeline(async_client):
    client = async_client

    for user in USERS:
        resp = await client.post("/api/v1/auth/register", json=user)
        assert resp.status_code == 201

    for user in USERS:
        resp = await client.post("/api/v1/auth/login", data={
            "username": user["login"], "password": user["password"]
        })
        assert resp.status_code == 200
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        resp = await client.post("/api/v1/tasks/categories", json={"name": "Работа"}, headers=headers)
        assert resp.status_code == 201
        cat_work = resp.json()

        resp = await client.post("/api/v1/tasks/categories", json={"name": "Личное"}, headers=headers)
        assert resp.status_code == 201
        cat_personal = resp.json()

        resp = await client.post("/api/v1/tasks/categories", json={"name": "Учёба"}, headers=headers)
        assert resp.status_code == 201
        cat_study = resp.json()

        tasks_data = [
            {"title": "Написать отчёт", "description": "Подготовить еженедельный отчёт по проекту", "priority": 3, "category_id": cat_work["id"]},
            {"title": "Купить продукты", "description": "Молоко, хлеб, яйца, сыр, масло", "priority": 2, "category_id": cat_personal["id"]},
            {"title": "Изучить FastAPI", "description": "Прочитать документацию по фоновым задачам и middleware", "priority": 1, "category_id": cat_study["id"]},
            {"title": "Созвониться с заказчиком", "description": "Обсудить требования к новому модулю интеграции", "priority": 4, "category_id": cat_work["id"]},
            {"title": "Зарядка", "description": "Утренняя тренировка на 30 минут", "priority": 1, "category_id": cat_personal["id"]},
            {"title": "Решить задачи на LeetCode", "description": "Разобрать 3 задачи на динамическое программирование", "priority": 2, "category_id": cat_study["id"]},
        ]

        durations = [120, 45, 90, 30, 30, 60]
        task_ids = []

        for td in tasks_data:
            resp = await client.post("/api/v1/tasks/", json=td, headers=headers)
            assert resp.status_code == 201
            task_ids.append(resp.json()["id"])

        for task_id, duration in zip(task_ids, durations):
            resp = await client.patch(
                f"/api/v1/tasks/{task_id}/complete",
                json={"actual_duration": duration},
                headers=headers
            )
            assert resp.status_code == 200

        resp = await client.post("/api/v1/tasks/", json={
            "title": "Новая задача", "description": "Описание для предсказания", "priority": 2
        }, headers=headers)
        assert resp.status_code == 201
        new_task_id = resp.json()["id"]

        resp = await client.get(f"/api/v1/tasks/predict/{new_task_id}", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "predicted_duration_minutes" in data
        assert isinstance(data["predicted_duration_minutes"], int)
        assert data["predicted_duration_minutes"] >= 1
