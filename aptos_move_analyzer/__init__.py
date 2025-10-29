"""
Aptos Move Analyzer - Python Library

A Python library for analyzing Aptos Move projects.
This is a lightweight wrapper around the TypeScript indexer.
"""

from .analyzer import MoveFunctionAnalyzer

__version__ = "1.0.0"
__all__ = [
    "MoveFunctionAnalyzer",
]
