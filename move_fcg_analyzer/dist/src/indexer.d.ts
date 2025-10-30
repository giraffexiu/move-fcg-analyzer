import { ProjectIndex } from './types';
/**
 * ProjectIndexer - Scans and indexes Move projects
 */
export declare class ProjectIndexer {
    private parser;
    constructor();
    /**
     * Index a Move project
     * @param projectPath - Path to the project root directory
     * @returns ProjectIndex containing all modules and functions
     */
    indexProject(projectPath: string): Promise<ProjectIndex>;
    /**
     * Re-index a project (alias for indexProject)
     * @param projectPath - Path to the project root directory
     * @returns ProjectIndex containing all modules and functions
     */
    reindexProject(projectPath: string): Promise<ProjectIndex>;
    /**
     * Scan directory recursively for .move files
     * @param dirPath - Directory path to scan
     * @returns Array of .move file paths
     */
    private scanMoveFiles;
    /**
     * Parse Move.toml configuration file
     * @param projectPath - Project root directory
     * @returns Package name and dependencies
     */
    private parseMoveToml;
    /**
     * Build the project index from parsed files
     * @param projectPath - Project root directory
     * @param packageName - Package name from Move.toml
     * @param moveFiles - Array of .move file paths
     * @param dependencies - Project dependencies
     * @returns ProjectIndex
     */
    private buildIndex;
}
//# sourceMappingURL=indexer.d.ts.map