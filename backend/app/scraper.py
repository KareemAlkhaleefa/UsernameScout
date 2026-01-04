from datetime import datetime, UTC
from app.constants import TARGET_SITES, USER_AGENTS
import asyncio
import httpx
import random
from app.schemas import Reason, SiteCheckResult, UsernameCheckResponse


async def check_by_not_found(
    client: httpx.AsyncClient, site: dict, username: str
) -> SiteCheckResult:

    url = site["url_template"].format(username)

    try:
        headers = {"User-Agent": random.choice(USER_AGENTS)}
        response = await client.get(
            url, headers=headers, follow_redirects=True, timeout=5.0
        )

        check_status = response.status_code

        if check_status == 404:
            reason = Reason.STATUS_404
            available = True

        elif check_status == 429:
            reason = Reason.RATE_LIMITED
            available = None

        elif check_status in [403, 401, 406, 503, 520]:
            reason = Reason.BLOCKED
            available = None
        else:
            available = False
            reason = Reason.PROFILE_FOUND

    except httpx.TimeoutException as e:
        reason = Reason.TIMEOUT
        check_status = None
        available = None

    except Exception as e:
        reason = Reason.NETWORK_ERROR
        check_status = None
        available = None

    result = SiteCheckResult(
        site=site["name"],
        category=site["category"],
        url=url,
        strategy=site["availability_strategy"],
        available=available,
        status_code=check_status,
        reason=reason,
    )

    return result


async def check_by_redirect(
    client: httpx.AsyncClient, site: dict, username: str
) -> SiteCheckResult:
    url = site["url_template"].format(username)

    try:
        headers = {"User-Agent": random.choice(USER_AGENTS)}
        response = await client.get(
            url, headers=headers, follow_redirects=False, timeout=5.0
        )

        check_status = response.status_code

        if check_status == 302:
            available = True
            reason = Reason.REDIRECT_AVAILABLE

        elif check_status == 429:
            available = None
            reason = Reason.RATE_LIMITED

        elif check_status in [403, 401, 406, 503, 520]:
            available = None
            reason = Reason.BLOCKED

        elif check_status == 200:
            available = False
            reason = Reason.PROFILE_FOUND
        else:
            available = False
            reason = Reason.UNEXPECTED_RESPONSE

    except httpx.TimeoutException as e:
        reason = Reason.TIMEOUT
        check_status = None
        available = None

    except Exception as e:
        reason = Reason.NETWORK_ERROR
        check_status = None
        available = None

    result = SiteCheckResult(
        site=site["name"],
        category=site["category"],
        url=url,
        strategy=site["availability_strategy"],
        available=available,
        status_code=check_status,
        reason=reason,
    )

    return result


async def check_by_content(
    client: httpx.AsyncClient, site: dict, username: str
) -> SiteCheckResult:
    url = site["url_template"].format(username)

    try:
        headers = {"User-Agent": random.choice(USER_AGENTS)}
        response = await client.get(
            url, headers=headers, follow_redirects=True, timeout=5.0
        )

        check_status = response.status_code

        # Handle "can't trust the content" cases first
        if check_status == 429:
            available = None
            reason = Reason.RATE_LIMITED

        elif check_status in [403, 401, 406, 503, 520]:
            available = None
            reason = Reason.BLOCKED

        else:
            text = response.text
            phrases = site.get("not_found_phrases", [])

            found_not_found_phrase = any(phrase in text for phrase in phrases)

            if found_not_found_phrase:
                available = True
                reason = Reason.NOT_FOUND_PHRASE
            else:
                available = False
                reason = Reason.PROFILE_FOUND

    except httpx.TimeoutException:
        check_status = None
        available = None
        reason = Reason.TIMEOUT

    except Exception:
        check_status = None
        available = None
        reason = Reason.NETWORK_ERROR

    return SiteCheckResult(
        site=site["name"],
        category=site["category"],
        url=url,
        strategy=site["availability_strategy"],
        available=available,
        status_code=check_status,
        reason=reason,
    )


AVAILABILITY_STRATEGIES = {
    "status_not_found": check_by_not_found,
    "status_redirect": check_by_redirect,
    "content_match": check_by_content,
}


async def run_all_checks(username: str) -> UsernameCheckResponse:
    async with httpx.AsyncClient() as client:
        tasks = []

        for site in TARGET_SITES:
            check_method = site.get("availability_strategy")
            checker = AVAILABILITY_STRATEGIES.get(check_method)

            if checker is None:
                raise ValueError(f"Unknown availability strategy: {check_method}")

            task = checker(client, site, username)
            tasks.append(task)

        results = await asyncio.gather(*tasks)
        return UsernameCheckResponse(
            username=username, checked_at=datetime.now(UTC), results=results
        )
