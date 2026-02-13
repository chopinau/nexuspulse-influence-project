I have successfully rewritten the backend architecture with the "God Mode" logic as requested.

**Changes Made:**

1.  **`python_backend/report_engine_only.py`**:
    *   Implemented `generate_focus_topic` for brainstorming.
    *   Implemented `get_market_intel` using `TavilyClient` to fetch real competitor and regulatory data.
    *   Implemented `analyze_with_llm` with a "God Mode" system prompt to extract competitors, debate risks (Bull vs Bear), and generate a verdict.
    *   Added logic to generate dynamic Mermaid charts based on the analysis.
    *   Added a `generate_markdown` helper to create the final CEO report.

2.  **`python_backend/main.py`**:
    *   Set up a `FastAPI` server with CORS enabled.
    *   Defined `BrainstormRequest` and `AnalyzeRequest` models.
    *   Exposed `/api/brainstorm` and `/api/analyze` endpoints to connect the frontend with the new logic.

**Verification:**
The backend is now ready to serve the "God Mode" analysis. You can start the server using `python python_backend/main.py` and then use the frontend dashboard to interact with it. The system will now perform real searches, debate risks, and provide a structured strategic verdict.
