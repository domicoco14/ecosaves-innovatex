from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import circles, contributions, payouts, users

app = FastAPI(
    title="EcoSaves API",
    description="Backend for EcoSaves — a digitized ajo/esusu savings circle app",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "service": "EcoSaves API"}


@app.get("/health")
def health():
    return {"status": "healthy"}


app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(circles.router, prefix="/api/v1/circles", tags=["circles"])
app.include_router(contributions.router, prefix="/api/v1/contributions", tags=["contributions"])
app.include_router(payouts.router, prefix="/api/v1/payouts", tags=["payouts"])