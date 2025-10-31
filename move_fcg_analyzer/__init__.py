"""
Move FCG Analyzer - Python Library

A Python library for analyzing Move projects with function call graph analysis.
This is a lightweight wrapper around the TypeScript indexer.
"""

from .analyzer import MoveFunctionAnalyzer

__version__ = "1.1.0"
__all__ = [
    "MoveFunctionAnalyzer",
]
