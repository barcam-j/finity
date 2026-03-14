from abc import ABC, abstractmethod

from fastapi import APIRouter


class ImporterBase(ABC):
    """
    Base contract for all importer modules.
    Each importer must expose a router that will be registered in the app.
    """

    @property
    @abstractmethod
    def router(self) -> APIRouter:
        """FastAPI router with the importer endpoints."""
        ...
