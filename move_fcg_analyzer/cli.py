"""
Command-line interface for Move FCG Analyzer
"""

import sys
import json
import argparse
from .analyzer import MoveFunctionAnalyzer


def main():
    """Main CLI function"""
    parser = argparse.ArgumentParser(
        description="Move FCG Analyzer - Analyze Move projects with function call graph",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  move-fcg-analyzer ./test/caas-framework grant_read_authorization
  move-fcg-analyzer ./my-project authorization::verify_identity
        """
    )
    
    parser.add_argument(
        "project_path",
        help="Path to the Move project directory"
    )
    
    parser.add_argument(
        "function_name",
        help="Name of the function to query (supports module::function format)"
    )
    
    parser.add_argument(
        "--version",
        action="version",
        version="move-fcg-analyzer 1.0.0"
    )
    
    args = parser.parse_args()
    
    try:
        # Create analyzer
        analyzer = MoveFunctionAnalyzer()
        
        # Analyze the function
        result = analyzer.analyze_raw(args.project_path, args.function_name)
        
        if not result:
            print(f"Error: Function '{args.function_name}' not found", file=sys.stderr)
            sys.exit(1)
        
        # Output the result as JSON
        print(json.dumps(result, indent=2, ensure_ascii=False))
    
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
