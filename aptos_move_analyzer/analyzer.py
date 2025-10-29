"""
Simple analyzer wrapper for querying a single function and returning JSON.
"""

from .indexer import ProjectIndexer
from .query_engine import FunctionQueryEngine


class MoveFunctionAnalyzer:
    """Provide a simple interface for function analysis.

    Usage:
        analyzer = MoveFunctionAnalyzer()
        data = analyzer.analyze_raw("./path/to/project", "module::function")
    """

    def __init__(self):
        self._indexer = ProjectIndexer()
        self._engine = FunctionQueryEngine()

    def analyze_raw(self, project_path: str, function_name: str):
        """Index the project and query a function, returning JSON dict or None."""
        index = self._indexer.index_project(project_path)
        result = self._engine.query_function(index, function_name)
        return result.to_json() if result else None