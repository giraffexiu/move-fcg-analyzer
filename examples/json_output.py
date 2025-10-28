"""
JSON 输出示例 - Aptos Move Analyzer
"""

import json
from aptos_move_analyzer import ProjectIndexer, FunctionQueryEngine


def main():
    # 创建索引器和查询引擎
    indexer = ProjectIndexer()
    query_engine = FunctionQueryEngine()
    
    # 索引项目
    project_path = "./test/caas-framework"
    index = indexer.index_project(project_path)
    
    # 查询函数
    function_name = "grant_read_authorization"
    result = query_engine.query_function(index, function_name)
    
    if result:
        # 转换为 JSON 格式
        json_output = result.to_json()
        
        # 美化输出
        print(json.dumps(json_output, indent=2, ensure_ascii=False))
    else:
        print(json.dumps({
            "error": f"Function '{function_name}' not found"
        }, indent=2))


if __name__ == "__main__":
    main()
