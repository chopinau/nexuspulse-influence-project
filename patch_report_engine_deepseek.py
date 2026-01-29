import os

target_file = r"D:\my-web-app\BettaFish\report_engine_only.py"

try:
    with open(target_file, "r", encoding="utf-8") as f:
        content = f.read()

    old_code = """def build_agent_config(args) -> Settings:
    \"\"\"基于 .env 配置并融合命令行覆盖项生成最终配置\"\"\"
    config_overrides: Dict[str, Any] = {}

    if args.graphrag_enabled is not None:
        config_overrides["GRAPHRAG_ENABLED"] = args.graphrag_enabled
    if args.graphrag_max_queries is not None:
        if args.graphrag_max_queries <= 0:
            logger.warning("GRAPHRAG_MAX_QUERIES 必须大于 0，本次将继续使用 .env/默认值")
        else:
            config_overrides["GRAPHRAG_MAX_QUERIES"] = args.graphrag_max_queries

    if not config_overrides:
        return global_settings

    return global_settings.model_copy(update=config_overrides)"""

    new_code = """def build_agent_config(args) -> Settings:
    \"\"\"基于 .env 配置并融合命令行覆盖项生成最终配置\"\"\"
    # 强制重新加载配置，确保获取最新的环境变量
    try:
        current_settings = Settings()
    except Exception as e:
        logger.warning(f"重新加载配置失败，使用默认配置: {e}")
        current_settings = global_settings

    config_overrides: Dict[str, Any] = {}

    # 自动适配 DeepSeek (如果用户只配了 Key 没改 URL)
    # 假设 DeepSeek Key 以 sk- 开头，且当前 Base URL 是默认的 aihubmix
    api_key = current_settings.REPORT_ENGINE_API_KEY
    base_url = current_settings.REPORT_ENGINE_BASE_URL
    
    if api_key and api_key.startswith("sk-") and "aihubmix" in (base_url or ""):
        logger.info("🔧 检测到 DeepSeek 风格 API Key，自动切换至 DeepSeek 官方节点")
        config_overrides["REPORT_ENGINE_BASE_URL"] = "https://api.deepseek.com"
        config_overrides["REPORT_ENGINE_MODEL_NAME"] = "deepseek-chat"

    if args.graphrag_enabled is not None:
        config_overrides["GRAPHRAG_ENABLED"] = args.graphrag_enabled
    if args.graphrag_max_queries is not None:
        if args.graphrag_max_queries <= 0:
            logger.warning("GRAPHRAG_MAX_QUERIES 必须大于 0，本次将继续使用 .env/默认值")
        else:
            config_overrides["GRAPHRAG_MAX_QUERIES"] = args.graphrag_max_queries

    if not config_overrides:
        return current_settings

    return current_settings.model_copy(update=config_overrides)"""

    if old_code in content:
        new_content = content.replace(old_code, new_code)
        with open(target_file, "w", encoding="utf-8") as f:
            f.write(new_content)
        print("Success: Patched report_engine_only.py")
    else:
        print("Error: Could not find target code block. Content length:", len(content))
        # Optional: Print a snippet to verify
        print("Snippet:", content[539:600])

except Exception as e:
    print(f"File operation failed: {e}")
