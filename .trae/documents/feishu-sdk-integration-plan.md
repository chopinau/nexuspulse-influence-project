# PLAN: Integrate Feishu Official Python SDK with FastAPI & CrewAI

## Overview

This plan outlines the integration of the Feishu (Lark) Official Python SDK (`lark-oapi`) with the existing FastAPI backend to fetch ASIN data/pain points from Feishu Bitable, which will then be fed into the CrewAI multi-agent engine for analysis.

***

## Current Architecture Analysis

### Existing Components

| Component     | File                    | Purpose                                            |
| ------------- | ----------------------- | -------------------------------------------------- |
| FastAPI Entry | `main.py`               | API endpoints on port 8001                         |
| CrewAI Engine | `report_engine_only.py` | Multi-agent analysis pipeline (Researcher + Judge) |
| Configuration | `config.py`             | Pydantic-settings based config management          |
| Dependencies  | `requirements.txt`      | Python packages                                    |

### Current API Endpoints

* `GET /` - Health check

* `POST /api/brainstorm` - Generate focus topic

* `POST /api/analyze` - Run CrewAI analysis

### Current Data Flow

```
Frontend Request → FastAPI → CrewAI Agents (Researcher + Judge) → Structured JSON Response
```

***

## Implementation Plan

### Task 1: Add Feishu SDK Dependency

**File:** `python_backend/requirements.txt`

**Change:** Add the official Feishu SDK:

```
lark-oapi>=1.0.0
```

***

### Task 2: Create Feishu Client Module

**File:** `python_backend/feishu_client.py` (NEW)

**Features:**

1. Initialize Feishu SDK Client with `FEISHU_APP_ID` and `FEISHU_APP_SECRET`
2. Implement `get_all_tables(app_token: str)` - Fetch all tables in a Bitable
3. Implement `fetch_table_records(app_token: str, table_id: str, limit: int = 50)` - Fetch and clean records

**Key Implementation Details:**

```python
# Core structure
from lark.oapi import Client, LogLevel

class FeishuClient:
    def __init__(self, app_id: str, app_secret: str):
        self.client = Client.builder() \
            .app_id(app_id) \
            .app_secret(app_secret) \
            .log_level(LogLevel.ERROR) \
            .build()
    
    def get_all_tables(self, app_token: str) -> List[Dict]:
        # Uses bitable.v1.app_table.list
        # Returns [{"table_id": "...", "name": "..."}]
    
    def fetch_table_records(self, app_token: str, table_id: str, limit: int = 50) -> str:
        # Uses bitable.v1.app_table_record.list
        # Cleans and parses JSON into LLM-ready context string
```

**Error Handling:**

* Catch `lark.oapi.core.exception.Error` for SDK-specific errors

* Return meaningful error messages for API responses

* Handle token expiration gracefully (SDK handles auto-refresh)

***

### Task 3: Update Configuration

**File:** `python_backend/config.py`

**Add new settings:**

```python
# Feishu Configuration
FEISHU_APP_ID: Optional[str] = Field(None, description="Feishu App ID")
FEISHU_APP_SECRET: Optional[str] = Field(None, description="Feishu App Secret")
FEISHU_APP_TOKEN: Optional[str] = Field(None, description="Default Feishu Bitable App Token")
```

***

### Task 4: Update FastAPI Router

**File:** `python_backend/main.py`

**New Endpoints:**

1. **`GET /api/feishu/tables`**

   * Returns list of tables for frontend dropdown

   * Uses `FEISHU_APP_TOKEN` from environment

   * Response: `{"tables": [{"table_id": "...", "name": "..."}]}`

2. **Modify** **`POST /api/analyze`**

   * Add optional `table_id` field to `Req` model

   * If `table_id` provided, fetch real data from Feishu

   * Inject fetched data into CrewAI context

**Updated Request Model:**

```python
class Req(BaseModel):
    product: str
    persona: str = "General"
    market: str = "US"
    focus_topic: str = ""
    table_id: Optional[str] = None  # NEW: Feishu table selection
```

