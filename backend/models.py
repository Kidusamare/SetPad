from datetime import UTC, datetime

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Index, DateTime
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


def current_utc() -> datetime:
    """Return timezone-aware UTC timestamps for model defaults."""
    return datetime.now(UTC)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=current_utc)
    updated_at = Column(DateTime, default=current_utc, onupdate=current_utc)

    tables = relationship("Table", back_populates="user", cascade="all, delete-orphan")


class Table(Base):
    __tablename__ = "tables"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    tableName = Column(String)
    date = Column(String, index=True)
    sort_order = Column(Integer, index=True)
    rows = relationship("Row", back_populates="table", cascade="all, delete-orphan")
    user = relationship("User", back_populates="tables")

    __table_args__ = (
        Index("idx_user_date_sort_order", "user_id", "date", "sort_order"),
    )


class Row(Base):
    __tablename__ = "rows"

    id = Column(Integer, primary_key=True, index=True)
    table_id = Column(String, ForeignKey("tables.id"))
    muscleGroup = Column(String)
    exercise = Column(String)
    notes = Column(String)
    showNotes = Column(Boolean, default=False)
    weightUnit = Column(String, default="lbs")
    table = relationship("Table", back_populates="rows")
    sets = relationship("Set", back_populates="row", cascade="all, delete-orphan")


class Set(Base):
    __tablename__ = "sets"

    id = Column(Integer, primary_key=True, index=True)
    row_id = Column(Integer, ForeignKey("rows.id"))
    reps = Column(String)
    weight = Column(String)
    row = relationship("Row", back_populates="sets")
