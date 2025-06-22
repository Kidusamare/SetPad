from pydantic import BaseModel
from typing import List

class Set(BaseModel):
    reps: str
    weight: str

class Row(BaseModel):
    id: int
    muscleGroup: str
    exercise: str
    sets: List[Set]
    notes: str
    showNotes: bool
    weightUnit: str

class TrainingLog(BaseModel):
    id: str
    tableName: str
    date: str
    rows: List[Row]