***

### Task 5: Integrate Feishu Data with CrewAI

**File:** `python_backend/report_engine_only.py`

**Changes:**

1. Add `feishu_context: str = ""` parameter to `analyze_with_llm()`
2. Inject Feishu data into Researcher Agent's task description
3. Use real data for analysis instead of relying solely on LLM knowledge

**Modified Researcher Task:**

```python
research_task = Task(
    description=f"""
    深度检索 {topic} ({market}市场) 的数据。
    
    【重要：以下是从飞书多维表格获取的真实数据，请优先使用】：
    {feishu_context}
    
    输出一篇包含 SCQA 结构、3个真实竞品 Markdown 对比表格、以及 5 大痛点深度分析的 2000 字中文报告。
    """,
    ...
)
```

***

## Data Flow After Integration

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Frontend (React/Next.js)                      │
│  1. Call GET /api/feishu/tables → Populate dropdown                 │
│  2. User selects table → Call POST /api/analyze with table_id       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (main.py)                         │
│  • Validate request                                                  │
│  • Call FeishuClient.fetch_table_records() if table_id provided     │
│  • Pass feishu_context to CrewAI engine                             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Feishu Client (feishu_client.py)                  │
│  • Authenticate with App ID/Secret (auto token management)          │
│  • Fetch records from Bitable                                        │
│  • Parse and clean data into LLM-ready context string               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CrewAI Engine (report_engine_only.py)             │
│  • Researcher Agent: Uses Feishu data + web knowledge               │
│  • Judge Agent: Scores and evaluates                                │
│  • Output: Structured JSON report                                   │
└─────────────────────────────────────────────────────────────────────┘
```

***

## Environment Variables Required

Add to `.env` file:

```env
FEISHU_APP_ID=cli_xxxxxxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxx
FEISHU_APP_TOKEN=xxxxxxxxxxxxxxxxxxxxxx
```

***

## Files to Create/Modify

| Action | File                                   | Description                     |
| ------ | -------------------------------------- | ------------------------------- |
| CREATE | `python_backend/feishu_client.py`      | Feishu SDK client wrapper       |
| MODIFY | `python_backend/requirements.txt`      | Add `lark-oapi` dependency      |
| MODIFY | `python_backend/config.py`             | Add Feishu configuration fields |
| MODIFY | `python_backend/main.py`               | Add Feishu endpoints            |
| MODIFY | `python_backend/report_engine_only.py` | Accept Feishu context parameter |

***

## Error Handling Strategy

1. **SDK Initialization Errors**: Log warning, disable Feishu features gracefully
2. **API Call Errors**: Return meaningful error messages to frontend
3. **Token Expiration**: SDK handles auto-refresh automatically
4. **Missing Credentials**: Skip Feishu integration, use fallback behavior
5. **Invalid Table ID**: Return 400 error with helpful message

***

## Testing Checklist

* [ ] Feishu SDK initializes correctly with credentials

* [ ] `GET /api/feishu/tables` returns valid table list

* [ ] `POST /api/analyze` works without `table_id` (backward compatible)

* [ ] `POST /api/analyze` with `table_id` fetches and uses Feishu data

* [ ] Error handling works for invalid credentials

* [ ] Error handling works for invalid table\_id

* [ ] CrewAI agents receive and process Feishu context correctly

***

## Implementation Order

1. **Step 1**: Add `lark-oapi` to `requirements.txt`
2. **Step 2**: Add Feishu config fields to `config.py`
3. **Step 3**: Create `feishu_client.py` with full implementation
4. **Step 4**: Update `main.py` with new endpoints
5. **Step 5**: Update `report_engine_only.py` to accept Feishu context
6. **Step 6**: Test all endpoints and integration

***

## Notes

* The Feishu SDK (`lark-oapi`) handles tenant access token management automatically

* Records are limited to 50-100 by default to save LLM tokens

* The integration is backward compatible - existing endpoints work without Feishu

* Field mapping in `fetch_table_records()` should be customized based on actual Bitable schema

