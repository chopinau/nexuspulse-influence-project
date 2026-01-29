import os

file_path = r"D:\my-web-app\BettaFish\config.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

search_str = 'LOG_FILE: str = Field("logs/app.log", description="日志文件路径")'
replace_str = """LOG_FILE: str = Field("logs/app.log", description="日志文件路径")

    # ================== 报告输出配置 ====================
    OUTPUT_DIR: str = Field("final_reports", description="最终报告输出目录")
    CHAPTER_OUTPUT_DIR: str = Field("final_reports/chapters", description="章节中间文件输出目录")
    DOCUMENT_IR_OUTPUT_DIR: str = Field("final_reports/ir", description="文档中间表示输出目录")"""

if search_str in content and "CHAPTER_OUTPUT_DIR" not in content:
    new_content = content.replace(search_str, replace_str)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Successfully patched config.py")
else:
    print("Config already patched or search string not found")
