import json
import subprocess
import os
from pathlib import Path


class MoveFunctionAnalyzer:
    """Provide a simple interface for function analysis.

    Usage:
        analyzer = MoveFunctionAnalyzer()
        data = analyzer.analyze_raw("./path/to/project", "module::function")
    """

    def __init__(self):
        # Find the CLI path (TypeScript implementation)
        self._cli_path = self._find_cli_path()
        
        if not self._cli_path.exists():
            # Try to build it (only works in development environment)
            project_root = self._find_project_root()
            if project_root:
                self._build_indexer(project_root)
            else:
                raise RuntimeError("cli.js not found and cannot build in installed package")

    def _find_cli_path(self):
        """Find cli.js path, supporting both development and installed environments"""
        # Method 1: Try installed package data (when installed via pip)
        package_dir = Path(__file__).parent
        installed_cli = package_dir / "dist" / "src" / "cli.js"
        if installed_cli.exists():
            return installed_cli
        
        # Method 2: Try development environment (project root)
        project_root = Path(__file__).parent.parent
        dev_cli = project_root / "dist" / "src" / "cli.js"
        if dev_cli.exists():
            return dev_cli
        
        # Method 3: Try alternative installed locations
        # Some package managers might install to different locations
        for possible_path in [
            package_dir / "cli.js",  # Direct in package
            package_dir / "src" / "cli.js",  # In src subdirectory
        ]:
            if possible_path.exists():
                return possible_path
        
        # Return the most likely path (installed package data)
        return installed_cli

    def _find_project_root(self):
        """Find project root for development environment, return None if not found"""
        current = Path(__file__).parent.parent
        
        # Check if this looks like a development environment
        if (current / "package.json").exists() and (current / "tsconfig.json").exists():
            return current
        
        return None

    def _build_indexer(self, project_root):
        """Build the TypeScript indexer if not already built"""
        try:
            # Run npm run build:indexer
            subprocess.run(
                ["npm", "run", "build:indexer"],
                cwd=project_root,
                check=True,
                capture_output=True,
                text=True
            )
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"Failed to build TypeScript indexer: {e.stderr}")
        except FileNotFoundError:
            raise RuntimeError("npm not found. Please install Node.js and npm.")

    def analyze_raw(self, project_path: str, function_name: str):
        """Index the project and query a function, returning JSON dict or None."""
        try:
            # Call the TypeScript CLI
            result = subprocess.run(
                ["node", str(self._cli_path), project_path, function_name],
                capture_output=True,
                text=True,
                check=False
            )
            
            if result.returncode != 0:
                # Function not found or error occurred
                return None
            
            # Parse the JSON output
            return json.loads(result.stdout)
            
        except json.JSONDecodeError:
            # Invalid JSON output
            return None
        except Exception as e:
            print(f"Error calling TypeScript indexer: {e}")
            return None