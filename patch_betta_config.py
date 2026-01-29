import os

file_path = r"D:\my-web-app\BettaFish\config.py"
try:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    search_str = '# ====================== 数据库配置 ======================'
    replace_str = '# ================== 日志配置 ====================\n    LOG_FILE: str = Field("logs/app.log", description="日志文件路径")\n\n    # ====================== 数据库配置 ======================'

    if search_str in content and "LOG_FILE" not in content:
        new_content = content.replace(search_str, replace_str)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print("Successfully patched config.py")
    else:
        print("Content not found or already patched")
except Exception as e:
    print(f"Error: {e}")
