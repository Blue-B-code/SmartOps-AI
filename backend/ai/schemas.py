from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class UIType(str, Enum):
    summary = "summary"
    table = "table"
    suggestion = "suggestion"
    confirmation = "confirmation"


class SuggestedAction(BaseModel):
    label: str
    description: str
    payload: Dict[str, Any] = Field(
        default_factory=dict,
        description="Opaque payload that will be sent back to the /ai endpoint when the user clicks the action.",
    )


class AIRequest(BaseModel):
    query: str = Field(..., description="User natural language query or follow-up action.")
    context: Dict[str, Any] = Field(
        default_factory=dict,
        description="Optional context such as selected entity ids, filters, or previous tool results.",
    )


class AIResponse(BaseModel):
    ui_type: UIType
    title: str
    message: str
    data: List[Dict[str, Any]] = Field(default_factory=list)
    suggested_actions: List[SuggestedAction] = Field(default_factory=list)


class ToolCall(BaseModel):
    name: str
    args: Dict[str, Any] = Field(default_factory=dict)


class ToolResult(BaseModel):
    name: str
    result: Any

