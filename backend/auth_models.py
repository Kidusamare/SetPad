"""Backwards-compatible exports for legacy auth model imports."""

from models import Base, User  # noqa: F401

__all__ = ["Base", "User"]
