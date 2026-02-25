# NexusPulse V3.0 数据飞轮修复计划

## 问题诊断

### 当前问题
1. **后端输出不一致**: `report_engine_only.py` 返回的数据结构与前端期望不完全匹配
2. **飞书写回缺失**: 分析完成后没有将结果保存回飞书 (Data Flywheel 未完成)
3. **前端数据绑定问题**: `StrategicDashboard.tsx` 使用硬编码默认值 50，而非动态数据
4. **Terminal 动画不够真实**: 缺少黑客终端风格的视觉效果
5. **分数颜色静态**: 没有根据分数动态变化颜色

---

## Phase 1: 后端数据飞轮与严格输出

### 1.1 修复 `report_engine_only.py` - 严格 Pydantic 输出

**问题**: 当前返回结构中 `agents` 字段名与前端期望的 `dashboard_agents` 不一致

**修改内容**:
```python
# 修改返回结构，确保字段名一致
return {
    "structured_data": {
        "verdict": verdict,
        "final_summary": data.get('final_summary', ''),
        "dashboard_agents": data.get('dashboard_agents', {}),  # 统一使用 dashboard_agents
        "agents": data.get('dashboard_agents', {}),  # 兼容旧版
        "charts": {...},
        "mermaid_code": mermaid,
        "news": [],
        "full_report": deep_report,
        "deep_report_markdown": deep_report  # 添加此字段
    }
}
```

### 1.2 添加飞书写回功能 - `feishu_client.py`

**新增方法**: `save_report_to_feishu()`

```python
def save_report_to_feishu(
    self, 
    app_token: str, 
    table_id: str, 
    report_data: Dict[str, Any]
) -> bool:
    """
    Save analysis report back to Feishu Bitable.
    
    Creates a new record with:
    - ASIN/Query
    - Timestamp
    - Verdict
    - JSON payload
    - Markdown report
    """
```

### 1.3 更新 `main.py` - 集成飞书写回

**修改 `/api/analyze` 端点**:
- 在返回响应前，调用 `save_report_to_feishu()`
- 添加环境变量 `FEISHU_REPORT_TABLE_ID` 配置目标表格

---

## Phase 2: 前端逻辑与状态绑定

### 2.1 修复 `page.tsx` - EXECUTE 流程

**当前问题**: 
- 数据绑定逻辑正确，但需要确保字段名匹配
- 需要添加平滑过渡动画

**修改内容**:
```typescript
// 确保正确提取数据
const aData = await aRes.json();

// 统一字段访问
setReport(aData.structured_data?.deep_report_markdown || 
           aData.structured_data?.full_report || "");
setVizData({
  verdict: aData.structured_data?.verdict,
  final_summary: aData.structured_data?.final_summary,
  dashboard_agents: aData.structured_data?.dashboard_agents || 
                    aData.structured_data?.agents,
  charts: aData.structured_data?.charts,
  ...aData.structured_data
});
```

### 2.2 修复 `StrategicDashboard.tsx` - 动态分数颜色

**新增函数**: `getScoreColor(score: number)`

```typescript
const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-500';
  if (score >= 50) return 'text-orange-400';
  return 'text-red-500 animate-pulse';
};

const getScoreBgColor = (score: number): string => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 50) return 'bg-orange-400';
  return 'bg-red-500';
};
```

**修改 ProCard 组件**: 使用动态颜色替代硬编码

### 2.3 TypeScript 接口对齐

**更新 `DashboardData` 接口**:
```typescript
interface DashboardData {
  verdict?: string;
  final_summary?: string;
  dashboard_agents?: Record<string, AgentData>;
  agents?: Record<string, AgentData>;  // 兼容
  charts?: {...};
  news?: Array<{...}>;
  competitors?: Array<{...}>;
  deep_report_markdown?: string;  // 新增
  full_report?: string;  // 兼容
}
```

---

## Phase 3: UI/UX 打磨与 "Geek-Chic" 风格

### 3.1 Terminal 真实感增强 - `AgentThinkingTerminal.tsx`

**新增特性**:
1. **闪烁光标**: CSS 动画 `animate-blink`
2. **文字发光效果**: `text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]`
3. **平滑滚动**: 自动滚动到最新日志
4. **打字机效果**: 日志逐字显示
5. **扫描线效果**: CRT 显示器风格

**CSS 新增**:
```css
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

@keyframes scanline {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}

.animate-blink { animation: blink 1s infinite; }
.animate-scanline { animation: scanline 8s linear infinite; }
```

### 3.2 分数颜色动态化 - `StrategicDashboard.tsx`

**每个 ProCard 的分数显示**:
```tsx
<div className={`text-3xl font-black font-mono ${getScoreColor(score)}`}>
  {score}
</div>
<div className={`h-full ${getScoreBgColor(score)}`} 
     style={{width: `${score}%`}} />
```

### 3.3 Tab 切换过渡动画

**添加到 `page.tsx`**:
```tsx
<div className={`transition-all duration-300 ease-in-out ${
  activeLeftTab === 'terminal' 
    ? 'opacity-100 translate-x-0' 
    : 'opacity-0 translate-x-4 absolute'
}`}>
```

---

## 执行步骤

### Step 1: 后端修复
1. 修改 `python_backend/report_engine_only.py`
   - 统一返回字段名
   - 添加 `deep_report_markdown` 字段
   
2. 修改 `python_backend/feishu_client.py`
   - 添加 `save_report_to_feishu()` 方法
   
3. 修改 `python_backend/main.py`
   - 集成飞书写回功能
   - 添加新环境变量配置

### Step 2: 前端修复
1. 修改 `app/dashboard/page.tsx`
   - 统一字段访问逻辑
   - 添加过渡动画
   
2. 修改 `components/StrategicDashboard.tsx`
   - 添加动态分数颜色函数
   - 更新 ProCard 组件
   
3. 修改 `components/AgentThinkingTerminal.tsx`
   - 添加终端真实感效果
   - 添加自动滚动功能

### Step 3: 测试验证
1. 启动后端服务
2. 启动前端服务
3. 执行完整流程测试
4. 验证飞书写回功能

---

## 文件修改清单

| 文件路径 | 修改类型 | 说明 |
|---------|---------|------|
| `python_backend/report_engine_only.py` | 修改 | 统一输出结构 |
| `python_backend/feishu_client.py` | 新增方法 | 添加写回功能 |
| `python_backend/main.py` | 修改 | 集成飞书写回 |
| `app/dashboard/page.tsx` | 修改 | 数据绑定+过渡动画 |
| `components/StrategicDashboard.tsx` | 修改 | 动态分数颜色 |
| `components/AgentThinkingTerminal.tsx` | 修改 | 终端真实感效果 |
| `app/globals.css` | 新增 | 动画关键帧 |

---

## 预期效果

1. **数据流完整**: 前端正确接收并显示后端返回的所有数据
2. **飞书飞轮**: 分析结果自动保存回飞书，形成数据闭环
3. **视觉升级**: 终端效果更加真实，分数颜色动态变化
4. **用户体验**: 平滑的过渡动画，专业级 SaaS 体验
