import { FunctionInfo, CallInfo, ProjectIndex } from './types';
/**
 * CallExtractor - Extracts function call information from function bodies
 */
export declare class CallExtractor {
    /**
     * Extract all function calls from a function's body
     * @param functionInfo - Function to analyze
     * @param index - Project index for resolving call locations
     * @returns Array of CallInfo objects
     */
    extractCalls(functionInfo: FunctionInfo, index: ProjectIndex): CallInfo[];
    /**
     * Find the function body node
     * @param funcNode - Function declaration node
     * @returns Function body node or null
     */
    private findFunctionBody;
    /**
     * Find all call expression nodes in the AST
     * Identifies: call_expr, receiver_call, macro_call_expr
     * @param node - Starting node (typically function body)
     * @returns Array of call expression nodes
     */
    private findCallExpressions;
    /**
     * Extract call information from a call expression node
     * @param callNode - Call expression AST node
     * @param functionInfo - The function containing this call
     * @param index - Project index for resolving call locations
     * @param sourceCode - Full source code of the file
     * @returns CallInfo object or null
     */
    private extractCallInfo;
    /**
     * Determine the type of function call
     * @param callNode - Call expression node
     * @returns Call type: 'direct', 'qualified', or 'receiver'
     */
    private determineCallType;
    /**
     * Extract function name and module path from a call expression
     * @param callNode - Call expression node
     * @param sourceCode - Full source code of the file
     * @returns Object with functionName and modulePath
     */
    private extractFunctionName;
    /**
     * Extract function name from a receiver call (e.g., obj.method())
     * @param callNode - Receiver call node
     * @param sourceCode - Source code string
     * @returns Object with functionName and modulePath
     */
    private extractReceiverCallName;
    /**
     * Extract function name from a direct call expression
     * @param callNode - Call expression node
     * @param sourceCode - Source code string
     * @returns Object with functionName and modulePath
     */
    private extractDirectCallName;
    /**
     * Extract function name from a macro call expression
     * @param callNode - Macro call expression node
     * @param sourceCode - Source code string
     * @returns Object with functionName and modulePath
     */
    private extractMacroCallName;
    /**
     * Parse a name_access_chain to extract module path and function name
     * @param chainNode - name_access_chain node
     * @param sourceCode - Source code string
     * @returns Object with functionName and modulePath
     */
    private parseNameAccessChain;
    /**
     * Helper function to find a child node by type
     * @param node - Parent node
     * @param type - Child node type
     * @returns First matching child node or null
     */
    private findChildByType;
    /**
     * Helper function to get the text content of a node
     * @param node - AST node
     * @param sourceCode - Source code string
     * @returns Text content of the node
     */
    private getNodeText;
    /**
     * Find the location (file path) of a called function in the project index
     * @param functionName - Name of the called function
     * @param modulePath - Module path (if qualified)
     * @param index - Project index
     * @returns File path or null if not found (external dependency)
     */
    private findCallLocation;
}
//# sourceMappingURL=call-extractor.d.ts.map