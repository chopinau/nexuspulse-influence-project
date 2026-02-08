# -*- coding: utf-8 -*-
import json
from typing import List, Dict

class SimpleRAG:
    def __init__(self):
        self.chunks = []

    def ingest(self, text: str, doc_id: str):
        """
        Split text into chunks (e.g., 500 chars) and store in a local list.
        """
        chunk_size = 500
        for i in range(0, len(text), chunk_size):
            chunk_content = text[i:i + chunk_size]
            self.chunks.append({
                "doc_id": doc_id,
                "content": chunk_content,
                "chunk_id": i // chunk_size
            })

    def query(self, topic: str) -> str:
        """
        Simple keyword matching to find relevant chunks.
        Returns a formatted string of relevant knowledge.
        """
        keywords = topic.lower().split()
        relevant_chunks = []
        
        for chunk in self.chunks:
            content_lower = chunk["content"].lower()
            # Score based on keyword overlap
            score = sum(1 for k in keywords if k in content_lower)
            if score > 0:
                relevant_chunks.append((score, chunk))
        
        # Sort by score desc and take top 3
        relevant_chunks.sort(key=lambda x: x[0], reverse=True)
        top_chunks = [c[1] for c in relevant_chunks[:3]]
        
        if not top_chunks:
            return "No specific internal knowledge found."
            
        result = "### INTERNAL KNOWLEDGE BASE (RAG)\n"
        for c in top_chunks:
            result += f"- [{c['doc_id']}] ...{c['content']}...\n"
            
        return result
