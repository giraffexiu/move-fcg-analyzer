import { SyntaxNode } from 'tree-sitter';
/**
 * Parameter information for a function
 */
export interface ParameterInfo {
    name: string;
    type: string;
}
/**
 * Information about a function call within a function body
 */
export interface CallInfo {
    calledFunction: string;
    calledModule: string;
    calledFilePath: string | null;
    callType: 'direct' | 'qualified' | 'receiver';
}
/**
 * Detailed information about a function
 */
export interface FunctionInfo {
    name: string;
    moduleName: string;
    moduleAddress: string;
    filePath: string;
    startLine: number;
    endLine: number;
    sourceCode: string;
    parameters: ParameterInfo[];
    returnType: string | null;
    visibility: 'public' | 'private' | 'public(friend)' | 'public(package)';
    modifiers: string[];
    astNode: SyntaxNode;
}
/**
 * Information about a struct definition
 */
export interface StructInfo {
    name: string;
    fields: Array<{
        name: string;
        type: string;
    }>;
    abilities: string[];
}
/**
 * Information about a constant definition
 */
export interface ConstantInfo {
    name: string;
    type: string;
    value: string;
}
/**
 * Information about a Move module
 */
export interface ModuleInfo {
    moduleName: string;
    address: string;
    filePath: string;
    functions: FunctionInfo[];
    structs: StructInfo[];
    constants: ConstantInfo[];
}
/**
 * Information about project dependencies
 */
export interface DependencyInfo {
    name: string;
    version?: string;
    path?: string;
}
/**
 * Project-level index containing all modules and functions
 */
export interface ProjectIndex {
    projectPath: string;
    packageName: string;
    modules: Map<string, ModuleInfo>;
    functions: Map<string, FunctionInfo[]>;
    dependencies: DependencyInfo[];
}
/**
 * JSON output format for query results
 */
export interface QueryResultJSON {
    contract: string;
    function: string;
    source: string;
    location: {
        file: string;
        start_line: number;
        end_line: number;
    };
    parameter: Array<{
        name: string;
        type: string;
    }>;
    calls: Array<{
        file: string;
        function: string;
        module: string;
    }>;
}
/**
 * Parsed file result from Tree-sitter
 */
export interface ParsedFile {
    filePath: string;
    tree: any;
    sourceCode: string;
}
/**
 * Function query result
 */
export interface FunctionQueryResult {
    functionInfo: FunctionInfo;
    calls: CallInfo[];
}
//# sourceMappingURL=types.d.ts.map