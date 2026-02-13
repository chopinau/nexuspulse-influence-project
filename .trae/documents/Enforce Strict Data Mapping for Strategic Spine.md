I will update the `python_backend/report_engine_only.py` file to strictly enforce data mapping for the strategic spine.

**Plan:**

1.  **Refactor `analyze_with_llm`**:
    *   Update the `system_prompt` to include a strict "STEP 2: NARRATIVE SPINE" section.
    *   Explicitly instruct the LLM to extract fields like `who`, `scenario`, `pain`, `solution`, `moat`, and `hook` *directly* from the preceding agent analysis.
    *   Enforce the new `narrative` object in the JSON output structure.

2.  **Update Mermaid Logic**:
    *   Rewrite the Mermaid graph generation code to use the `data['narrative']` object.
    *   Construct the "Strategic Blueprint" graph with nodes: Root -> Target -> Scene -> Pain -> Sol -> Moat -> Hook -> End.
    *   Apply the requested styling (large fonts, specific colors for spine vs context).

3.  **Verify**: Ensure the JSON output structure remains compatible with existing frontend components while adding the new narrative data for the blueprint.

I will now overwrite `python_backend/report_engine_only.py` with the provided code.
