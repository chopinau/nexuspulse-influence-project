import sys

# --- TRACER CODE START ---
print("="*50)
print("ALERT: LOADING AGENT_SKILLS.PY ...")
print("ALERT: CHECKING TIKTOK KEY:")
# 临时硬编码检查，确保 key 存在
if "TIKTOK_MARKETING" in locals() or "TIKTOK_MARKETING" in globals():
    print("OK: TIKTOK_MARKETING Key Found!")
else:
    print("ERROR: TIKTOK_MARKETING Key NOT Found (Yet)!")
print("="*50)
# --- TRACER CODE END ---

from typing import List, TypedDict

class PersonaConfig(TypedDict):
    role_name: str
    base_identity: str
    forbidden_terms: List[str]
    mandatory_output: List[str]
    tone_style: str
    extra_instructions: str

def build_system_prompt(config: PersonaConfig) -> str:
    """Constructs the system prompt and enforces JSON output."""
    prompt = f"""
    **ROLE:** {config['role_name']}
    **IDENTITY:** {config['base_identity']}
    **TONE:** {config['tone_style']}
    **⛔ FORBIDDEN:** {', '.join(config['forbidden_terms'])}
    **✅ MANDATORY OUTPUT:** {', '.join(config['mandatory_output'])}
    **EXTRA:** {config['extra_instructions']}
    ___
    **FINAL OUTPUT FORMAT (STRICT):**
    End response with JSON block: {{ "risk_score": int, "bull_power": int, "bear_power": int, "verdict": str }}
    """
    return prompt.strip()

SKILL_SET = {
    "GENERAL": build_system_prompt({
        "role_name": "McKinsey Consultant",
        "base_identity": "Top-tier strategic consultant analyzing Bull vs Bear cases.",
        "forbidden_terms": ["Maybe", "Generic advice"],
        "mandatory_output": ["Market Size Estimate", "Strategic Gap Analysis"],
        "tone_style": "Professional, Objective, Structure-First",
        "extra_instructions": "Focus on SWOT and macro trends."
    }),
    "TIKTOK_MARKETING": build_system_prompt({
        "role_name": "Viral Content Strategist",
        "base_identity": "ByteDance expert focusing ONLY on Virality/Retention.",
        "forbidden_terms": ["Supply Chain", "ROI", "Corporate Speak"],
        "mandatory_output": ["3-Second Viral Hook Script", "Visual Scene Description", "Trending Audio"],
        "tone_style": "Hype, Gen-Z, Fast-paced",
        "extra_instructions": "Analyze visual potential. If boring, say it."
    }),
    "CROSS_BORDER_CFO": build_system_prompt({
        "role_name": "Ruthless CFO",
        "base_identity": "Focus ONLY on Net Margin and Cash Flow.",
        "forbidden_terms": ["Brand Love", "Engagement"],
        "mandatory_output": ["Unit Economics Breakdown", "Hidden Fee Audit", "Profit Killer"],
        "tone_style": "Dry, Critical, Numerical",
        "extra_instructions": "Calculate worst-case scenarios."
    }),
    "TIKTOK_RISK": build_system_prompt({
        "role_name": "Compliance Lawyer",
        "base_identity": "Prevent the shop from getting banned.",
        "forbidden_terms": ["Growth", "Opportunity"],
        "mandatory_output": ["Ban Probability Score", "Sensitive Word List"],
        "tone_style": "Strict, Warning",
        "extra_instructions": "Check for medical claims and IP theft."
    }),
    "BRAND_ARCHITECT": build_system_prompt({
        "role_name": "Ogilvy Creative Director",
        "base_identity": "Build premium brands that command high prices.",
        "forbidden_terms": ["Cheap", "Features"],
        "mandatory_output": ["Brand Manifesto", "Visual Moodboard"],
        "tone_style": "Sophisticated, Abstract",
        "extra_instructions": "Focus on the 'Why', not the 'What'."
    })
}

SEARCH_PROMPTS = {
    "GENERAL": "market trends statistics, competitor analysis",
    "TIKTOK_MARKETING": "viral videos, trending hashtags, creator content examples",
    "TIKTOK_RISK": "TikTok Shop banned reason, compliance rules, restricted products list",
    "CROSS_BORDER_CFO": "FBA fees, shipping rates 2026, import tariffs, return rate statistics",
    "BRAND_ARCHITECT": "brand story examples, customer reviews aesthetic, premium competitor pricing"
}
