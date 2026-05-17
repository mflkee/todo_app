from uuid import UUID
from typing import Optional
from app.repositories import TaskRepository
from app.ml.predictor import DurationPredictor


class PredictionService:
    def __init__(self, task_repo: TaskRepository):
        self.task_repo = task_repo
        self.predictor = DurationPredictor()

    async def predict_duration(self, user_id: UUID, category_id: Optional[int], priority: int, description: str) -> int:
        completed_tasks = await self.task_repo.get_completed_by_user(user_id)
        return self.predictor.predict(category_id, priority, description, completed_tasks)
