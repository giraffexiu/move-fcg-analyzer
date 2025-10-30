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
        # When installed as a package, dist/ is included in the package directory
        package_dir = Path(__file__).parent
        self._cli_path = package_dir / "dist" / "src" / "cli.js"
        
        if not self._cli_path.exists():
            raise RuntimeError(
                f"TypeScript indexer not found at {self._cli_path}. "
                "The package may not have been built correctly. "
                "Please reinstall the package or build from source."
            )

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