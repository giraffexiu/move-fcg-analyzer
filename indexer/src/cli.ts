#!/usr/bin/env node

/**
 * CLI Interface for Aptos Function Indexer
 * 
 * Usage: node cli.js <project_path> <function_name>
 * 
 * Example: node cli.js ./test/caas-framework grant_read_authorization
 */

import * as path from 'path';
import { ProjectIndexer } from './indexer';
import { FunctionQueryEngine } from './query-engine';
import { JSONFormatter } from './json-formatter';

/**
 * Parse command line arguments
 */
function parseArguments(): { projectPath: string; functionName: string } | null {
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
function printUsage(): void {
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
async function main(): Promise<void> {
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
    const indexer = new ProjectIndexer();
    const queryEngine = new FunctionQueryEngine();
    const formatter = new JSONFormatter();

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

  } catch (error) {
    // Handle errors with user-friendly messages
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      
      // Provide additional context for common errors
      if (error.message.includes('does not exist')) {
        console.error('Please check that the project path is correct.');
      } else if (error.message.includes('not a directory')) {
        console.error('The project path must be a directory, not a file.');
      } else if (error.message.includes('EACCES')) {
        console.error('Permission denied. Please check file permissions.');
      }
    } else {
      console.error('An unexpected error occurred:', error);
    }
    
    process.exit(1);
  }
}

// Run the CLI
main();
