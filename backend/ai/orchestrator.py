from typing import Any, Dict

from .schemas import AIRequest, AIResponse, SuggestedAction, UIType
from .system_prompt import BASE_SYSTEM_PROMPT
from .tools import TOOLS_REGISTRY, call_tool


class AIOrchestrator:
    """
    Thin orchestration layer that:
    - Decides which tools to call based on the request.
    - Shapes responses into UIResponse for the frontend.

    In a real system this would:
    - Call an LLM with BASE_SYSTEM_PROMPT + conversation history.
    - Use tool calling / function calling to decide which tools to invoke.
    - Translate LLM JSON output into AIResponse.

    Here we implement a deterministic rule-based orchestrator for clarity.
    """

    async def handle_request(self, req: AIRequest) -> AIResponse:
        query = req.query.lower()

        # Very simple rule-based "routing" to tools.
        if "rejected claim" in query or "denied claim" in query:
            tool_name = "list_rejected_claims"
            tool_args: Dict[str, Any] = {}
            tool_result = call_tool(tool_name, tool_args)
            rows = tool_result["rows"]
            return AIResponse(
                ui_type=UIType.table,
                title="Rejected Claims",
                message=f"Found {len(rows)} rejected claims. You can drill into specific claims or export for review.",
                data=rows,
                suggested_actions=[
                    SuggestedAction(
                        label="View large families",
                        description="Check if large families are driving rejection volume.",
                        payload={"query": "Show me large families driving claim volume"},
                    )
                ],
            )

        if "invalid date" in query or "future date" in query:
            tool_name = "fix_invalid_claim_dates"
            tool_result = call_tool(tool_name, {"dry_run": True})
            rows = tool_result["rows"]
            suggested = []
            if rows:
                suggested.append(
                    SuggestedAction(
                        label="Confirm date corrections",
                        description="Apply the proposed service date corrections to these claims.",
                        payload={
                            "query": "Confirm applying proposed service date corrections",
                            "context": {"action": "apply_fix_invalid_claim_dates"},
                        },
                    )
                )

            return AIResponse(
                ui_type=UIType.table if rows else UIType.summary,
                title="Invalid Claim Dates (Simulation)",
                message=(
                    f"Identified {len(rows)} claims with likely invalid future service dates. "
                    "This is a non-destructive simulation; no data was changed."
                ),
                data=rows,
                suggested_actions=suggested,
            )

        if "large family" in query or "high member count" in query:
            tool_name = "list_large_families"
            tool_result = call_tool(tool_name, {})
            rows = tool_result["rows"]
            return AIResponse(
                ui_type=UIType.table,
                title="Large Families",
                message=f"Found {len(rows)} large families that may be driving utilization and risk.",
                data=rows,
                suggested_actions=[
                    SuggestedAction(
                        label="Investigate rejected claims for these families",
                        description="Cross-check rejected claims associated with these high-risk families.",
                        payload={"query": "Show rejected claims for these large families"},
                    )
                ],
            )

        # Proactive anomaly detection entrypoint (e.g. on page load)
        if "proactive" in query or "anomaly" in query or "overview" in query:
            # For the demo we combine multiple signals without actually calling LLM.
            rejected = call_tool("list_rejected_claims", {})
            invalid_dates = call_tool("fix_invalid_claim_dates", {"dry_run": True})
            large_families = call_tool("list_large_families", {})

            summary_rows = [
                {
                    "metric": "Rejected claims",
                    "value": rejected["meta"]["count"],
                    "detail": "Claims currently in rejected status.",
                },
                {
                    "metric": "Claims with invalid dates",
                    "value": invalid_dates["meta"]["count"],
                    "detail": "Claims with future or inconsistent service dates (simulation only).",
                },
                {
                    "metric": "Large families",
                    "value": large_families["meta"]["count"],
                    "detail": "Families with high member counts and potential cost concentration.",
                },
            ]

            return AIResponse(
                ui_type=UIType.summary,
                title="Operational Anomaly Snapshot",
                message="Here's a quick snapshot of anomalies and high-risk clusters detected in your operations.",
                data=summary_rows,
                suggested_actions=[
                    SuggestedAction(
                        label="Drill into rejected claims",
                        description="Review and categorize rejected claims by root cause.",
                        payload={"query": "Show me rejected claims with details"},
                    ),
                    SuggestedAction(
                        label="Simulate fixing invalid dates",
                        description="Run a dry-run fix for invalid claim dates to see potential impact.",
                        payload={"query": "Simulate fixing invalid claim dates"},
                    ),
                ],
            )

        # Fallback: explain capabilities and prompt user toward tool-amenable queries.
        return AIResponse(
            ui_type=UIType.suggestion,
            title="SmartOps AI is Ready",
            message=(
                "Ask me to analyze rejected claims, detect invalid claim dates, or highlight large families driving risk. "
                "I will return structured, actionable insights instead of free-form chat."
            ),
            data=[],
            suggested_actions=[
                SuggestedAction(
                    label="Proactive anomaly overview",
                    description="Get a snapshot of key anomalies across claims and families.",
                    payload={"query": "Run proactive anomaly overview"},
                ),
                SuggestedAction(
                    label="List rejected claims",
                    description="See all currently rejected claims and their amounts.",
                    payload={"query": "Show me rejected claims"},
                ),
            ],
        )

