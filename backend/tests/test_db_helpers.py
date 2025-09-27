import os
import sys
import tempfile
import unittest
from importlib import reload

CURRENT_DIR = os.path.dirname(__file__)
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

TEST_DB_PATH = os.path.join(tempfile.gettempdir(), "setpad_unittest.db")
if os.path.exists(TEST_DB_PATH):
    os.remove(TEST_DB_PATH)

os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"

import db  # noqa: E402
import models  # noqa: E402
from schemas import TableSchema, RowSchema, SetSchema  # noqa: E402

reload(db)


class AnalyzeUserWorkoutsTests(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        models.Base.metadata.drop_all(bind=db.engine)
        models.Base.metadata.create_all(bind=db.engine)

    def setUp(self):
        models.Base.metadata.drop_all(bind=db.engine)
        models.Base.metadata.create_all(bind=db.engine)
        self.session = db.SessionLocal()

    def tearDown(self):
        self.session.close()

    def _create_workout(self, workout_id: str, date: str, exercise: str) -> None:
        schema = TableSchema(
            id=workout_id,
            tableName="Test Workout",
            date=date,
            rows=[
                RowSchema(
                    muscleGroup="Chest",
                    exercise=exercise,
                    sets=[SetSchema(reps="10", weight="135")],
                    notes="",
                    showNotes=False,
                    weightUnit="lbs",
                )
            ],
        )
        db.create_db_table_from_schema(schema, self.session)

    def test_analyze_user_workouts_returns_defaults_when_empty(self):
        analytics = db.analyze_user_workouts(self.session)
        self.assertEqual(analytics["total_workouts"], 0)
        self.assertEqual(analytics["recent_workouts"], 0)
        self.assertIn("message", analytics)

    def test_analyze_user_workouts_counts_rows(self):
        self._create_workout("w1", "2025-01-01", "Bench Press")
        analytics = db.analyze_user_workouts(self.session)
        self.assertEqual(analytics["total_workouts"], 1)
        self.assertEqual(analytics["last_workout"], "2025-01-01")
        self.assertIn(("Bench Press", 1), analytics["top_exercises"])

    def test_sort_order_increases_for_same_day_and_respects_chronology(self):
        self._create_workout("w1", "2025-01-02", "Bench Press")
        first = (
            self.session.query(models.Table)
            .filter(models.Table.id == "w1")
            .first()
        )
        self._create_workout("w2", "2025-01-02", "Incline Press")
        second = (
            self.session.query(models.Table)
            .filter(models.Table.id == "w2")
            .first()
        )
        self._create_workout("w0", "2024-12-31", "Push Ups")
        third = (
            self.session.query(models.Table)
            .filter(models.Table.id == "w0")
            .first()
        )

        self.assertIsNotNone(first.sort_order)
        self.assertIsNotNone(second.sort_order)
        self.assertGreater(second.sort_order, first.sort_order)
        self.assertLess(third.sort_order, first.sort_order)


if __name__ == "__main__":
    unittest.main()
