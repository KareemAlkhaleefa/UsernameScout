import re
from fastapi import APIRouter, HTTPException, Path
from app.scraper import run_all_checks
from app.schemas import UsernameCheckResponse

router = APIRouter(prefix="/api/v1", tags=["username-check"])


USERNAME_REGEX = re.compile(r"^[a-zA-Z0-9._-]+$")


@router.get(
    "/check/{username}",
    response_model=UsernameCheckResponse,
    summary="Check username availability across platforms",
)
async def check_username(
    username: str = Path(
        ...,
        min_length=1,
        max_length=39,
        description="Username to check (letters, numbers, ., _, -)",
    )
):
    # Normalize input
    username = username.strip()

    # Backend validation (mirrors frontend)
    if not USERNAME_REGEX.match(username):
        raise HTTPException(
            status_code=422,
            detail="Username contains invalid characters. Allowed: letters, numbers, '.', '_', '-'.",
        )

    return await run_all_checks(username)


@router.get(
    "/health",
    summary="Health check endpoint",
)
async def get_health():
    return {"status": "READY"}
