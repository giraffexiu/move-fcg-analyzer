import { FunctionInfo, CallInfo, QueryResultJSON } from './types';
/**
 * JSONFormatter - Formats query results into the specified JSON format
 */
export declare class JSONFormatter {
    /**
     * Format a function query result into the QueryResultJSON format
     *
     * @param functionInfo - Function information to format
     * @param calls - Array of call information
     * @returns Formatted JSON result
     */
    formatResult(functionInfo: FunctionInfo, calls: CallInfo[]): QueryResultJSON;
    /**
     * Build a function signature string from FunctionInfo
     * Format: [visibility] [modifiers] fun name(params): return_type
     *
     * @param functionInfo - Function information
     * @returns Function signature string
     */
    private buildFunctionSignature;
    /**
     * Sanitize a string to ensure it's safe for JSON output
     * Handles special characters and encoding issues
     *
     * @param str - String to sanitize
     * @returns Sanitized string
     */
    private sanitizeString;
    /**
     * Format a query result as a JSON string
     *
     * @param functionInfo - Function information to format
     * @param calls - Array of call information
     * @param pretty - Whether to pretty-print the JSON (default: false)
     * @returns JSON string
     */
    formatResultAsString(functionInfo: FunctionInfo, calls: CallInfo[], pretty?: boolean): string;
}
//# sourceMappingURL=json-formatter.d.ts.map