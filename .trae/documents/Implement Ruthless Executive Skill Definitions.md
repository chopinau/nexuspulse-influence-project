## Implement Ruthless Executive Skill Definitions

### Overview
This refactoring will completely overhaul the backend agent personas from generic analysts to ruthless executive decision makers, providing binary GO/NO-GO decisions with quantified metrics.

### Implementation Steps

1. **Update SKILL_DEFINITIONS**
   - Completely overwrite the existing `SKILL_DEFINITIONS` dictionary in `python_backend/prompts.py` with the new ruthless executive definitions
   - The new definitions include four specialized agents: compliance_risk_agent, supply_cashflow_agent, marketing_growth_agent, and ceo_decision_agent
   - Each agent has specific core rules, forbidden outputs, and strict JSON output requirements

2. **Verify Prompt Assembly**
   - Review the `assemble_system_prompt` function to ensure it properly handles the new skill definition structure
   - Ensure it explicitly instructs the LLM to adhere strictly to the `forbidden_output` list
   - Ensure it emphasizes the requirement to return specific JSON fields defined in `core_rules`

3. **Validate Structure Compatibility**
   - Check if the new skill definition structure (with "role", "core_rules", "forbidden_output") is compatible with existing prompt assembly logic
   - Make any necessary adjustments to ensure the new structure is properly processed

4. **Test Implementation**
   - Verify the new skill definitions generate the required JSON output format
   - Ensure the agents provide binary GO/NO-GO decisions as intended

### Expected Outcome
The backend will now generate ruthless, executive-level decisions with quantified metrics and strict JSON output, providing the CEO with clear binary decisions rather than vague advice.