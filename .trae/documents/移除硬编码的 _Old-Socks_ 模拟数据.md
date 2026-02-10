## 问题分析

当前报告生成器在没有提供库存数据时，使用硬编码的 "Old-Socks" 字符串作为库存分析的 SKU 名称，当用户分析 "Toothbrushes" 时，这看起来很荒谬。

## 解决方案

### 步骤 1：修改 report_engine_only.py 文件

1. **定位问题代码**：在 `analyze_with_llm` 函数中，找到硬编码的模拟库存数据：
   ```python
   if inventory_data:
       target_inventory = inventory_data
   else:
       # Default mock if nothing provided
       target_inventory = [{'sku': 'Old-Socks', 'stock': 5000, 'daily_sales': 2}] 
   ```

2. **实现动态 SKU 生成**：
   - 基于用户的 `topic` 生成 SKU 名称
   - 例如：`f"Stagnant-{topic.replace(' ', '-')}-Gen1"`

3. **根据 strategy_mode 调整模拟数据**：
   - 增长模式 (`growth`)：显示更高的库存水平和销售速度
   - 孵化模式 (`incubation`)：显示中等的库存水平和销售速度
   - 其他模式：使用默认值

### 步骤 2：验证修改

1. **确保修改后的代码能够正确生成基于 topic 的 SKU 名称**
2. **确保模拟数据根据 strategy_mode 有所不同**
3. **确保报告生成流程正常工作**

## 预期结果

- 当用户分析 "Toothbrushes" 时，SKU 名称会变成 "Stagnant-Toothbrushes-Gen1"
- 当用户选择 "growth" 策略模式时，库存数据会显示更高的水平
- 当用户选择 "incubation" 策略模式时，库存数据会显示中等的水平
- 报告中的库存分析会更加符合用户的实际分析主题