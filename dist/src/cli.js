#!/usr/bin/env node
"use strict";
/**
 * CLI Interface for Aptos Function Indexer
 *
 * Usage: node cli.js <project_path> <function_name>
 *
 * Example: node cli.js ./test/caas-framework grant_read_authorization
 */
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
const path = __importStar(require("path"));
const indexer_1 = require("./indexer");
const query_engine_1 = require("./query-engine");
const json_formatter_1 = require("./json-formatter");
/**
 * Parse command line arguments
 */
function parseArguments() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        return null;
    }
    const projectPath = args[0];
    const functionName = args[1];
    return { projectPath, functionName };
}
/**
 * Print usage information
 */
function printUsage() {
    console.error('Usage: aptos-indexer <project_path> <function_name>');
    console.error('');
    console.error('Arguments:');
    console.error('  project_path   Path to the Move project directory');
    console.error('  function_name  Name of the function to query (supports module::function format)');
    console.error('');
    console.error('Examples:');
    console.error('  aptos-indexer ./test/caas-framework grant_read_authorization');
    console.error('  aptos-indexer ./my-project authorization::verify_identity');
}
/**
 * Main CLI function
 */
async function main() {
    // Parse command line arguments
    const args = parseArguments();
    if (!args) {
        printUsage();
        process.exit(1);
    }
    const { projectPath, functionName } = args;
    try {
        // Resolve the project path to an absolute path
        const absoluteProjectPath = path.resolve(projectPath);
        // Create indexer and query engine
        const indexer = new indexer_1.ProjectIndexer();
        const queryEngine = new query_engine_1.FunctionQueryEngine();
        const formatter = new json_formatter_1.JSONFormatter();
        // Index the project
        const index = await indexer.indexProject(absoluteProjectPath);
        // Query the function
        const result = queryEngine.queryFunction(index, functionName);
        if (!result) {
            process.exit(1);
        }
        // Format and output the result as JSON
        const jsonResult = formatter.formatResult(result.functionInfo, result.calls);
        console.log(JSON.stringify(jsonResult, null, 2));
    }
    catch (error) {
        // Handle errors with user-friendly messages
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
            // Provide additional context for common errors
            if (error.message.includes('does not exist')) {
                console.error('Please check that the project path is correct.');
            }
            else if (error.message.includes('not a directory')) {
                console.error('The project path must be a directory, not a file.');
            }
            else if (error.message.includes('EACCES')) {
                console.error('Permission denied. Please check file permissions.');
            }
        }
        else {
            console.error('An unexpected error occurred:', error);
        }
        process.exit(1);
    }
}
// Run the CLI
main();
//# sourceMappingURL=cli.js.map