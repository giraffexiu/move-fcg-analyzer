import { ProjectIndex, FunctionInfo, FunctionQueryResult } from './types';
/**
 * FunctionQueryEngine - Provides function query functionality
 */
export declare class FunctionQueryEngine {
    private callExtractor;
    constructor();
    /**
     * Query a function by name in the project index
     * Supports both simple function names and module-qualified names (module::function)
     *
     * @param index - Project index to search in
     * @param functionName - Function name or module-qualified name (e.g., "function" or "module::function")
     * @returns FunctionQueryResult with function info and calls, or null if not found
     */
    queryFunction(index: ProjectIndex, functionName: string): FunctionQueryResult | null;
    /**
     * Query a simple function name (without module qualification)
     * If multiple functions with the same name exist, returns the first one
     *
     * @param index - Project index to search in
     * @param functionName - Simple function name
     * @returns FunctionQueryResult or null if not found
     */
    private querySimpleFunction;
    /**
     * Query a module-qualified function name (module::function or address::module::function)
     *
     * @param index - Project index to search in
     * @param qualifiedName - Module-qualified function name
     * @returns FunctionQueryResult or null if not found
     */
    private queryQualifiedFunction;
    /**
     * Query all functions in a specific module
     *
     * @param index - Project index to search in
     * @param moduleName - Module name (can be qualified with address)
     * @returns Array of FunctionInfo objects
     */
    queryModuleFunctions(index: ProjectIndex, moduleName: string): FunctionInfo[];
    /**
     * Assemble a complete FunctionQueryResult from FunctionInfo
     * This includes extracting the function source code and call information
     *
     * @param functionInfo - Function information to assemble
     * @param index - Project index for resolving call locations
     * @returns FunctionQueryResult with function info and calls
     */
    private assembleFunctionResult;
}
//# sourceMappingURL=query-engine.d.ts.map