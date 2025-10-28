"""
Type definitions for Aptos Move Analyzer
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional


@dataclass
class ParameterInfo:
    """Function parameter information"""
    name: str
    type: str


@dataclass
class CallInfo:
    """Information about a function call"""
    called_function: str  # 完整签名
    called_module: str
    called_file_path: Optional[str]
    call_type: str  # 'direct', 'qualified', or 'receiver'


@dataclass
class StructInfo:
    """Information about a struct definition"""
    name: str
    fields: List[Dict[str, str]]
    abilities: List[str]


@dataclass
class ConstantInfo:
    """Information about a constant definition"""
    name: str
    type: str
    value: str


@dataclass
class FunctionInfo:
    """Detailed information about a function"""
    name: str
    module_name: str
    module_address: str
    file_path: str
    start_line: int
    end_line: int
    source_code: str
    parameters: List[ParameterInfo]
    return_type: Optional[str]
    visibility: str  # 'public', 'private', 'public(friend)', 'public(package)'
    modifiers: List[str]  # 'inline', 'native', 'entry'


@dataclass
class ModuleInfo:
    """Information about a Move module"""
    module_name: str
    address: str
    file_path: str
    functions: List[FunctionInfo] = field(default_factory=list)
    structs: List[StructInfo] = field(default_factory=list)
    constants: List[ConstantInfo] = field(default_factory=list)


@dataclass
class DependencyInfo:
    """Information about project dependencies"""
    name: str
    version: Optional[str] = None
    path: Optional[str] = None


@dataclass
class ProjectIndex:
    """Project-level index containing all modules and functions"""
    project_path: str
    package_name: str
    modules: Dict[str, ModuleInfo]
    functions: Dict[str, List[FunctionInfo]]
    dependencies: List[DependencyInfo]


@dataclass
class QueryResult:
    """Function query result"""
    function_info: FunctionInfo
    calls: List[CallInfo]

    def to_json(self) -> dict:
        """Convert query result to JSON format"""
        return {
            "contract": self.function_info.module_name,
            "function": f"{self.function_info.module_name}::{self.function_info.name}",
            "source": self.function_info.source_code,
            "location": {
                "file": self.function_info.file_path,
                "start_line": self.function_info.start_line,
                "end_line": self.function_info.end_line,
            },
            "parameter": [
                {"name": p.name, "type": p.type}
                for p in self.function_info.parameters
            ],
            "calls": [
                {
                    "file": call.called_file_path or "",
                    "function": call.called_function,
                    "module": call.called_module,
                }
                for call in self.calls
            ],
        }
