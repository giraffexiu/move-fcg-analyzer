"""
Command-line interface for Aptos Move Analyzer
"""

import sys
import json
import argparse
from pathlib import Path
from .indexer import ProjectIndexer
from .query_engine import FunctionQueryEngine


def main():
    """Main CLI function"""
    parser = argparse.ArgumentParser(
        description="Aptos Move Analyzer - Index and query Aptos Move projects",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  aptos-move-analyzer ./test/caas-framework grant_read_authorization
  aptos-move-analyzer ./my-project authorization::verify_identity
        """
    )
    
    parser.add_argument(
        "project_path",
        help="Path to the Aptos Move project directory"
    )
    
    parser.add_argument(
        "function_name",
        help="Name of the function to query (supports module::function format)"
    )
    
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output result in JSON format"
    )
    
    parser.add_argument(
        "--version",
        action="version",
        version="aptos-move-analyzer 1.0.0"
    )
    
    args = parser.parse_args()
    
    try:
        # Resolve project path
        project_path = Path(args.project_path).resolve()
        
        # Create indexer and query engine
        indexer = ProjectIndexer()
        query_engine = FunctionQueryEngine()
        
        # Index the project
        print(f"Indexing project: {project_path}", file=sys.stderr)
        index = indexer.index_project(str(project_path))
        print(f"Found {len(index.modules)} modules and {sum(len(funcs) for funcs in index.functions.values())} functions", file=sys.stderr)
        
        # Query the function
        result = query_engine.query_function(index, args.function_name)
        
        if not result:
            print(f"Error: Function '{args.function_name}' not found", file=sys.stderr)
            sys.exit(1)
        
        # Output the result
        if args.json:
            print(json.dumps(result.to_json(), indent=2, ensure_ascii=False))
        else:
            print(f"\nFunction: {result.function_info.name}")
            print(f"Module: {result.function_info.module_name}")
            print(f"File: {result.function_info.file_path}")
            print(f"Lines: {result.function_info.start_line}-{result.function_info.end_line}")
            print(f"Visibility: {result.function_info.visibility}")
            if result.function_info.modifiers:
                print(f"Modifiers: {', '.join(result.function_info.modifiers)}")
            print(f"\nParameters:")
            for param in result.function_info.parameters:
                print(f"  - {param.name}: {param.type}")
            if result.function_info.return_type:
                print(f"\nReturn Type: {result.function_info.return_type}")
            print(f"\nCalls {len(result.calls)} functions:")
            for call in result.calls:
                print(f"  - {call.called_function} ({call.call_type})")
    
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except NotADirectoryError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
