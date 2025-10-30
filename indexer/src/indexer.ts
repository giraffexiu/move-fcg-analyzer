import * as fs from 'fs';
import * as path from 'path';
import { MoveParser } from './parser';
import { ProjectIndex, ModuleInfo, FunctionInfo, DependencyInfo } from './types';

/**
 * ProjectIndexer - Scans and indexes Move projects
 */
export class ProjectIndexer {
  private parser: MoveParser;

  constructor() {
    this.parser = new MoveParser();
  }

  /**
   * Index a Move project
   * @param projectPath - Path to the project root directory
   * @returns ProjectIndex containing all modules and functions
   */
  async indexProject(projectPath: string): Promise<ProjectIndex> {
    if (!fs.existsSync(projectPath)) {
      throw new Error(`Project path does not exist: ${projectPath}`);
    }

    const stats = fs.statSync(projectPath);
    if (!stats.isDirectory()) {
      throw new Error(`Project path is not a directory: ${projectPath}`);
    }

    // Parse Move.toml to get package name and dependencies
    const { packageName, dependencies } = this.parseMoveToml(projectPath);

    // Scan for all .move files
    const moveFiles = this.scanMoveFiles(projectPath);

    // Build the index
    const index = await this.buildIndex(projectPath, packageName, moveFiles, dependencies);

    return index;
  }

  /**
   * Re-index a project (alias for indexProject)
   * @param projectPath - Path to the project root directory
   * @returns ProjectIndex containing all modules and functions
   */
  async reindexProject(projectPath: string): Promise<ProjectIndex> {
    return this.indexProject(projectPath);
  }

  /**
   * Scan directory recursively for .move files
   * @param dirPath - Directory path to scan
   * @returns Array of .move file paths
   */
  private scanMoveFiles(dirPath: string): string[] {
    const moveFiles: string[] = [];

    const scanDirectory = (currentPath: string) => {
      try {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);

          // Skip hidden directories and common ignore patterns
          if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'build') {
            continue;
          }

          if (entry.isDirectory()) {
            // Recursively scan subdirectories
            scanDirectory(fullPath);
          } else if (entry.isFile() && entry.name.endsWith('.move')) {
            // Add .move files to the list
            moveFiles.push(fullPath);
          }
        }
      } catch (error) {
        console.error(`Error scanning directory ${currentPath}:`, error);
      }
    };

    scanDirectory(dirPath);
    return moveFiles;
  }

  /**
   * Parse Move.toml configuration file
   * @param projectPath - Project root directory
   * @returns Package name and dependencies
   */
  private parseMoveToml(projectPath: string): { packageName: string; dependencies: DependencyInfo[] } {
    const tomlPath = path.join(projectPath, 'Move.toml');
    
    let packageName = 'unknown';
    const dependencies: DependencyInfo[] = [];

    if (!fs.existsSync(tomlPath)) {
      console.warn(`Move.toml not found at ${tomlPath}, using default package name`);
      return { packageName, dependencies };
    }

    try {
      const tomlContent = fs.readFileSync(tomlPath, 'utf-8');
      
      // Simple TOML parsing for package name
      // Look for [package] section and name field
      const packageMatch = tomlContent.match(/\[package\][\s\S]*?name\s*=\s*["']([^"']+)["']/);
      if (packageMatch) {
        packageName = packageMatch[1];
      }

      // Parse dependencies section
      // Look for [dependencies] section
      const depsMatch = tomlContent.match(/\[dependencies\]([\s\S]*?)(?=\[|$)/);
      if (depsMatch) {
        const depsSection = depsMatch[1];
        
        // Match dependency entries: name = { ... }
        const depPattern = /(\w+)\s*=\s*\{([^}]+)\}/g;
        let match;
        
        while ((match = depPattern.exec(depsSection)) !== null) {
          const depName = match[1];
          const depConfig = match[2];
          
          const dep: DependencyInfo = { name: depName };
          
          // Extract version if present
          const versionMatch = depConfig.match(/version\s*=\s*["']([^"']+)["']/);
          if (versionMatch) {
            dep.version = versionMatch[1];
          }
          
          // Extract path if present
          const pathMatch = depConfig.match(/(?:local|path)\s*=\s*["']([^"']+)["']/);
          if (pathMatch) {
            dep.path = pathMatch[1];
          }
          
          dependencies.push(dep);
        }
      }
    } catch (error) {
      console.error(`Error parsing Move.toml:`, error);
    }

    return { packageName, dependencies };
  }

  /**
   * Build the project index from parsed files
   * @param projectPath - Project root directory
   * @param packageName - Package name from Move.toml
   * @param moveFiles - Array of .move file paths
   * @param dependencies - Project dependencies
   * @returns ProjectIndex
   */
  private async buildIndex(
    projectPath: string,
    packageName: string,
    moveFiles: string[],
    dependencies: DependencyInfo[]
  ): Promise<ProjectIndex> {
    const modules = new Map<string, ModuleInfo>();
    const functions = new Map<string, FunctionInfo[]>();

    for (const filePath of moveFiles) {
      try {
        // Parse the file
        const parsedFile = this.parser.parseFile(filePath);

        // Extract modules
        const fileModules = this.parser.extractModules(
          parsedFile.tree,
          filePath,
          parsedFile.sourceCode
        );

        // Extract functions
        const fileFunctions = this.parser.extractFunctions(
          parsedFile.tree,
          filePath,
          parsedFile.sourceCode
        );

        // Add modules to the index
        for (const module of fileModules) {
          // Find functions belonging to this module
          const moduleFunctions = fileFunctions.filter(
            func => func.moduleName === module.moduleName
          );
          
          module.functions = moduleFunctions;
          
          // Use module name as key (could be qualified with address if needed)
          const moduleKey = module.address 
            ? `${module.address}::${module.moduleName}`
            : module.moduleName;
          
          modules.set(moduleKey, module);
        }

        // Add functions to the function map
        for (const func of fileFunctions) {
          const existingFunctions = functions.get(func.name) || [];
          existingFunctions.push(func);
          functions.set(func.name, existingFunctions);
        }

      } catch (error) {
        // Log error and continue processing other files
        console.error(`Error parsing file ${filePath}:`, error);
        continue;
      }
    }

    return {
      projectPath,
      packageName,
      modules,
      functions,
      dependencies,
    };
  }
}
