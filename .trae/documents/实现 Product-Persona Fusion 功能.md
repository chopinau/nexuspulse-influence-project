## 实现 "Product-Persona Fusion" (Cross-Over Analysis) 功能

### 问题分析

当前系统在分析产品（如"Yoga Wear"）和受众（如"Students"）时是分开处理的，没有关注它们的具体交集（如"Affordable Yoga Wear for Dorm Workouts"）。

### 实现计划

#### 1. 更新 `extract_search_components` 函数

* 添加目标受众提取逻辑

* 从查询中识别常见的受众关键词（如"students", "college students", "young professionals"等）

* 在返回的组件中添加 `target_audience` 字段

#### 2. 修改 `analyze_with_llm` 函数

* 添加产品-受众融合逻辑

* 创建 `fusion_context` 字符串

* 构建融合搜索查询：`{product} for {persona} pain points trends reddit`

* 生成融合指令：强制关注产品和受众的交集

#### 3. 更新 `collect_intelligence` 函数

* 使用融合查询进行搜索

* 确保所有子查询都包含产品-受众交集

#### 4. 传递融合指令给所有代理

* 在构建用户提示时添加融合指令

* 确保 Bull、Bear 和 Moderator 都能接收到融合上下文

#### 5. 测试和验证

* 测试不同产品-受众组合

* 验证报告是否包含针对特定交集的分析

### 预期结果

当用户分析 "Yoga Wear for College Students" 时，报告将包含：

* 针对大学生的瑜伽服痛点分析

* 宿舍 workout 场景的具体建议

* 预算友好的产品推荐

* 校园时尚趋势分析

### 技术要点

* 保持向后兼容：当没有特定受众时，使用默认行为

* 确保融合逻辑不会影响其他功能

* 优化搜索查询，提高相关结果的质量

