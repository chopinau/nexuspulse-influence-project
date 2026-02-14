# Refactor Backend to Hybrid Two-Step Pipeline with Gemini

## 1. Dependency Updates
- **File:** `python_backend/requirements.txt`
- **Action:** Add `google-generativeai` to the requirements list.
- **Verification:** `supabase` is already present in the file.

## 2. Code Refactoring (The Core Task)
- **File:** `python_backend/report_engine_only.py`
- **Action:** Completely overwrite the existing file with the new "Hybrid Two-Step Pipeline" implementation.
- **Key Changes:**
    - **Remove:** All `tavily` based search logic and multi-threading.
    - **Phase 1 (Researcher):** Implement `generate_deep_research_report` using `google-generativeai` (Gemini 1.5 Pro) with native Google Search tools.
    - **Phase 2 (Judge):** Implement `extract_dashboard_json` using the existing `call_llm` to process the Gemini report into structured JSON.
    - **Storage:** Persist the generated report to Supabase `reports` table.
    - **Output:** Return strict JSON structure expected by the frontend (Verdict, Agents, Charts, Mermaid, Full Report).

## 3. Environment Check (User Action Required)
- You will need to ensure your `.env` file contains:
    - `GEMINI_API_KEY`: For the Google Generative AI client.
    - `SUPABASE_URL`: For database connection.
    - `SUPABASE_KEY`: For database authentication.
- Run `pip install -r requirements.txt` after I update the file.