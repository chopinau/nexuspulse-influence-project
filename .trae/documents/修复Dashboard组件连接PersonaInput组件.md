# 修复Dashboard组件连接PersonaInput组件

## 问题分析

用户提供的Dashboard组件存在以下问题：

1. **导入方式错误**：使用了默认导入 `import PersonaInput from "@/components/PersonaInput"`，但PersonaInput组件是命名导出

2. **属性缺失**：调用PersonaInput组件时只传递了 `onSubmit={handleMainExecute}`，但PersonaInput组件需要多个必需属性

3. **状态管理缺失**：缺少PersonaInput组件所需的状态：
   - mode
   - strategyMode
   - loadingText
   - category

4. **回调函数缺失**：缺少PersonaInput组件的回调函数：
   - onModeChange
   - onStrategyModeChange

## 修复方案

### 1. 修复导入方式
将默认导入改为命名导入：
```typescript
import { PersonaInput } from "@/components/PersonaInput";
```

### 2. 添加必要的状态管理
在Dashboard组件中添加缺失的状态：
```typescript
const [mode, setMode] = useState<string>("GENERAL");
const [strategyMode, setStrategyMode] = useState<'incubation' | 'growth'>('incubation');
const [loadingText, setLoadingText] = useState<string>("");
const [category, setCategory] = useState<string>("");
```

### 3. 同步加载状态
在handleMainExecute函数中同步设置loadingText状态：
```typescript
setIsLoading(true);
setLoadingText("📡 正在接入全球情报网络 (Tavily)...");
setStatus("📡 正在接入全球情报网络 (Tavily)...");

// 后续更新
setLoadingText(`🎯 锁定战术锚点: "${bData.focus_topic}"... 正在进行多空推演...`);
setStatus(`🎯 锁定战术锚点: "${bData.focus_topic}"... 正在进行多空推演...`);
```

### 4. 正确传递组件属性
更新PersonaInput组件调用，传递所有必需属性：
```tsx
<PersonaInput 
  mode={mode}
  onModeChange={setMode}
  strategyMode={strategyMode}
  onStrategyModeChange={setStrategyMode}
  category={category}
  onExecute={handleMainExecute}
  isLoading={isLoading}
  loadingText={loadingText}
/>
```

### 5. 确保API调用逻辑正确
验证API调用逻辑，确保与FastAPI后端端点正确匹配：
- `/api/brainstorm` 端点
- `/api/analyze` 端点

## 预期结果

修复后，Dashboard组件应该能够：
1. 正确加载和显示PersonaInput组件
2. 处理用户输入并调用FastAPI后端
3. 显示分析结果和右侧的Live Dynamics面板
4. 提供良好的用户体验，包括加载状态和错误处理

## 技术要点

- **组件导入**：正确区分默认导出和命名导出
- **属性传递**：确保传递所有必需的组件属性
- **状态管理**：维护组件之间的状态同步
- **API调用**：正确处理异步API调用和错误处理
- **用户体验**：提供清晰的加载状态和错误提示