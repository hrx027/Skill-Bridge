from __future__ import annotations

from typing import Any

import httpx
from fastapi import HTTPException

from app.config import get_settings


class ConvexClient:
    def __init__(self) -> None:
        settings = get_settings()
        self.url = (settings.convex_deployment_url or "").rstrip("/")
        self.admin_key = settings.convex_admin_key

    def _headers(self) -> dict[str, str]:
        if not self.url:
            raise HTTPException(status_code=500, detail="Convex deployment URL is not configured")
        headers = {"Content-Type": "application/json"}
        if self.admin_key:
            headers["Authorization"] = f"Convex {self.admin_key}"
        return headers

    def _call(self, kind: str, path: str, args: dict[str, Any] | None = None) -> Any:
        endpoint = f"{self.url}/api/{kind}"
        payload = {"path": path, "args": args or {}}
        try:
            response = httpx.post(endpoint, json=payload, headers=self._headers(), timeout=20.0)
            response.raise_for_status()
            return response.json().get("value")
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Convex {kind} call failed: {exc}") from exc

    def query(self, path: str, args: dict[str, Any] | None = None) -> Any:
        return self._call("query", path, args)

    def mutation(self, path: str, args: dict[str, Any] | None = None) -> Any:
        return self._call("mutation", path, args)


convex = ConvexClient()