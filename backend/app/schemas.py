from datetime import datetime
from enum import Enum
from typing import List
from pydantic import BaseModel


class Reason(str, Enum):
    NOT_FOUND_PHRASE = "not_found_phrase"
    STATUS_404 = "status_404"
    PROFILE_FOUND = "profile_found"
    REDIRECT_AVAILABLE = "redirect_taken"
    TIMEOUT = "timeout"
    RATE_LIMITED = "rate_limited"
    BLOCKED = "blocked"
    NETWORK_ERROR = "network_error"
    UNEXPECTED_RESPONSE = "unexpected_response"


class SiteCheckResult(BaseModel):
    site: str
    category: str
    url: str
    strategy: str
    available: bool | None
    status_code: int | None = None
    reason: Reason


class UsernameCheckResponse(BaseModel):
    username: str
    checked_at: datetime
    results: List[SiteCheckResult]
