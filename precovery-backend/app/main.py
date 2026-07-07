from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import get_settings
from app.routes import auth, patients, checkins, doctors

settings = get_settings()

app = FastAPI(
    title="PRECOVERY — AI Care Companion API",
    description="""
    Backend API for the PRECOVERY doctor dashboard.
    
    ## Authentication
    All endpoints (except `/auth/login`) require a Bearer JWT token.
    
    Obtain a token via `POST /auth/login`, then pass it in every request:
    ```
    Authorization: Bearer <your_token>
    ```
    
    ## RBAC
    Doctors can only access patients assigned to them.
    Admin role can access all patients.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api")
app.include_router(patients.router, prefix="/api")
app.include_router(checkins.router, prefix="/api")
app.include_router(doctors.router, prefix="/api")


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "app": "PRECOVERY API", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}


# ── Global error handler ──────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )
