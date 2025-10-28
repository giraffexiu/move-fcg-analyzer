"""
Function query engine for Aptos Move projects
"""

from typing import Optional, List
from .types import ProjectIndex, FunctionInfo, QueryResult, CallInfo
from .call_extractor import CallExtractor


class FunctionQueryEngine:
    """Provides function query functionality"""

    def __init__(self):
        self.call_extractor = CallExtractor()

    def query_function(self, index: ProjectIndex, function_name: str) -> Optional[QueryResult]:
        """
        Query a function by name in the project index
        
        Supports both simple function names and module-qualified names (module::function)
        
        Args:
            index: Project index to search in
            function_name: Function name or module-qualified name
            
        Returns:
            QueryResult with function info and calls, or None if not found
        """
        is_qualified = '::' in function_name
        
        if is_qualified:
            return self._query_qualified_function(index, function_name)
        else:
            return self._query_simple_function(index, function_name)

    def _query_simple_function(self, index: ProjectIndex, function_name: str) -> Optional[QueryResult]:
        """Query a simple function name (without module qualification)"""
        matching_functions = index.functions.get(function_name)
        
        if not matching_functions:
            return None
        
        # Return the first matching function
        function_info = matching_functions[0]
        return self._assemble_function_result(function_info, index)

    def _query_qualified_function(self, index: ProjectIndex, qualified_name: str) -> Optional[QueryResult]:
        """Query a module-qualified function name"""
        parts = qualified_name.split('::')
        
        if len(parts) < 2:
            return None
        
        # Handle both "module::function" and "address::module::function" formats
        if len(parts) == 2:
            target_module = parts[0]
            target_function = parts[1]
        else:
            target_function = parts[-1]
            target_module = '::'.join(parts[:-1])
        
        # Look up functions with the target name
        matching_functions = index.functions.get(target_function)
        
        if not matching_functions:
            return None
        
        # Filter by module name
        for func in matching_functions:
            func_module_key = f"{func.module_address}::{func.module_name}" if func.module_address else func.module_name
            
            if func.module_name == target_module or func_module_key == target_module:
                return self._assemble_function_result(func, index)
        
        return None

    def query_module_functions(self, index: ProjectIndex, module_name: str) -> List[FunctionInfo]:
        """
        Query all functions in a specific module
        
        Args:
            index: Project index to search in
            module_name: Module name (can be qualified with address)
            
        Returns:
            List of FunctionInfo objects
        """
        module = index.modules.get(module_name)
        
        if not module:
            # Try to find module by simple name
            for mod in index.modules.values():
                if mod.module_name == module_name:
                    return mod.functions
            return []
        
        return module.functions

    def _assemble_function_result(self, function_info: FunctionInfo, index: ProjectIndex) -> QueryResult:
        """Assemble a complete QueryResult from FunctionInfo"""
        calls = self.call_extractor.extract_calls(function_info, index)
        
        return QueryResult(
            function_info=function_info,
            calls=calls,
        )
