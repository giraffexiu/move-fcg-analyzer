#!/usr/bin/env python3
import json
from move_fcg_analyzer import MoveFunctionAnalyzer

analyzer = MoveFunctionAnalyzer()

result = analyzer.analyze_raw('./test/deepbook', 'calculate_partial_fill_balances')

if result:
    print(json.dumps(result, indent=2, ensure_ascii=False))
else:
    print("wrong")
