"""Compatibility layer for legacy imports.

The project historically used a separate ``database_models`` module with its own
``declarative_base``. To keep existing imports working after consolidating the
ORM layer, we re-export the models defined in ``backend.models``.
"""

from models import Base, User, Table, Row, Set  # noqa: F401

__all__ = ["Base", "User", "Table", "Row", "Set"]
