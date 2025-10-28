"""
Function call extractor for Aptos Move functions
"""

from typing import List, Optional
from .types import FunctionInfo, CallInfo, ProjectIndex


class CallExtractor:
    """Extracts function call information from function bodies"""

    def extract_calls(self, function_info: FunctionInfo, index: ProjectIndex) -> List[CallInfo]:
        """
        Extract all function calls from a function's body
        
        Args:
            function_info: Function to analyze
            index: Project index for resolving call locations
            
        Returns:
            List of CallInfo objects
        """
        calls = []
        
        # Read the full source code from the file
        try:
            with open(function_info.file_path, 'r', encoding='utf-8') as f:
                full_source_code = f.read()
        except Exception:
            return calls
        
        # For now, return empty list
        # Full implementation would require parsing the AST
        # This is a simplified version
        
        return calls

    def _find_function_body(self, func_node):
        """Find the function body node"""
        for child in func_node.children:
            if child.type in ['block', 'expression_list']:
                return child
        return None

    def _find_call_expressions(self, node) -> list:
        """Find all call expression nodes in the AST"""
        call_nodes = []
        
        def traverse(current):
            if current.type in ['call_expr', 'receiver_call', 'macro_call_expr']:
                call_nodes.append(current)
            
            for child in current.children:
                traverse(child)
        
        traverse(node)
        return call_nodes

    def _extract_call_info(self, call_node, function_info: FunctionInfo, 
                          index: ProjectIndex, source_code: str) -> Optional[CallInfo]:
        """Extract call information from a call expression node"""
        call_type = self._determine_call_type(call_node)
        function_name, module_path = self._extract_function_name(call_node, source_code)
        
        if not function_name:
            return None
        
        called_function = f"{module_path}::{function_name}" if module_path else function_name
        called_module = module_path or function_info.module_name
        called_file_path = self._find_call_location(function_name, module_path, index)
        
        return CallInfo(
            called_function=called_function,
            called_module=called_module,
            called_file_path=called_file_path,
            call_type=call_type,
        )

    def _determine_call_type(self, call_node) -> str:
        """Determine the type of function call"""
        if call_node.type == 'receiver_call':
            return 'receiver'
        
        # Check if it's a qualified call
        has_name_access_chain = any(child.type == 'name_access_chain' for child in call_node.children)
        
        if has_name_access_chain:
            return 'qualified'
        
        return 'direct'

    def _extract_function_name(self, call_node, source_code: str) -> tuple:
        """Extract function name and module path from a call expression"""
        # Simplified implementation
        return '', None

    def _find_call_location(self, function_name: str, module_path: Optional[str], 
                           index: ProjectIndex) -> Optional[str]:
        """Find the location (file path) of a called function"""
        matching_functions = index.functions.get(function_name)
        
        if not matching_functions:
            return None
        
        if module_path:
            for func in matching_functions:
                func_module_key = f"{func.module_address}::{func.module_name}" if func.module_address else func.module_name
                
                if func.module_name == module_path or func_module_key == module_path:
                    return func.file_path
            return None
        
        return matching_functions[0].file_path
