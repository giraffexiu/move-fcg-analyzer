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

    def __init__(self, debug=False):
        self.debug = debug
        # Find the CLI path (TypeScript implementation)
        # Try package location first (for pip installed package)
        package_dir = Path(__file__).parent
        self._cli_path = package_dir / "dist" / "src" / "cli.js"
        
        if self.debug:
            print(f"[DEBUG] Package dir: {package_dir}")
            print(f"[DEBUG] Looking for CLI at: {self._cli_path}")
            print(f"[DEBUG] CLI exists: {self._cli_path.exists()}")
        
        if not self._cli_path.exists():
            # Fall back to project root (for development)
            project_root = package_dir.parent
            self._cli_path = project_root / "dist" / "src" / "cli.js"
            
            if self.debug:
                print(f"[DEBUG] Trying project root: {project_root}")
                print(f"[DEBUG] CLI path: {self._cli_path}")
                print(f"[DEBUG] CLI exists: {self._cli_path.exists()}")
            
            if not self._cli_path.exists():
                # Try to build it
                if self.debug:
                    print(f"[DEBUG] CLI not found, attempting to build...")
                self._build_indexer(project_root)

    def _build_indexer(self, project_root):
        """Build the TypeScript indexer and Node.js bindings if not already built"""
        try:
            if self.debug:
                print(f"[DEBUG] Running npm install in {project_root}")
            
            # First run npm install to build Node.js bindings
            subprocess.run(
                ["npm", "install"],
                cwd=project_root,
                check=True,
                capture_output=True,
                text=True
            )
            
            if self.debug:
                print(f"[DEBUG] Running npm run build:indexer")
            
            # Then build TypeScript
            subprocess.run(
                ["npm", "run", "build:indexer"],
                cwd=project_root,
                check=True,
                capture_output=True,
                text=True
            )
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"Failed to build indexer: {e.stderr}")
        except FileNotFoundError:
            raise RuntimeError("npm not found. Please install Node.js and npm.")

    def analyze_raw(self, project_path: str, function_name: str):
        """Index the project and query a function, returning JSON dict or None."""
        try:
            if self.debug:
                print(f"[DEBUG] Running: node {self._cli_path} {project_path} {function_name}")
            
            # Call the TypeScript CLI
            result = subprocess.run(
                ["node", str(self._cli_path), project_path, function_name],
                capture_output=True,
                text=True,
                check=False
            )
            
            if self.debug:
                print(f"[DEBUG] Return code: {result.returncode}")
                print(f"[DEBUG] Stdout: {result.stdout[:200] if result.stdout else 'empty'}")
                print(f"[DEBUG] Stderr: {result.stderr[:200] if result.stderr else 'empty'}")
            
            if result.returncode != 0:
                # Function not found or error occurred
                if self.debug:
                    print(f"[DEBUG] Error output: {result.stderr}")
                return None
            
            # Parse the JSON output
            return json.loads(result.stdout)
            
        except json.JSONDecodeError as e:
            # Invalid JSON output
            if self.debug:
                print(f"[DEBUG] JSON decode error: {e}")
            return None
        except Exception as e:
            print(f"Error calling TypeScript indexer: {e}")
            return None