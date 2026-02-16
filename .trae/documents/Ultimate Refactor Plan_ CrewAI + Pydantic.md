# Ultimate Refactor Plan: CrewAI + Pydantic + Business Logic

## 1. Dependency Management
- **File:** `python_backend/requirements.txt`
- **Action:** Add the following required packages:
    - `crewai`
    - `crewai-tools`
    - `langchain-google-genai`
    - `pydantic` (already present, but ensures version compatibility)
    - `supabase` (already present)
    - `python-dotenv` (already present)
- **Note:** After I update the file, please run `pip install -r python_backend/requirements.txt` in your terminal.

## 2. Implement Core Engine (CrewAI)
- **File:** `python_backend/report_engine_only.py`
- **Action:** Completely overwrite with the new CrewAI implementation.
- **Key Features:**
    - **Pydantic Schemas:** strict `DashboardAgent`, `PainPoint`, and `FinalReportOutput` models to enforce the frontend contract.
    - **Multi-Agent System:**
        - **Agent 1 (Researcher):** "Top-Tier Cross-border Market Intelligence Officer" - focuses on deep data retrieval (Compliance, Supply Chain, Selection, Localization, Quality) using Gemini 1.5 Pro.
        - **Agent 2 (Judge):** "Cross-border Survival Line Strategic Judge" - evaluates the report against 6 fatal red lines (Score < 40 = KILL) and extracts structured JSON.
    - **Business Logic:** Embedding specific quantitative criteria (e.g., DOS ≥ 120 days, CR5 ≥ 70%) directly into agent backstories.
    - **Proxy Support:** Includes logic to handle local development proxies if needed.
    - **Supabase Integration:** Persists the final high-quality report.
    - **Mermaid Generation:** Auto-generates the strategic blueprint graph based on the structured narrative.

## 3. Execution
I will perform the file edits immediately after you approve this plan.