from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class Table(Base):
    __tablename__ = "tables"
    id = Column(String, primary_key=True, index=True)
    tableName = Column(String)
    date = Column(String, index=True)  # Add index for efficient date queries
    sort_order = Column(Integer, index=True)  # New field for maintaining sort order
    rows = relationship("Row", back_populates="table", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_date_sort_order', 'date', 'sort_order'),  # Composite index for efficient sorting
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