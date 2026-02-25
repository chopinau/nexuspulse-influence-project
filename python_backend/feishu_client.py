# -*- coding: utf-8 -*-
"""
Feishu (Lark) Bitable Client Module

This module provides a wrapper around the Feishu Official Python SDK (lark-oapi)
for interacting with Feishu Bitable (多维表格) to fetch ASIN data and pain points.

Features:
- Automatic tenant access token management (handled by SDK)
- Fetch all tables within a Bitable
- Fetch and clean records from a specific table
- Convert records to LLM-ready context string

Author: NexusPulse Team
"""

import json
from typing import List, Dict, Optional, Any
from loguru import logger

try:
    import lark_oapi as lark
    from lark_oapi.api.bitable.v1 import (
        ListAppTableRequest,
        ListAppTableRecordRequest,
        GetAppTableRecordRequest,
    )
    FEISHU_SDK_AVAILABLE = True
except ImportError:
    FEISHU_SDK_AVAILABLE = False
    logger.warning("lark-oapi not installed. Feishu integration will be disabled.")


class FeishuClientError(Exception):
    """Custom exception for Feishu client errors."""
    pass


class FeishuClient:
    """
    Feishu Bitable Client for fetching data from Lark/Feishu multi-dimensional tables.
    
    This client uses the official lark-oapi SDK which handles:
    - Automatic tenant access token acquisition and refresh
    - Request signing and authentication
    - Error handling and retries
    
    Usage:
        client = FeishuClient(app_id="cli_xxx", app_secret="xxx")
        tables = client.get_all_tables(app_token="xxx")
        records = client.fetch_table_records(app_token="xxx", table_id="xxx")
    """
    
    def __init__(self, app_id: str, app_secret: str):
        """
        Initialize the Feishu SDK Client.
        
        Args:
            app_id: Feishu application ID (e.g., "cli_xxxxxxxxxx")
            app_secret: Feishu application secret
            
        Raises:
            FeishuClientError: If SDK is not available or initialization fails
        """
        if not FEISHU_SDK_AVAILABLE:
            raise FeishuClientError(
                "lark-oapi SDK is not installed. "
                "Please install it with: pip install lark-oapi>=1.0.0"
            )
        
        if not app_id or not app_secret:
            raise FeishuClientError(
                "Feishu credentials are required. "
                "Please provide FEISHU_APP_ID and FEISHU_APP_SECRET."
            )
        
        self.app_id = app_id
        self.app_secret = app_secret
        
        try:
            self.client = lark.Client.builder() \
                .app_id(app_id) \
                .app_secret(app_secret) \
                .log_level(lark.LogLevel.ERROR) \
                .build()
            logger.info(f"Feishu client initialized successfully for app: {app_id[:10]}...")
        except Exception as e:
            logger.error(f"Failed to initialize Feishu client: {e}")
            raise FeishuClientError(f"Failed to initialize Feishu client: {e}")
    
    def get_all_tables(self, app_token: str) -> List[Dict[str, str]]:
        """
        Fetch all tables within a Bitable (multi-dimensional table).
        
        Uses the SDK's bitable.v1.app_table.list method.
        
        Args:
            app_token: The Bitable app token (can be found in the URL)
            
        Returns:
            List of dictionaries containing table_id and name:
            [{"table_id": "xxx", "name": "Table Name"}, ...]
            
        Raises:
            FeishuClientError: If API call fails
        """
        if not app_token:
            raise FeishuClientError("app_token is required")
        
        try:
            request = ListAppTableRequest.builder() \
                .app_token(app_token) \
                .build()
            
            response = self.client.bitable.v1.app_table.list(request)
            
            if not response.success():
                error_msg = f"Failed to list tables: code={response.code}, msg={response.msg}"
                logger.error(error_msg)
                raise FeishuClientError(error_msg)
            
            tables = []
            if response.data and response.data.items:
                for item in response.data.items:
                    tables.append({
                        "table_id": item.table_id,
                        "name": item.name or "Unnamed Table"
                    })
            
            logger.info(f"Fetched {len(tables)} tables from Bitable: {app_token[:10]}...")
            return tables
            
        except Exception as e:
            logger.error(f"Feishu SDK error while listing tables: {e}")
            raise FeishuClientError(f"Feishu SDK error: {e}")
    
    def fetch_table_records(
        self, 
        app_token: str, 
        table_id: str, 
        limit: int = 50,
        field_names: Optional[List[str]] = None
    ) -> str:
        """
        Fetch records from a specific table and convert to LLM-ready context string.
        
        Uses the SDK's bitable.v1.app_table_record.list method.
        Cleans and parses the returned JSON into a consolidated string context
        suitable for LLM consumption.
        
        Args:
            app_token: The Bitable app token
            table_id: The specific table ID to fetch records from
            limit: Maximum number of records to fetch (default: 50, max: 100)
            field_names: Optional list of specific field names to extract.
                        If None, extracts all fields.
            
        Returns:
            A formatted string containing the records data, ready for LLM context.
            
        Raises:
            FeishuClientError: If API call fails
        """
        if not app_token or not table_id:
            raise FeishuClientError("Both app_token and table_id are required")
        
        limit = min(max(1, limit), 100)
        
        try:
            request = ListAppTableRecordRequest.builder() \
                .app_token(app_token) \
                .table_id(table_id) \
                .page_size(limit) \
                .build()
            
            response = self.client.bitable.v1.app_table_record.list(request)
            
            if not response.success():
                error_msg = f"Failed to list records: code={response.code}, msg={response.msg}"
                logger.error(error_msg)
                raise FeishuClientError(error_msg)
            
            records_data = []
            if response.data and response.data.items:
                for item in response.data.items:
                    record = self._parse_record(item, field_names)
                    if record:
                        records_data.append(record)
            
            context = self._format_records_for_llm(records_data)
            logger.info(f"Fetched {len(records_data)} records from table: {table_id[:10]}...")
            return context
            
        except Exception as e:
            logger.error(f"Feishu SDK error while fetching records: {e}")
            raise FeishuClientError(f"Feishu SDK error: {e}")
    
    def _parse_record(
        self, 
        record_item: Any, 
        field_names: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Parse a single record from Feishu API response.
        
        Feishu Bitable fields can have various types. This method extracts
        the actual values from the field objects.
        
        Args:
            record_item: The record item from API response
            field_names: Optional list of specific fields to extract
            
        Returns:
            Dictionary with field names as keys and extracted values
        """
        if not record_item or not hasattr(record_item, 'fields'):
            return {}
        
        result = {}
        fields = record_item.fields or {}
        
        for field_name, field_value in fields.items():
            if field_names and field_name not in field_names:
                continue
            
            extracted_value = self._extract_field_value(field_value)
            result[field_name] = extracted_value
        
        if hasattr(record_item, 'record_id'):
            result['_record_id'] = record_item.record_id
        
        return result
    
    def _extract_field_value(self, field_value: Any) -> Any:
        """
        Extract the actual value from a Feishu field object.
        
        Feishu field types include:
        - text: string
        - number: number
        - singleSelect: {id: string, text: string}
        - multiSelect: [{id: string, text: string}, ...]
        - date: timestamp in milliseconds
        - checkbox: boolean
        - user: [{id: string, name: string}, ...]
        - link: string
        - attachment: [{file_token: string, name: string, ...}, ...]
        
        Args:
            field_value: The raw field value from Feishu
            
        Returns:
            Extracted and simplified value
        """
        if field_value is None:
            return None
        
        if isinstance(field_value, str):
            return field_value
        
        if isinstance(field_value, (int, float, bool)):
            return field_value
        
        if isinstance(field_value, list):
            extracted = []
            for item in field_value:
                if isinstance(item, dict):
                    if 'text' in item:
                        extracted.append(item['text'])
                    elif 'name' in item:
                        extracted.append(item['name'])
                    elif 'value' in item:
                        extracted.append(item['value'])
                    else:
                        extracted.append(str(item))
                else:
                    extracted.append(item)
            return extracted if len(extracted) > 1 else (extracted[0] if extracted else None)
        
        if isinstance(field_value, dict):
            if 'text' in field_value:
                return field_value['text']
            elif 'name' in field_value:
                return field_value['name']
            elif 'value' in field_value:
                return field_value['value']
            else:
                return str(field_value)
        
        return str(field_value)
    
    def _format_records_for_llm(self, records: List[Dict[str, Any]]) -> str:
        """
        Format records into a string suitable for LLM context.
        
        Creates a structured markdown-like format that is easy for LLMs to parse.
        
        Args:
            records: List of parsed record dictionaries
            
        Returns:
            Formatted string for LLM consumption
        """
        if not records:
            return "【暂无数据】\n飞书多维表格中没有找到任何记录。"
        
        lines = []
        lines.append(f"【飞书多维表格数据】共 {len(records)} 条记录：\n")
        
        for idx, record in enumerate(records, 1):
            lines.append(f"### 记录 {idx}")
            for key, value in record.items():
                if key.startswith('_'):
                    continue
                if value is not None:
                    if isinstance(value, list):
                        value_str = ', '.join(str(v) for v in value)
                    else:
                        value_str = str(value)
                    lines.append(f"- **{key}**: {value_str}")
            lines.append("")
        
        return "\n".join(lines)
    
    def fetch_raw_records(
        self, 
        app_token: str, 
        table_id: str, 
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Fetch raw records as a list of dictionaries (without LLM formatting).
        
        Useful when you need the raw data for further processing.
        
        Args:
            app_token: The Bitable app token
            table_id: The specific table ID
            limit: Maximum number of records to fetch
            
        Returns:
            List of record dictionaries
        """
        if not app_token or not table_id:
            raise FeishuClientError("Both app_token and table_id are required")
        
        limit = min(max(1, limit), 100)
        
        try:
            request = ListAppTableRecordRequest.builder() \
                .app_token(app_token) \
                .table_id(table_id) \
                .page_size(limit) \
                .build()
            
            response = self.client.bitable.v1.app_table_record.list(request)
            
            if not response.success():
                raise FeishuClientError(f"Failed to list records: {response.msg}")
            
            records = []
            if response.data and response.data.items:
                for item in response.data.items:
                    record = self._parse_record(item)
                    if record:
                        records.append(record)
            
            return records
            
        except Exception as e:
            logger.error(f"Error fetching raw records: {e}")
            raise FeishuClientError(f"Error fetching raw records: {e}")
    
    def save_report_to_feishu(
        self, 
        app_token: str, 
        table_id: str, 
        report_data: Dict[str, Any]
    ) -> bool:
        """
        Save analysis report back to Feishu Bitable (Data Flywheel).
        
        Creates a new record with the analysis results, enabling the data flywheel
        where generated insights are saved back for future reference and training.
        
        Args:
            app_token: The Bitable app token
            table_id: The target table ID to save the report
            report_data: Dictionary containing:
                - query: ASIN or search query
                - verdict: GO/CAUTION/KILL
                - final_summary: One-line summary
                - dashboard_agents: 6-dimension scores
                - markdown_report: Full markdown report
                - timestamp: ISO format timestamp
                
        Returns:
            True if save was successful, False otherwise
        """
        if not FEISHU_SDK_AVAILABLE:
            logger.warning("Feishu SDK not available, skipping report save")
            return False
            
        if not app_token or not table_id:
            logger.warning("app_token or table_id not provided, skipping report save")
            return False
        
        from datetime import datetime
        
        try:
            from lark_oapi.api.bitable.v1 import CreateAppTableRecordRequest
            
            fields = {
                "查询关键词": report_data.get("query", ""),
                "时间戳": datetime.now().isoformat(),
                "裁决结果": report_data.get("verdict", "UNKNOWN"),
                "核心结论": report_data.get("final_summary", "")[:500],
                "合规分数": report_data.get("dashboard_agents", {}).get("compliance", {}).get("score", 0),
                "供应链分数": report_data.get("dashboard_agents", {}).get("supply", {}).get("score", 0),
                "增长分数": report_data.get("dashboard_agents", {}).get("growth", {}).get("score", 0),
                "需求分数": report_data.get("dashboard_agents", {}).get("pain", {}).get("score", 0),
                "文化分数": report_data.get("dashboard_agents", {}).get("culture", {}).get("score", 0),
                "选品分数": report_data.get("dashboard_agents", {}).get("selection", {}).get("score", 0),
                "完整报告": report_data.get("markdown_report", "")[:10000],
            }
            
            request = CreateAppTableRecordRequest.builder() \
                .app_token(app_token) \
                .table_id(table_id) \
                .request_body({
                    "fields": fields
                }) \
                .build()
            
            response = self.client.bitable.v1.app_table_record.create(request)
            
            if not response.success():
                error_msg = f"Failed to save report to Feishu: code={response.code}, msg={response.msg}"
                logger.error(error_msg)
                return False
            
            logger.info(f"✅ Report saved to Feishu successfully: {report_data.get('query', 'Unknown')}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving report to Feishu: {e}")
            return False


def create_feishu_client_from_env() -> Optional[FeishuClient]:
    """
    Create a FeishuClient instance using environment variables.
    
    Reads FEISHU_APP_ID and FEISHU_APP_SECRET from environment.
    
    Returns:
        FeishuClient instance if credentials are available, None otherwise
    """
    import os
    
    app_id = os.environ.get("FEISHU_APP_ID")
    app_secret = os.environ.get("FEISHU_APP_SECRET")
    
    if not app_id or not app_secret:
        logger.warning("Feishu credentials not found in environment variables")
        return None
    
    try:
        return FeishuClient(app_id, app_secret)
    except FeishuClientError as e:
        logger.error(f"Failed to create Feishu client: {e}")
        return None
