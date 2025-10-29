#!/usr/bin/env python3
import json
import sys
import io
from contextlib import redirect_stdout

from aptos_move_analyzer import MoveFunctionAnalyzer


def main():
    # 在此修改为你的项目路径和函数名
    project_path = "test/caas-framework"
    function_name = "get_address_labels"

    try:
        with redirect_stdout(io.StringIO()):
            analyzer = MoveFunctionAnalyzer()
            raw_data = analyzer.analyze_raw(project_path, function_name)
        print(json.dumps(raw_data if raw_data is not None else None, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()