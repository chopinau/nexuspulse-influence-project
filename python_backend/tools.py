import re

def audit_inventory_health(sku_data: list):
    """
    Advanced Inventory Logic based on Amazon IPI & Thrasio-style Audits.
    Metrics: Days of Supply (DOS) and Sell-Through Rate (STR).
    """
    report = []
    report.append("📉 [RUTHLESS CFO INVENTORY AUDIT]")
    
    for item in sku_data:
        sku = item.get('sku', 'Unknown')
        stock = item.get('stock', 0)
        daily_sales = item.get('daily_sales', 0.0)
        
        # 1. Calculate Days of Supply (DOS)
        if daily_sales <= 0:
            dos = 999
        else:
            dos = round(stock / daily_sales, 1)
            
        # 2. Calculate Sell-Through Rate (STR) approx
        # Formula: Sales (90 days) / Avg Inventory. Assuming current stock is avg for simplicity.
        sales_90_days = daily_sales * 90
        if stock > 0:
            str_score = round(sales_90_days / stock, 2)
        else:
            str_score = 0

        # 3. Logic Judgment (The "Ruthless" Part)
        status = "🟢 HEALTHY"
        action = "Maintain velocity."
        
        if dos > 180:
            status = "🔴 TOXIC ASSET (死库存)"
            action = f"LIQUIDATE NOW. STR is {str_score} (Target > 2.0). You are paying 'Aged Inventory Surcharge'."
        elif dos > 90:
            status = "🟠 BLOATED (臃肿)"
            action = "Run Lightning Deal. Your IPI score is at risk."
        elif dos < 21:
            status = "⚠️ STOCKOUT RISK"
            action = "Air Freight immediately if lead time > 15 days."
            
        report.append(f"📦 SKU: {sku} | DOS: {dos} days | STR: {str_score}")
        report.append(f"   Status: {status}")
        report.append(f"   👉 Order: {action}")
        
    return "\n".join(report)

def check_listing_compliance(text: str):
    """
    Compliance Logic based on Amazon Restricted Products & FTC Guidelines (2025).
    """
    text_lower = text.lower()
    flags = []
    
    # 1. The "Pesticide" Trap (Bio-claims)
    # Words like "antimicrobial" trigger pesticide review unless EPA registered.
    bio_triggers = ["antimicrobial", "anti-bacterial", "antibacterial", "disinfects", "repels insects"]
    for word in bio_triggers:
        if word in text_lower:
            flags.append(f"🛑 CRITICAL: '{word}' -> Triggers 'Pesticide' review. Remove unless you have EPA ID.")

    # 2. The "Medical" Trap (FDA claims)
    # Claims to cure or treat diseases are strictly banned for non-drugs.
    med_triggers = ["cure", "heals", "treats", "prevents infection", "eliminates pain"]
    for word in med_triggers:
        if word in text_lower:
            flags.append(f"🛑 CRITICAL: '{word}' -> FDA Violation. Product classifies as unapproved drug.")

    # 3. The "Subjective" Trap (Listing Suppression)
    # Amazon suppresses "satisfaction guarantees" or unverifiable superlatives.
    subj_triggers = ["best seller", "money back guarantee", "satisfaction guaranteed", "perfect gift"]
    for word in subj_triggers:
        if word in text_lower:
            flags.append(f"⚠️ WARNING: '{word}' -> Subjective claim. High risk of Listing Suppression.")

    if not flags:
        return "✅ [COMPLIANCE PASSED]: No obvious restricted keywords found."
    
    return "🛡️ [PARANOID COMPLIANCE REPORT]\n" + "\n".join(flags)

def generate_viral_structure(product_name: str, pain_point: str):
    """
    TikTok Logic based on 'Hook-Value-CTA' framework.
    """
    return f"""
📱 [TIKTOK VIRAL BLUEPRINT]
**Strategy: The Negative Hook (Proven +45% Retention)**

1. **The Hook (0-3s):** "Stop using {product_name} the wrong way!" (Visual: Person throwing a generic version in trash)
2. **The Agitation (3-8s):** "I bet you're tired of {pain_point}, right?" (Visual: Zoom in on the problem)
3. **The Solution (8-15s):** "That's why I switched to this..." (Visual: ASMR unboxing/usage of your product)
4. **The CTA (15s+):** "Link in bio to fix this today." (Visual: Text overlay with arrow)

**Trending Audio Recommendation:** Look for 'High Energy' beats or 'Spoken Word' overlays (ROI +1pt).
"""
