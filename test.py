#!/usr/bin/env python3
import json
import sys
import traceback
from pathlib import Path
from move_fcg_analyzer import MoveFunctionAnalyzer

print(f"Python version: {sys.version}")
print(f"Current directory: {Path.cwd()}")
print(f"Test project path: {Path('./deepbook').absolute()}")
print(f"Test project exists: {Path('./deepbook').exists()}")
print()

try:
    analyzer = MoveFunctionAnalyzer(debug=True)
    print("Analyzer initialized successfully")
    
    result = analyzer.analyze_raw('./deepbook', 'calculate_partial_fill_balances')
    
    if result:
        print("\n=== Analysis Result ===")
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print("ERROR: Function not found or analysis failed")
        print("Possible reasons:")
        print("1. Function name is incorrect")
        print("2. Project path is incorrect")
        print("3. TypeScript indexer not built (run 'npm run build:indexer' in the package directory)")
        
except Exception as e:
    print(f"\nERROR: {e}")
    print("\nFull traceback:")
    traceback.print_exc()
