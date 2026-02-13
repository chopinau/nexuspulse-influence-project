I will rewrite the backend logic to implement the "6-Agent Council" architecture as requested.

**Plan:**

1.  **Refactor `python_backend/report_engine_only.py`**:
    *   **Agent 1 (Selection)**: Implement pre-computation in `generate_focus_topic` to narrow down broad inputs into niche products.
    *   **Search Strategy (`get_market_intel`)**: Expand search queries to cover 5 specific dimensions: Cultural Taboos, User Pain Points, FDA Regulations, Amazon Bestsellers, and TikTok Trends.
    *   **Agent Council (`analyze_with_llm`)**:
        *   Update the System Prompt to simulate 6 distinct personas: Sniper, Localizer, PainKiller, Gatekeeper, CFO, and GrowthHacker.
        *   Enforce a strict JSON output structure with an `agents` object containing metrics and analysis for each persona.
    *   **Visualization**: Update the Mermaid graph generation to visualize the 6-agent decision flow (Selection -> Culture -> Pain -> Risk/Growth -> CFO -> Verdict).
    *   **Reporting**: Rewrite `generate_deep_report` to output a comprehensive Markdown report structured by the 6 agents' findings.

2.  **Verify**: Ensure the new JSON structure is compatible with the frontend (though the frontend might need updates later, this task focuses on the backend engine).

I will now proceed to overwrite `python_backend/report_engine_only.py` with the provided code.
