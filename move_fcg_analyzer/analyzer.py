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
        # Try package location first (for pip installed package)
        package_dir = Path(__file__).parent
        self._cli_path = package_dir / "dist" / "src" / "cli.js"
        
        if not self._cli_path.exists():
            # Fall back to project root (for development)
            project_root = package_dir.parent
            self._cli_path = project_root / "dist" / "src" / "cli.js"
            
            if not self._cli_path.exists():
                # Try to build it
                self._build_indexer(project_root)

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