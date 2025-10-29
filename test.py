#!/usr/bin/env python3
import json
import sys
import io
from contextlib import redirect_stdout

from aptos_move_analyzer import MoveFunctionAnalyzer


def main():
    project_path = "./test/deepbook"
    function_name = "calculate_partial_fill_balances"

    try:
        analyzer = MoveFunctionAnalyzer()
        raw_data = analyzer.analyze_raw(project_path, function_name)
        print(json.dumps(raw_data if raw_data is not None else None, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()