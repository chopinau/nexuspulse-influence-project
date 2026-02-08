## Implementation Plan: ReportView\.tsx Integration

### Step 1: Create ReportView\.tsx Component

* **File Location:** `frontend/components/ReportView.tsx`

* **Props Interface:** `interface ReportViewProps { report: any; }`

### Step 2: Import Required Components

```tsx
import KeyInsightCards from './visualizations/KeyInsightCards';
import StrategicRadar from './visualizations/StrategicRadar';
import InventoryDonut from './visualizations/InventoryDonut';
import LogicFlow from '../LogicFlow';
```

### Step 3: Data Extraction & Safety Checks

```tsx
const vizData = report.visualization_data || {};
const structData = report.structured_data || {};
```

### Step 4: Implement "Cockpit" Layout

#### Top Section: Key Insight Cards

```tsx
<KeyInsightCards
  riskScore={structData.risk_score || 0}
  heatIndex={structData.heat_index || 0}
  impactScore={structData.impact_score || 0}
/>
```

#### Middle Section: Responsive Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
  <StrategicRadar data={vizData.radar_data || []} />
  <InventoryDonut data={vizData.inventory_mix || []} />
</div>
```

#### Bottom Section: Details & Logic Flow

```tsx
<LogicFlow code={report.mermaid_code} />

<details className="mt-6 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl overflow-hidden">
  <summary className="p-4 font-medium text-white cursor-pointer">
    📜 Read Full Strategy Briefing & Debate Logs
  </summary>
  <div className="p-4 border-t border-gray-800">
    <div className="prose prose-invert max-w-none">
      {report.full_markdown_report}
    </div>
  </div>
</details>
```

### Step 5: Add Styling & Responsiveness

* Maintain cyberpunk/tech aesthetic

* Ensure proper spacing and alignment

* Add loading states and error handling

* Implement responsive design for different screen sizes

### Step 6: Export Component

```tsx
export default ReportView;
```

### Expected Outcome

A clean, modular ReportView component that:

* Accepts dynamic report data from backend

* Displays key insights at a glance

* Provides interactive visualizations

* Keeps detailed information accessible but collapsed

* Maintains the cyberpunk styling aesthetic

