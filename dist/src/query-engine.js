"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionQueryEngine = void 0;
const call_extractor_1 = require("./call-extractor");
/**
 * FunctionQueryEngine - Provides function query functionality
 */
class FunctionQueryEngine {
    constructor() {
        this.callExtractor = new call_extractor_1.CallExtractor();
    }
    /**
     * Query a function by name in the project index
     * Supports both simple function names and module-qualified names (module::function)
     *
     * @param index - Project index to search in
     * @param functionName - Function name or module-qualified name (e.g., "function" or "module::function")
     * @returns FunctionQueryResult with function info and calls, or null if not found
     */
    queryFunction(index, functionName) {
        // Check if the function name is module-qualified (contains ::)
        const isQualified = functionName.includes('::');
        if (isQualified) {
            return this.queryQualifiedFunction(index, functionName);
        }
        else {
            return this.querySimpleFunction(index, functionName);
        }
    }
    /**
     * Query a simple function name (without module qualification)
     * If multiple functions with the same name exist, returns the first one
     *
     * @param index - Project index to search in
     * @param functionName - Simple function name
     * @returns FunctionQueryResult or null if not found
     */
    querySimpleFunction(index, functionName) {
        // Look up the function in the functions map
        const matchingFunctions = index.functions.get(functionName);
        if (!matchingFunctions || matchingFunctions.length === 0) {
            return null;
        }
        // Return the first matching function
        // In the future, we could handle multiple matches differently
        const functionInfo = matchingFunctions[0];
        return this.assembleFunctionResult(functionInfo, index);
    }
    /**
     * Query a module-qualified function name (module::function or address::module::function)
     *
     * @param index - Project index to search in
     * @param qualifiedName - Module-qualified function name
     * @returns FunctionQueryResult or null if not found
     */
    queryQualifiedFunction(index, qualifiedName) {
        // Parse the qualified name
        const parts = qualifiedName.split('::');
        if (parts.length < 2) {
            return null;
        }
        // Handle both "module::function" and "address::module::function" formats
        let targetModule;
        let targetFunction;
        if (parts.length === 2) {
            // Format: module::function
            targetModule = parts[0];
            targetFunction = parts[1];
        }
        else {
            // Format: address::module::function (or longer chains)
            // Take the last part as function name
            targetFunction = parts[parts.length - 1];
            // Join the rest as module identifier
            targetModule = parts.slice(0, -1).join('::');
        }
        // Look up functions with the target name
        const matchingFunctions = index.functions.get(targetFunction);
        if (!matchingFunctions || matchingFunctions.length === 0) {
            return null;
        }
        // Filter by module name
        for (const func of matchingFunctions) {
            // Check if module name matches
            const funcModuleKey = func.moduleAddress
                ? `${func.moduleAddress}::${func.moduleName}`
                : func.moduleName;
            // Match against both simple module name and fully qualified module name
            if (func.moduleName === targetModule || funcModuleKey === targetModule) {
                return this.assembleFunctionResult(func, index);
            }
        }
        return null;
    }
    /**
     * Query all functions in a specific module
     *
     * @param index - Project index to search in
     * @param moduleName - Module name (can be qualified with address)
     * @returns Array of FunctionInfo objects
     */
    queryModuleFunctions(index, moduleName) {
        const module = index.modules.get(moduleName);
        if (!module) {
            // Try to find module by simple name if qualified name didn't work
            for (const [key, mod] of index.modules.entries()) {
                if (mod.moduleName === moduleName) {
                    return mod.functions;
                }
            }
            return [];
        }
        return module.functions;
    }
    /**
     * Assemble a complete FunctionQueryResult from FunctionInfo
     * This includes extracting the function source code and call information
     *
     * @param functionInfo - Function information to assemble
     * @param index - Project index for resolving call locations
     * @returns FunctionQueryResult with function info and calls
     */
    assembleFunctionResult(functionInfo, index) {
        // Extract calls if index is provided
        const calls = index ? this.callExtractor.extractCalls(functionInfo, index) : [];
        return {
            functionInfo,
            calls,
        };
    }
}
exports.FunctionQueryEngine = FunctionQueryEngine;
//# sourceMappingURL=query-engine.js.map