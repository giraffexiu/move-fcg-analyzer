import { SyntaxNode, Tree } from 'tree-sitter';
import { ParsedFile, ModuleInfo, FunctionInfo } from './types';
/**
 * MoveParser - Parses Move source files using Tree-sitter
 */
export declare class MoveParser {
    private parser;
    constructor();
    /**
     * Parse a Move source file
     * @param filePath - Path to the .move file
     * @returns ParsedFile object containing the AST and source code
     */
    parseFile(filePath: string): ParsedFile;
    /**
     * Helper function to traverse AST and find nodes by type
     * @param node - Starting node
     * @param type - Node type to search for
     * @returns Array of matching nodes
     */
    findNodesByType(node: SyntaxNode, type: string): SyntaxNode[];
    /**
     * Helper function to get the text content of a node
     * @param node - AST node
     * @param sourceCode - Source code string
     * @returns Text content of the node
     */
    getNodeText(node: SyntaxNode, sourceCode: string): string;
    /**
     * Helper function to find a child node by type
     * @param node - Parent node
     * @param type - Child node type
     * @returns First matching child node or null
     */
    findChildByType(node: SyntaxNode, type: string): SyntaxNode | null;
    /**
     * Helper function to find all child nodes by type
     * @param node - Parent node
     * @param type - Child node type
     * @returns Array of matching child nodes
     */
    findChildrenByType(node: SyntaxNode, type: string): SyntaxNode[];
    /**
     * Extract modules from the AST
     * @param tree - Parsed tree
     * @param filePath - Path to the source file
     * @param sourceCode - Source code string
     * @returns Array of ModuleInfo objects
     */
    extractModules(tree: Tree, filePath: string, sourceCode: string): ModuleInfo[];
    /**
     * Extract functions from the AST
     * @param tree - Parsed tree
     * @param filePath - Path to the source file
     * @param sourceCode - Source code string
     * @returns Array of FunctionInfo objects
     */
    extractFunctions(tree: Tree, filePath: string, sourceCode: string): FunctionInfo[];
    /**
     * Extract detailed information from a function declaration node
     * @param funcNode - Function declaration AST node
     * @param moduleName - Name of the containing module
     * @param moduleAddress - Address of the containing module
     * @param filePath - Path to the source file
     * @param sourceCode - Source code string
     * @returns FunctionInfo object or null
     */
    private extractFunctionInfo;
    /**
     * Extract function visibility
     * @param declarationNode - Parent declaration node (may be null)
     * @param funcNode - Function declaration node
     * @param sourceCode - Source code string
     * @returns Visibility string
     */
    private extractVisibility;
    /**
     * Extract function modifiers (inline, native, entry)
     * @param declarationNode - Parent declaration node (may be null)
     * @param funcNode - Function declaration node
     * @param sourceCode - Source code string
     * @returns Array of modifier strings
     */
    private extractModifiers;
    /**
     * Extract function parameters
     * @param funcNode - Function declaration node
     * @param sourceCode - Source code string
     * @returns Array of ParameterInfo objects
     */
    private extractParameters;
    /**
     * Extract function return type
     * @param funcNode - Function declaration node
     * @param sourceCode - Source code string
     * @returns Return type string or null
     */
    private extractReturnType;
}
//# sourceMappingURL=parser.d.ts.map