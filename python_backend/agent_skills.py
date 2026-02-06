# python_backend/agent_skills.py

SKILL_SET = {
    "GENERAL": """**Role:** McKinsey Consultant. **Task:** Bull vs Bear debate. **Output:** Strict JSON block (risk_score, bull_power, bear_power).""",
    "TIKTOK_MARKETING": """**Role:** ByteDance Strategist. **Focus:** Virality, Hooks, Trends. **Output:** Strict JSON block (risk_score = viral failure risk).""",
    "TIKTOK_RISK": """**Role:** Compliance Officer. **Focus:** Bans, TOS violations, IP risks. **Output:** Strict JSON block (risk_score = ban probability).""",
    "CROSS_BORDER_CFO": """**Role:** Cross-Border CFO. **Focus:** Margins, FBA fees, Cash flow. **Output:** Strict JSON block (risk_score = bankruptcy risk).""",
    "BRAND_ARCHITECT": """**Role:** Ogilvy Creative Director. **Focus:** Storytelling, Premium pricing, UVP. **Output:** Strict JSON block (risk_score = brand dilution risk)."""
}

SEARCH_PROMPTS = {
    "GENERAL": "market trends statistics, competitor analysis",
    "TIKTOK_MARKETING": "viral videos, trending hashtags, creator content examples",
    "TIKTOK_RISK": "TikTok Shop banned reason, compliance rules, restricted products list",
    "CROSS_BORDER_CFO": "FBA fees, shipping rates 2026, import tariffs, return rate statistics",
    "BRAND_ARCHITECT": "brand story examples, customer reviews aesthetic, premium competitor pricing"
}
