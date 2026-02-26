from typing import Any, Dict, List

from pydantic import BaseModel, Field


class ToolMetadata(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any] = Field(default_factory=dict)


class ToolContext(BaseModel):
    """
    Placeholder for shared resources (db sessions, clients, etc.).
    For this demo we operate on in-memory data to keep things simple.
    """

    # In a real app, this might be SQLAlchemy sessions or API clients.
    claims: List[Dict[str, Any]] = Field(default_factory=list)
    families: List[Dict[str, Any]] = Field(default_factory=list)


def _seed_context() -> ToolContext:
    # Simple synthetic demo data
    claims = [
        {"id": "C-1001", "member_id": "M-1", "status": "rejected", "amount": 1200.0, "service_date": "2035-01-10"},
        {"id": "C-1002", "member_id": "M-2", "status": "paid", "amount": 80.0, "service_date": "2025-11-01"},
        {"id": "C-1003", "member_id": "M-3", "status": "rejected", "amount": 300.0, "service_date": "2024-04-01"},
        {"id": "C-1004", "member_id": "M-1", "status": "pending", "amount": 5000.0, "service_date": "2023-12-01"},
    ]
    families = [
        {"family_id": "F-1", "member_count": 2, "total_premium": 400.0},
        {"family_id": "F-2", "member_count": 7, "total_premium": 900.0},
        {"family_id": "F-3", "member_count": 10, "total_premium": 1500.0},
    ]
    return ToolContext(claims=claims, families=families)


CONTEXT = _seed_context()


def list_rejected_claims(status_filter: str = "rejected") -> Dict[str, Any]:
    rows = [c for c in CONTEXT.claims if c.get("status") == status_filter]
    return {
        "rows": rows,
        "meta": {"count": len(rows), "status_filter": status_filter},
    }


def fix_invalid_claim_dates(dry_run: bool = True) -> Dict[str, Any]:
    """
    Detects claims with clearly invalid service dates (e.g. far future)
    and proposes corrected dates. Does NOT mutate data when dry_run=True.
    """
    invalid_rows = []
    for claim in CONTEXT.claims:
        service_date = claim.get("service_date")
        if service_date and service_date.startswith("203"):
            proposed = service_date.replace("203", "202")  # naive fix for demo purposes
            invalid_rows.append(
                {
                    "id": claim["id"],
                    "current_service_date": service_date,
                    "proposed_service_date": proposed,
                }
            )

    # NOTE: we never mutate CONTEXT here; a real mutation would require explicit confirmation.
    return {
        "rows": invalid_rows,
        "meta": {"count": len(invalid_rows), "dry_run": dry_run},
        "requires_confirmation": len(invalid_rows) > 0 and not dry_run,
    }


def list_large_families(min_members: int = 5) -> Dict[str, Any]:
    rows = [f for f in CONTEXT.families if f.get("member_count", 0) >= min_members]
    return {
        "rows": rows,
        "meta": {"count": len(rows), "min_members": min_members},
    }


TOOLS_REGISTRY: Dict[str, ToolMetadata] = {
    "list_rejected_claims": ToolMetadata(
        name="list_rejected_claims",
        description="List claims with a given status (default: rejected).",
        parameters={
            "type": "object",
            "properties": {
                "status_filter": {
                    "type": "string",
                    "description": "Claim status to filter on.",
                    "default": "rejected",
                }
            },
        },
    ),
    "fix_invalid_claim_dates": ToolMetadata(
        name="fix_invalid_claim_dates",
        description="Detect claims with invalid future service dates and propose corrected dates. Does not mutate data when dry_run=true.",
        parameters={
            "type": "object",
            "properties": {
                "dry_run": {
                    "type": "boolean",
                    "description": "If true, only simulate the fix and return proposed changes.",
                    "default": True,
                }
            },
        },
    ),
    "list_large_families": ToolMetadata(
        name="list_large_families",
        description="List families whose member count exceeds a threshold.",
        parameters={
            "type": "object",
            "properties": {
                "min_members": {
                    "type": "integer",
                    "description": "Minimum number of members in the family.",
                    "default": 5,
                }
            },
        },
    ),
}


def call_tool(name: str, args: Dict[str, Any]) -> Dict[str, Any]:
    if name == "list_rejected_claims":
        return list_rejected_claims(**args)
    if name == "fix_invalid_claim_dates":
        return fix_invalid_claim_dates(**args)
    if name == "list_large_families":
        return list_large_families(**args)
    raise ValueError(f"Unknown tool: {name}")

