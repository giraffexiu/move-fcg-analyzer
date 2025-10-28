"""
Project indexer for Aptos Move projects
"""

import os
import re
from pathlib import Path
from typing import List, Dict
from tree_sitter import Language, Parser
from .types import (
    ProjectIndex,
    ModuleInfo,
    FunctionInfo,
    ParameterInfo,
    StructInfo,
    ConstantInfo,
    DependencyInfo,
)


class ProjectIndexer:
    """Scans and indexes Aptos Move projects"""

    def __init__(self, language_path: str = None):
        """
        Initialize the project indexer
        
        Args:
            language_path: Path to the tree-sitter Move language library
                          If None, will try to use the Python binding
        """
        try:
            # Try to import the Python binding
            import tree_sitter_move_on_aptos
            
            self.language = Language(tree_sitter_move_on_aptos.language(), "move_aptos")
            self.parser = Parser()
            self.parser.set_language(self.language)
        except ImportError:
            raise RuntimeError(
                "Tree-sitter Move language binding not found. "
                "Please install the Python binding first:\n"
                "  pip install ./bindings/python\n"
                "Or build from source:\n"
                "  cd bindings/python && pip install -e ."
            )

    def index_project(self, project_path: str) -> ProjectIndex:
        """
        Index an Aptos Move project
        
        Args:
            project_path: Path to the project root directory
            
        Returns:
            ProjectIndex containing all modules and functions
        """
        project_path = os.path.abspath(project_path)
        
        if not os.path.exists(project_path):
            raise FileNotFoundError(f"Project path does not exist: {project_path}")
        
        if not os.path.isdir(project_path):
            raise NotADirectoryError(f"Project path is not a directory: {project_path}")
        
        # Parse Move.toml
        package_name, dependencies = self._parse_move_toml(project_path)
        
        # Scan for .move files
        move_files = self._scan_move_files(project_path)
        
        # Build index
        modules, functions = self._build_index(project_path, move_files)
        
        return ProjectIndex(
            project_path=project_path,
            package_name=package_name,
            modules=modules,
            functions=functions,
            dependencies=dependencies,
        )

    def reindex_project(self, project_path: str) -> ProjectIndex:
        """Alias for index_project"""
        return self.index_project(project_path)

    def _scan_move_files(self, dir_path: str) -> List[str]:
        """Scan directory recursively for .move files"""
        move_files = []
        
        for root, dirs, files in os.walk(dir_path):
            # Skip hidden directories and common ignore patterns
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', 'build']]
            
            for file in files:
                if file.endswith('.move'):
                    move_files.append(os.path.join(root, file))
        
        return move_files

    def _parse_move_toml(self, project_path: str) -> tuple:
        """Parse Move.toml configuration file"""
        toml_path = os.path.join(project_path, 'Move.toml')
        package_name = 'unknown'
        dependencies = []
        
        if not os.path.exists(toml_path):
            return package_name, dependencies
        
        try:
            with open(toml_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Parse package name
            package_match = re.search(r'\[package\][\s\S]*?name\s*=\s*["\']([^"\']+)["\']', content)
            if package_match:
                package_name = package_match.group(1)
            
            # Parse dependencies
            deps_match = re.search(r'\[dependencies\]([\s\S]*?)(?=\[|$)', content)
            if deps_match:
                deps_section = deps_match.group(1)
                dep_pattern = re.compile(r'(\w+)\s*=\s*\{([^}]+)\}')
                
                for match in dep_pattern.finditer(deps_section):
                    dep_name = match.group(1)
                    dep_config = match.group(2)
                    
                    dep = DependencyInfo(name=dep_name)
                    
                    version_match = re.search(r'version\s*=\s*["\']([^"\']+)["\']', dep_config)
                    if version_match:
                        dep.version = version_match.group(1)
                    
                    path_match = re.search(r'(?:local|path)\s*=\s*["\']([^"\']+)["\']', dep_config)
                    if path_match:
                        dep.path = path_match.group(1)
                    
                    dependencies.append(dep)
        
        except Exception as e:
            print(f"Error parsing Move.toml: {e}")
        
        return package_name, dependencies

    def _build_index(self, project_path: str, move_files: List[str]) -> tuple:
        """Build the project index from parsed files"""
        modules = {}
        functions = {}
        
        for file_path in move_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    source_code = f.read()
                
                tree = self.parser.parse(bytes(source_code, 'utf-8'))
                
                # Extract modules
                file_modules = self._extract_modules(tree.root_node, file_path, source_code)
                
                # Extract functions
                file_functions = self._extract_functions(tree.root_node, file_path, source_code)
                
                # Add modules to index
                for module in file_modules:
                    module_functions = [f for f in file_functions if f.module_name == module.module_name]
                    module.functions = module_functions
                    
                    module_key = f"{module.address}::{module.module_name}" if module.address else module.module_name
                    modules[module_key] = module
                
                # Add functions to function map
                for func in file_functions:
                    if func.name not in functions:
                        functions[func.name] = []
                    functions[func.name].append(func)
            
            except Exception as e:
                print(f"Error parsing file {file_path}: {e}")
                continue
        
        return modules, functions

    def _extract_modules(self, root_node, file_path: str, source_code: str) -> List[ModuleInfo]:
        """Extract module information from AST"""
        modules = []
        
        def traverse(node):
            if node.type == 'module_definition':
                module_info = self._parse_module(node, file_path, source_code)
                if module_info:
                    modules.append(module_info)
            
            for child in node.children:
                traverse(child)
        
        traverse(root_node)
        return modules

    def _parse_module(self, node, file_path: str, source_code: str) -> ModuleInfo:
        """Parse a module definition node"""
        module_name = ''
        address = ''
        
        for child in node.children:
            if child.type == 'module_identity':
                # Extract address and module name
                identifiers = [c for c in child.children if c.type == 'identifier']
                if len(identifiers) >= 2:
                    address = source_code[identifiers[0].start_byte:identifiers[0].end_byte]
                    module_name = source_code[identifiers[1].start_byte:identifiers[1].end_byte]
                elif len(identifiers) == 1:
                    module_name = source_code[identifiers[0].start_byte:identifiers[0].end_byte]
        
        return ModuleInfo(
            module_name=module_name,
            address=address,
            file_path=file_path,
        )

    def _extract_functions(self, root_node, file_path: str, source_code: str) -> List[FunctionInfo]:
        """Extract function information from AST"""
        functions = []
        current_module = ''
        current_address = ''
        
        def traverse(node, module_name='', module_addr=''):
            nonlocal current_module, current_address
            
            if node.type == 'module_definition':
                # Update current module context
                for child in node.children:
                    if child.type == 'module_identity':
                        identifiers = [c for c in child.children if c.type == 'identifier']
                        if len(identifiers) >= 2:
                            current_address = source_code[identifiers[0].start_byte:identifiers[0].end_byte]
                            current_module = source_code[identifiers[1].start_byte:identifiers[1].end_byte]
                        elif len(identifiers) == 1:
                            current_module = source_code[identifiers[0].start_byte:identifiers[0].end_byte]
            
            if node.type == 'function_definition':
                func_info = self._parse_function(node, file_path, source_code, current_module, current_address)
                if func_info:
                    functions.append(func_info)
            
            for child in node.children:
                traverse(child, current_module, current_address)
        
        traverse(root_node)
        return functions

    def _parse_function(self, node, file_path: str, source_code: str, module_name: str, module_address: str) -> FunctionInfo:
        """Parse a function definition node"""
        func_name = ''
        parameters = []
        return_type = None
        visibility = 'private'
        modifiers = []
        
        # Extract function name
        for child in node.children:
            if child.type == 'identifier':
                func_name = source_code[child.start_byte:child.end_byte]
                break
        
        # Extract visibility and modifiers
        for child in node.children:
            if child.type in ['public', 'entry', 'inline', 'native']:
                if child.type == 'public':
                    visibility = 'public'
                else:
                    modifiers.append(child.type)
        
        # Extract parameters
        for child in node.children:
            if child.type == 'function_parameters':
                parameters = self._parse_parameters(child, source_code)
        
        # Extract return type
        for child in node.children:
            if child.type == 'ret_type':
                return_type = source_code[child.start_byte:child.end_byte].strip()
        
        # Get source code
        func_source = source_code[node.start_byte:node.end_byte]
        start_line = source_code[:node.start_byte].count('\n') + 1
        end_line = source_code[:node.end_byte].count('\n') + 1
        
        return FunctionInfo(
            name=func_name,
            module_name=module_name,
            module_address=module_address,
            file_path=file_path,
            start_line=start_line,
            end_line=end_line,
            source_code=func_source,
            parameters=parameters,
            return_type=return_type,
            visibility=visibility,
            modifiers=modifiers,
        )

    def _parse_parameters(self, params_node, source_code: str) -> List[ParameterInfo]:
        """Parse function parameters"""
        parameters = []
        
        for child in params_node.children:
            if child.type == 'function_parameter':
                param_name = ''
                param_type = ''
                
                for param_child in child.children:
                    if param_child.type == 'identifier':
                        param_name = source_code[param_child.start_byte:param_child.end_byte]
                    elif param_child.type in ['type', 'primitive_type', 'apply_type']:
                        param_type = source_code[param_child.start_byte:param_child.end_byte]
                
                if param_name:
                    parameters.append(ParameterInfo(name=param_name, type=param_type))
        
        return parameters
