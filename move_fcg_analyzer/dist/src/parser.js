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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveParser = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const tree_sitter_1 = __importDefault(require("tree-sitter"));
/**
 * MoveParser - Parses Move source files using Tree-sitter
 */
class MoveParser {
    constructor() {
        this.parser = new tree_sitter_1.default();
        // Load the Move language grammar
        // The tree-sitter-move parser is built as a native module
        const languagePath = path.join(__dirname, '../../build/Release/tree_sitter_move_binding.node');
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const MoveLanguage = require(languagePath);
            this.parser.setLanguage(MoveLanguage);
        }
        catch (error) {
            throw new Error(`Failed to load Move language parser: ${error}`);
        }
    }
    /**
     * Parse a Move source file
     * @param filePath - Path to the .move file
     * @returns ParsedFile object containing the AST and source code
     */
    parseFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        const sourceCode = fs.readFileSync(filePath, 'utf-8');
        const tree = this.parser.parse(sourceCode);
        return {
            filePath,
            tree,
            sourceCode,
        };
    }
    /**
     * Helper function to traverse AST and find nodes by type
     * @param node - Starting node
     * @param type - Node type to search for
     * @returns Array of matching nodes
     */
    findNodesByType(node, type) {
        const results = [];
        const traverse = (current) => {
            if (current.type === type) {
                results.push(current);
            }
            for (const child of current.children) {
                traverse(child);
            }
        };
        traverse(node);
        return results;
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
     * Helper function to find a child node by type
     * @param node - Parent node
     * @param type - Child node type
     * @returns First matching child node or null
     */
    findChildByType(node, type) {
        return node.children.find(child => child.type === type) || null;
    }
    /**
     * Helper function to find all child nodes by type
     * @param node - Parent node
     * @param type - Child node type
     * @returns Array of matching child nodes
     */
    findChildrenByType(node, type) {
        return node.children.filter(child => child.type === type);
    }
    /**
     * Extract modules from the AST
     * @param tree - Parsed tree
     * @param filePath - Path to the source file
     * @param sourceCode - Source code string
     * @returns Array of ModuleInfo objects
     */
    extractModules(tree, filePath, sourceCode) {
        const modules = [];
        const moduleNodes = this.findNodesByType(tree.rootNode, 'module');
        for (const moduleNode of moduleNodes) {
            // Skip nested 'module' keyword nodes
            if (moduleNode.childCount === 0) {
                continue;
            }
            // Extract module address and name
            // Module structure: module <address>::<module_name> { ... }
            // Children are: [module keyword, identifier, ::, identifier, {, declarations..., }]
            let address = '';
            let moduleName = '';
            // Find identifier nodes (should be address and module name)
            const identifiers = this.findChildrenByType(moduleNode, 'identifier');
            if (identifiers.length >= 2) {
                // First identifier is address, second is module name
                address = this.getNodeText(identifiers[0], sourceCode);
                moduleName = this.getNodeText(identifiers[1], sourceCode);
            }
            else if (identifiers.length === 1) {
                // Only module name, no address
                moduleName = this.getNodeText(identifiers[0], sourceCode);
            }
            modules.push({
                moduleName,
                address,
                filePath,
                functions: [],
                structs: [],
                constants: [],
            });
        }
        return modules;
    }
    /**
     * Extract functions from the AST
     * @param tree - Parsed tree
     * @param filePath - Path to the source file
     * @param sourceCode - Source code string
     * @returns Array of FunctionInfo objects
     */
    extractFunctions(tree, filePath, sourceCode) {
        const functions = [];
        // First, find the module to get module name and address
        const moduleNodes = this.findNodesByType(tree.rootNode, 'module');
        for (const moduleNode of moduleNodes) {
            // Skip nested 'module' keyword nodes
            if (moduleNode.childCount === 0) {
                continue;
            }
            // Extract module address and name from identifiers
            const identifiers = this.findChildrenByType(moduleNode, 'identifier');
            let moduleAddress = '';
            let moduleName = '';
            if (identifiers.length >= 2) {
                moduleAddress = this.getNodeText(identifiers[0], sourceCode);
                moduleName = this.getNodeText(identifiers[1], sourceCode);
            }
            else if (identifiers.length === 1) {
                moduleName = this.getNodeText(identifiers[0], sourceCode);
            }
            // Find all function declarations within this module
            const functionNodes = this.findNodesByType(moduleNode, 'function_decl');
            for (const funcNode of functionNodes) {
                const functionInfo = this.extractFunctionInfo(funcNode, moduleName, moduleAddress, filePath, sourceCode);
                if (functionInfo) {
                    functions.push(functionInfo);
                }
            }
        }
        return functions;
    }
    /**
     * Extract detailed information from a function declaration node
     * @param funcNode - Function declaration AST node
     * @param moduleName - Name of the containing module
     * @param moduleAddress - Address of the containing module
     * @param filePath - Path to the source file
     * @param sourceCode - Source code string
     * @returns FunctionInfo object or null
     */
    extractFunctionInfo(funcNode, moduleName, moduleAddress, filePath, sourceCode) {
        // Extract function name
        const nameNode = this.findChildByType(funcNode, 'identifier');
        if (!nameNode) {
            return null;
        }
        const functionName = this.getNodeText(nameNode, sourceCode);
        // Extract visibility and modifiers from parent declaration node
        const declarationNode = funcNode.parent;
        const visibility = this.extractVisibility(declarationNode, funcNode, sourceCode);
        const modifiers = this.extractModifiers(declarationNode, funcNode, sourceCode);
        // Extract parameters
        const parameters = this.extractParameters(funcNode, sourceCode);
        // Extract return type
        const returnType = this.extractReturnType(funcNode, sourceCode);
        // Extract source code and location
        // Use the declaration node for full source if available, otherwise use function node
        const sourceNode = declarationNode && declarationNode.type === 'declaration' ? declarationNode : funcNode;
        const startLine = sourceNode.startPosition.row + 1; // Tree-sitter uses 0-based indexing
        const endLine = sourceNode.endPosition.row + 1;
        const functionSourceCode = this.getNodeText(sourceNode, sourceCode);
        return {
            name: functionName,
            moduleName,
            moduleAddress,
            filePath,
            startLine,
            endLine,
            sourceCode: functionSourceCode,
            parameters,
            returnType,
            visibility,
            modifiers,
            astNode: funcNode,
        };
    }
    /**
     * Extract function visibility
     * @param declarationNode - Parent declaration node (may be null)
     * @param funcNode - Function declaration node
     * @param sourceCode - Source code string
     * @returns Visibility string
     */
    extractVisibility(declarationNode, funcNode, sourceCode) {
        // Check in declaration node first (for public functions)
        if (declarationNode && declarationNode.type === 'declaration') {
            const modifierNode = this.findChildByType(declarationNode, 'module_member_modifier');
            if (modifierNode) {
                const modifierText = this.getNodeText(modifierNode, sourceCode).trim();
                if (modifierText.includes('public(friend)')) {
                    return 'public(friend)';
                }
                else if (modifierText.includes('public(package)')) {
                    return 'public(package)';
                }
                else if (modifierText.includes('public')) {
                    return 'public';
                }
            }
        }
        // Check in function node itself
        const visibilityNode = this.findChildByType(funcNode, 'visibility');
        if (visibilityNode) {
            const visibilityText = this.getNodeText(visibilityNode, sourceCode).trim();
            if (visibilityText.includes('public(friend)')) {
                return 'public(friend)';
            }
            else if (visibilityText.includes('public(package)')) {
                return 'public(package)';
            }
            else if (visibilityText.includes('public')) {
                return 'public';
            }
        }
        return 'private'; // Default visibility
    }
    /**
     * Extract function modifiers (inline, native, entry)
     * @param declarationNode - Parent declaration node (may be null)
     * @param funcNode - Function declaration node
     * @param sourceCode - Source code string
     * @returns Array of modifier strings
     */
    extractModifiers(declarationNode, funcNode, sourceCode) {
        const modifiers = [];
        // Check in both declaration node and function node
        const nodesToCheck = [funcNode];
        if (declarationNode && declarationNode.type === 'declaration') {
            nodesToCheck.push(declarationNode);
        }
        for (const node of nodesToCheck) {
            // Check for 'inline' modifier
            const inlineNode = node.children.find(child => child.type === 'inline' || this.getNodeText(child, sourceCode).trim() === 'inline');
            if (inlineNode && !modifiers.includes('inline')) {
                modifiers.push('inline');
            }
            // Check for 'native' modifier
            const nativeNode = node.children.find(child => child.type === 'native' || this.getNodeText(child, sourceCode).trim() === 'native');
            if (nativeNode && !modifiers.includes('native')) {
                modifiers.push('native');
            }
            // Check for 'entry' modifier
            const entryNode = node.children.find(child => child.type === 'entry' || this.getNodeText(child, sourceCode).trim() === 'entry');
            if (entryNode && !modifiers.includes('entry')) {
                modifiers.push('entry');
            }
        }
        return modifiers;
    }
    /**
     * Extract function parameters
     * @param funcNode - Function declaration node
     * @param sourceCode - Source code string
     * @returns Array of ParameterInfo objects
     */
    extractParameters(funcNode, sourceCode) {
        const parameters = [];
        // Find the parameters node
        const paramsNode = this.findChildByType(funcNode, 'parameters');
        if (!paramsNode) {
            return parameters;
        }
        // Find all parameter nodes
        const paramNodes = this.findChildrenByType(paramsNode, 'parameter');
        for (const paramNode of paramNodes) {
            // Extract parameter name
            const nameNode = this.findChildByType(paramNode, 'identifier');
            if (!nameNode) {
                continue;
            }
            const paramName = this.getNodeText(nameNode, sourceCode);
            // Extract parameter type
            const typeNode = this.findChildByType(paramNode, 'type');
            let paramType = 'unknown';
            if (typeNode) {
                paramType = this.getNodeText(typeNode, sourceCode).trim();
            }
            parameters.push({
                name: paramName,
                type: paramType,
            });
        }
        return parameters;
    }
    /**
     * Extract function return type
     * @param funcNode - Function declaration node
     * @param sourceCode - Source code string
     * @returns Return type string or null
     */
    extractReturnType(funcNode, sourceCode) {
        // Look for return type after the parameters
        // In Move, return type is specified after ':' 
        const returnTypeNode = this.findChildByType(funcNode, 'type');
        if (returnTypeNode) {
            // Make sure this type node is for return type, not a parameter type
            // Return type typically comes after parameters
            const paramsNode = this.findChildByType(funcNode, 'parameters');
            if (paramsNode && returnTypeNode.startIndex > paramsNode.endIndex) {
                return this.getNodeText(returnTypeNode, sourceCode).trim();
            }
        }
        return null;
    }
}
exports.MoveParser = MoveParser;
//# sourceMappingURL=parser.js.map