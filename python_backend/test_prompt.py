from agent_skills import SKILL_SET

print("TESTING SKILL LOADING...")
tiktok_prompt = SKILL_SET.get("TIKTOK_MARKETING")

if tiktok_prompt:
    print("Key Found!")
    if "Viral Hook" in tiktok_prompt:
        print("NEW PROMPT IS ACTIVE! (Contains 'Viral Hook')")
    else:
        print("OLD PROMPT DETECTED! (Missing 'Viral Hook')")
        print("Content sample:", tiktok_prompt[:100])
else:
    print("Key NOT Found!")