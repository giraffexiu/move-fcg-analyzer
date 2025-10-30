"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallExtractor = void 0;
const fs = __importStar(require("fs"));
/**
 * CallExtractor - Extracts function call information from function bodies
 */
class CallExtractor {
    /**
     * Extract all function calls from a function's body
     * @param functionInfo - Function to analyze
     * @param index - Project index for resolving call locations
     * @returns Array of CallInfo objects
     */
    extractCalls(functionInfo, index) {
        const calls = [];
        const astNode = functionInfo.astNode;
        // Read the full source code from the file
        const fullSourceCode = fs.readFileSync(functionInfo.filePath, 'utf-8');
        // Find the function body
        const bodyNode = this.findFunctionBody(astNode);
        if (!bodyNode) {
            return calls;
        }
        // Traverse the function body and identify all call expressions
        const callNodes = this.findCallExpressions(bodyNode);
        // Extract call information from each call node
        for (const callNode of callNodes) {
            const callInfo = this.extractCallInfo(callNode, functionInfo, index, fullSourceCode);
            if (callInfo) {
                calls.push(callInfo);
            }
        }
        return calls;
    }
    /**
     * Find the function body node
     * @param funcNode - Function declaration node
     * @returns Function body node or null
     */
    findFunctionBody(funcNode) {
        // Look for block (function body) or expression_list
        for (const child of funcNode.children) {
            if (child.type === 'block' || child.type === 'expression_list') {
                return child;
            }
        }
        return null;
    }
    /**
     * Find all call expression nodes in the AST
     * Identifies: call_expr, receiver_call, macro_call_expr
     * @param node - Starting node (typically function body)
     * @returns Array of call expression nodes
     */
    findCallExpressions(node) {
        const callNodes = [];
        const traverse = (current) => {
            // Check if this is a call expression
            if (current.type === 'call_expr' ||
                current.type === 'receiver_call' ||
                current.type === 'macro_call_expr') {
                callNodes.push(current);
            }
            // Recursively traverse children
            for (const child of current.children) {
                traverse(child);
            }
        };
        traverse(node);
        return callNodes;
    }
    /**
     * Extract call information from a call expression node
     * @param callNode - Call expression AST node
     * @param functionInfo - The function containing this call
     * @param index - Project index for resolving call locations
     * @param sourceCode - Full source code of the file
     * @returns CallInfo object or null
     */
    extractCallInfo(callNode, functionInfo, index, sourceCode) {
        const callType = this.determineCallType(callNode);
        const { functionName, modulePath } = this.extractFunctionName(callNode, sourceCode);
        if (!functionName) {
            return null;
        }
        // Construct the full function signature
        const calledFunction = modulePath ? `${modulePath}::${functionName}` : functionName;
        const calledModule = modulePath || functionInfo.moduleName;
        // Find the location of the called function
        const calledFilePath = this.findCallLocation(functionName, modulePath, index);
        return {
            calledFunction,
            calledModule,
            calledFilePath,
            callType,
        };
    }
    /**
     * Determine the type of function call
     * @param callNode - Call expression node
     * @returns Call type: 'direct', 'qualified', or 'receiver'
     */
    determineCallType(callNode) {
        if (callNode.type === 'receiver_call') {
            return 'receiver';
        }
        // Check if it's a qualified call (contains name_access_chain)
        const hasNameAccessChain = this.findChildByType(callNode, 'name_access_chain') !== null;
        if (hasNameAccessChain) {
            return 'qualified';
        }
        return 'direct';
    }
    /**
     * Extract function name and module path from a call expression
     * @param callNode - Call expression node
     * @param sourceCode - Full source code of the file
     * @returns Object with functionName and modulePath
     */
    extractFunctionName(callNode, sourceCode) {
        if (callNode.type === 'receiver_call') {
            return this.extractReceiverCallName(callNode, sourceCode);
        }
        else if (callNode.type === 'call_expr') {
            return this.extractDirectCallName(callNode, sourceCode);
        }
        else if (callNode.type === 'macro_call_expr') {
            return this.extractMacroCallName(callNode, sourceCode);
        }
        return { functionName: '', modulePath: null };
    }
    /**
     * Extract function name from a receiver call (e.g., obj.method())
     * @param callNode - Receiver call node
     * @param sourceCode - Source code string
     * @returns Object with functionName and modulePath
     */
    extractReceiverCallName(callNode, sourceCode) {
        // In receiver calls, look for the method identifier
        // Structure: receiver_call has access_field and identifier children
        // The identifier after the last '.' is the method name
        // Find all identifier nodes
        const identifiers = callNode.children.filter(child => child.type === 'identifier');
        if (identifiers.length > 0) {
            // The last identifier is the method name
            const functionName = this.getNodeText(identifiers[identifiers.length - 1], sourceCode);
            return { functionName, modulePath: null };
        }
        return { functionName: '', modulePath: null };
    }
    /**
     * Extract function name from a direct call expression
     * @param callNode - Call expression node
     * @param sourceCode - Source code string
     * @returns Object with functionName and modulePath
     */
    extractDirectCallName(callNode, sourceCode) {
        // Check if there's a name_access_chain directly (qualified call like module::function)
        const nameAccessChain = this.findChildByType(callNode, 'name_access_chain');
        if (nameAccessChain) {
            return this.parseNameAccessChain(nameAccessChain, sourceCode);
        }
        // Look for func_name child
        const funcNameNode = this.findChildByType(callNode, 'func_name');
        if (funcNameNode) {
            // Check if func_name contains a name_access_chain
            const nestedChain = this.findChildByType(funcNameNode, 'name_access_chain');
            if (nestedChain) {
                return this.parseNameAccessChain(nestedChain, sourceCode);
            }
            // Simple function name
            const identifierNode = this.findChildByType(funcNameNode, 'identifier');
            if (identifierNode) {
                const functionName = this.getNodeText(identifierNode, sourceCode);
                return { functionName, modulePath: null };
            }
        }
        // Try to find identifier directly
        const identifierNode = this.findChildByType(callNode, 'identifier');
        if (identifierNode) {
            const functionName = this.getNodeText(identifierNode, sourceCode);
            return { functionName, modulePath: null };
        }
        return { functionName: '', modulePath: null };
    }
    /**
     * Extract function name from a macro call expression
     * @param callNode - Macro call expression node
     * @param sourceCode - Source code string
     * @returns Object with functionName and modulePath
     */
    extractMacroCallName(callNode, sourceCode) {
        // Check if there's a name_access_chain (qualified macro call)
        const nameAccessChain = this.findChildByType(callNode, 'name_access_chain');
        if (nameAccessChain) {
            return this.parseNameAccessChain(nameAccessChain, sourceCode);
        }
        // Simple macro name
        const identifierNode = this.findChildByType(callNode, 'identifier');
        if (identifierNode) {
            const functionName = this.getNodeText(identifierNode, sourceCode);
            return { functionName, modulePath: null };
        }
        return { functionName: '', modulePath: null };
    }
    /**
     * Parse a name_access_chain to extract module path and function name
     * @param chainNode - name_access_chain node
     * @param sourceCode - Source code string
     * @returns Object with functionName and modulePath
     */
    parseNameAccessChain(chainNode, sourceCode) {
        // name_access_chain contains identifiers separated by ::
        const identifiers = [];
        const traverse = (node) => {
            if (node.type === 'identifier') {
                identifiers.push(this.getNodeText(node, sourceCode));
            }
            for (const child of node.children) {
                traverse(child);
            }
        };
        traverse(chainNode);
        if (identifiers.length === 0) {
            return { functionName: '', modulePath: null };
        }
        if (identifiers.length === 1) {
            // Just a function name
            return { functionName: identifiers[0], modulePath: null };
        }
        // Last identifier is the function name, rest is the module path
        const functionName = identifiers[identifiers.length - 1];
        const modulePath = identifiers.slice(0, -1).join('::');
        return { functionName, modulePath };
    }
    /**
     * Helper function to find a child node by type
     * @param node - Parent node
     * @param type - Child node type
     * @returns First matching child node or null
     */
    findChildByType(node, type) {
        return node.children.find(child => child.type === type) || null;
    }
    /**
     * Helper function to get the text content of a node
     * @param node - AST node
     * @param sourceCode - Source code string
     * @returns Text content of the node
     */
    getNodeText(node, sourceCode) {
        return sourceCode.substring(node.startIndex, node.endIndex);
    }
    /**
     * Find the location (file path) of a called function in the project index
     * @param functionName - Name of the called function
     * @param modulePath - Module path (if qualified)
     * @param index - Project index
     * @returns File path or null if not found (external dependency)
     */
    findCallLocation(functionName, modulePath, index) {
        // Look up the function in the project index
        const matchingFunctions = index.functions.get(functionName);
        if (!matchingFunctions || matchingFunctions.length === 0) {
            // Function not found in project - likely an external dependency
            return null;
        }
        // If module path is specified, filter by module
        if (modulePath) {
            for (const func of matchingFunctions) {
                // Check if the module matches
                // Handle both simple module names and fully qualified names (address::module)
                const funcModuleKey = func.moduleAddress
                    ? `${func.moduleAddress}::${func.moduleName}`
                    : func.moduleName;
                if (func.moduleName === modulePath || funcModuleKey === modulePath) {
                    return func.filePath;
                }
            }
            // Module-qualified function not found in project
            return null;
        }
        // No module path specified - return the first match
        // In a real scenario, we might want to prioritize functions in the same module
        return matchingFunctions[0].filePath;
    }
}
exports.CallExtractor = CallExtractor;
//# sourceMappingURL=call-extractor.js.map