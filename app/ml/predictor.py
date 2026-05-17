import numpy as np
from typing import List, Optional
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
import joblib
import os
from app.models import Task


class DurationPredictor:
    MODEL_PATH = "ml_models/task_duration_model.pkl"
    ENCODER_PATH = "ml_models/category_encoder.pkl"

    def __init__(self):
        self.model: Optional[RandomForestRegressor] = None
        self.encoder: Optional[OneHotEncoder] = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.MODEL_PATH) and os.path.exists(self.ENCODER_PATH):
            self.model = joblib.load(self.MODEL_PATH)
            self.encoder = joblib.load(self.ENCODER_PATH)

    def _save_model(self):
        os.makedirs("ml_models", exist_ok=True)
        joblib.dump(self.model, self.MODEL_PATH)
        joblib.dump(self.encoder, self.ENCODER_PATH)

    def _prepare_features(self, tasks: List[Task]):
        categories = [[str(t.category_id) if t.category_id else "0"] for t in tasks]
        priorities = [[t.priority] for t in tasks]
        desc_lengths = [[len(t.description or "")] for t in tasks]

        if self.encoder is None:
            self.encoder = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
            cat_encoded = self.encoder.fit_transform(categories)
        else:
            cat_encoded = self.encoder.transform(categories)

        features = np.hstack([cat_encoded, priorities, desc_lengths])
        durations = [t.actual_duration for t in tasks]
        return features, durations

    def predict(self, category_id: Optional[int], priority: int, description: str, completed_tasks: List[Task]) -> int:
        if len(completed_tasks) < 5:
            if category_id:
                category_tasks = [t for t in completed_tasks if t.category_id == category_id]
                if category_tasks:
                    return int(np.mean([t.actual_duration for t in category_tasks]))
            if completed_tasks:
                return int(np.mean([t.actual_duration for t in completed_tasks]))
            return 30

        features, durations = self._prepare_features(completed_tasks)
        self.model = RandomForestRegressor(n_estimators=10, random_state=42)
        self.model.fit(features, durations)
        self._save_model()

        new_category = [[str(category_id) if category_id else "0"]]
        new_features = np.hstack([
            self.encoder.transform(new_category),
            [[priority]],
            [[len(description or "")]]
        ])
        prediction = self.model.predict(new_features)[0]
        return max(1, int(prediction))
