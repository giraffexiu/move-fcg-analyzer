"""
Aptos Move Analyzer - Python Library

A Python library for indexing and querying Aptos Move projects.
"""

from .indexer import ProjectIndexer
from .query_engine import FunctionQueryEngine
from .types import (
    FunctionInfo,
    ModuleInfo,
    ParameterInfo,
    CallInfo,
    ProjectIndex,
    QueryResult,
    StructInfo,
    ConstantInfo,
    DependencyInfo,
)

__version__ = "1.0.0"
__all__ = [
    "ProjectIndexer",
    "FunctionQueryEngine",
    "FunctionInfo",
    "ModuleInfo",
    "ParameterInfo",
    "CallInfo",
    "ProjectIndex",
    "QueryResult",
    "StructInfo",
    "ConstantInfo",
    "DependencyInfo",
]
