## 初始化知识库目录结构

### 目标
为NexusPulse系统创建一个结构化的RAG（检索增强生成）知识库，用于组织不同类型的电子商务数据。

### 目录结构
在`data/knowledge/`目录下创建以下子目录：

1. **brand_assets/** - 品牌资产（品牌故事、语气、标志等）
2. **product_specs/** - 产品规格（手册、技术规格、竞争对手分析等）
3. **compliance_rules/** - 合规规则（FDA/CE法规、平台政策等）
4. **marketing_sop/** - 营销SOP（病毒脚本、影响者 outreach、电子邮件等）
5. **financial_logic/** - 财务逻辑（库存计算公式、损益规则等）
6. **inbox/** - 收件箱（原始、未处理的文件）

### 文档创建
在`data/knowledge/`目录下创建`README.md`文件，包含：

- 每个文件夹应包含的文件类型说明
- 示例文件名（例如：`compliance_rules/fda_2026_battery.md`）
- 给未来AI代理的注意事项："添加新知识时，始终检查哪个类别最适合。"

### 执行步骤
1. 创建6个指定的子目录
2. 创建并编写README.md文件
3. 保留现有的`amazon_q1_strategy.md`文件