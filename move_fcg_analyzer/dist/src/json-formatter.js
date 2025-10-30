"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONFormatter = void 0;
/**
 * JSONFormatter - Formats query results into the specified JSON format
 */
class JSONFormatter {
    /**
     * Format a function query result into the QueryResultJSON format
     *
     * @param functionInfo - Function information to format
     * @param calls - Array of call information
     * @returns Formatted JSON result
     */
    formatResult(functionInfo, calls) {
        // Build the function signature
        const functionSignature = this.buildFunctionSignature(functionInfo);
        // Format parameters
        const parameters = functionInfo.parameters.map(param => ({
            name: this.sanitizeString(param.name),
            type: this.sanitizeString(param.type),
        }));
        // Format calls - only include calls where we found the file location
        const formattedCalls = calls
            .filter(call => call.calledFilePath !== null)
            .map(call => {
            // Remove module prefix from function name if present
            const functionName = call.calledFunction.includes('::')
                ? call.calledFunction.split('::').pop()
                : call.calledFunction;
            return {
                file: this.sanitizeString(call.calledFilePath),
                function: this.sanitizeString(functionName),
                module: this.sanitizeString(call.calledModule),
            };
        });
        // Build the result object
        const result = {
            contract: this.sanitizeString(functionInfo.moduleName),
            function: this.sanitizeString(functionSignature),
            source: this.sanitizeString(functionInfo.sourceCode),
            location: {
                file: this.sanitizeString(functionInfo.filePath),
                start_line: functionInfo.startLine,
                end_line: functionInfo.endLine,
            },
            parameter: parameters,
            calls: formattedCalls,
        };
        return result;
    }
    /**
     * Build a function signature string from FunctionInfo
     * Format: [visibility] [modifiers] fun name(params): return_type
     *
     * @param functionInfo - Function information
     * @returns Function signature string
     */
    buildFunctionSignature(functionInfo) {
        const parts = [];
        // Add visibility if not private
        if (functionInfo.visibility !== 'private') {
            parts.push(functionInfo.visibility);
        }
        // Add modifiers (inline, native, entry)
        if (functionInfo.modifiers.length > 0) {
            parts.push(...functionInfo.modifiers);
        }
        // Add 'fun' keyword and function name
        parts.push('fun');
        parts.push(functionInfo.name);
        // Build parameter list
        const paramList = functionInfo.parameters
            .map(param => `${param.name}: ${param.type}`)
            .join(', ');
        // Combine into signature
        let signature = `${parts.join(' ')}(${paramList})`;
        // Add return type if present
        if (functionInfo.returnType) {
            signature += `: ${functionInfo.returnType}`;
        }
        return signature;
    }
    /**
     * Sanitize a string to ensure it's safe for JSON output
     * Handles special characters and encoding issues
     *
     * @param str - String to sanitize
     * @returns Sanitized string
     */
    sanitizeString(str) {
        if (!str) {
            return '';
        }
        // Replace control characters (except newline, tab, carriage return)
        // These are the only control characters allowed in JSON strings
        let sanitized = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        // Normalize line endings to \n
        sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        return sanitized;
    }
    /**
     * Format a query result as a JSON string
     *
     * @param functionInfo - Function information to format
     * @param calls - Array of call information
     * @param pretty - Whether to pretty-print the JSON (default: false)
     * @returns JSON string
     */
    formatResultAsString(functionInfo, calls, pretty = false) {
        const result = this.formatResult(functionInfo, calls);
        return JSON.stringify(result, null, pretty ? 2 : 0);
    }
}
exports.JSONFormatter = JSONFormatter;
//# sourceMappingURL=json-formatter.js.map