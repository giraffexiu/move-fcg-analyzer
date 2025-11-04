#!/usr/bin/env python3
import json
from move_fcg_analyzer import MoveFunctionAnalyzer

analyzer = MoveFunctionAnalyzer()
project_path = "test/test/navi-smart-contracts"#test/deepbook;test/caas-framework;
function_name = "calculate_current_index"#
print(json.dumps(analyzer.analyze_raw(project_path, function_name), ensure_ascii=False))