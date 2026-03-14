from fastapi import FastAPI

from app.importers.csv.router import router as csv_router

# Register importer routers here — add or remove modules freely
_routers = [
    csv_router,
]


def register_importers(app: FastAPI) -> None:
    for router in _routers:
        app.include_router(router)
