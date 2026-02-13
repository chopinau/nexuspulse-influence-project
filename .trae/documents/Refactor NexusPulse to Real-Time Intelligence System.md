# Refactor NexusPulse into a Real-Time Intelligence System

I will refactor the codebase to unify the Python backend (FastAPI) and Next.js frontend, ensuring real-time data flow and visual integration.

## 1. Backend Logic Refactor (`python_backend/report_engine_only.py`)
I will update the core logic to strictly follow the "God Mode" requirements:
*   **`generate_focus_topic`**: Uses LLM to brainstorm niche angles.
*   **`get_market_intel`**: Uses `TavilyClient` to fetch real-time market data (context + news).
*   **`analyze_with_llm`**:
    *   Uses a "God Mode" system prompt.
    *   Analyzes real market data.
    *   Returns a strict JSON object containing `mermaid_code`, `market_news`, `verdict`, `risk_score`, and `quantitative_metrics`.
    *   **Crucial**: Removes all mock data fallbacks; returns clear errors if search/analysis fails.

## 2. FastAPI Server Setup (`python_backend/main.py`)
I will replace the existing server logic with a robust FastAPI implementation:
*   **Setup**: Initialize `FastAPI` with `CORSMiddleware` to allow frontend communication.
*   **Models**: Define `BrainstormRequest` and `AnalyzeRequest` using Pydantic.
*   **Endpoints**:
    *   `POST /api/brainstorm`: Calls `generate_focus_topic`.
    *   `POST /api/analyze`: Calls `analyze_with_llm` then `generate_ceo_report` to return both structured data and the markdown report.

## 3. Dependency Management (`python_backend/requirements.txt`)
*   Add `fastapi` and `uvicorn` to the requirements file to support the new server architecture.

## 4. Frontend Dashboard Integration (`app/dashboard/page.tsx`)
I will refactor the dashboard to connect with the new API:
*   **Integration**: Connect `PersonaInput` to trigger the `brainstorm` -> `analyze` chain.
*   **State Management**: Handle `mermaidCode`, `marketNews`, `reportMarkdown`, and `verdict` states.
*   **Visuals**:
    *   Pass live data to the `LiveDynamics` component.
    *   Render the report using `ReactMarkdown` with "Cyberpunk" styling.
    *   Display a dynamic verdict banner (Red/Green/Yellow).

## 5. Visual Component Enhancement (`components/LiveDynamics.tsx`)
I will verify and update the component to ensure it:
*   Accepts `mermaidCode` and `news` props.
*   Renders the Mermaid chart (via `LogicFlow`) and the Market Intelligence Feed.
*   Handles loading states gracefully ("Scanning...").

## Execution Order
1.  Update `python_backend/requirements.txt`.
2.  Refactor `python_backend/report_engine_only.py`.
3.  Implement `python_backend/main.py`.
4.  Update `components/LiveDynamics.tsx`.
5.  Refactor `app/dashboard/page.tsx`.
