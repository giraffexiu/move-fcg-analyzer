"""
批量查询示例 - Aptos Move Analyzer
"""

from aptos_move_analyzer import ProjectIndexer, FunctionQueryEngine


def main():
    # 创建索引器和查询引擎
    indexer = ProjectIndexer()
    query_engine = FunctionQueryEngine()
    
    # 索引项目
    print("正在索引项目...")
    project_path = "./test/caas-framework"
    index = indexer.index_project(project_path)
    print(f"✓ 索引完成\n")
    
    # 要查询的函数列表
    functions_to_query = [
        "grant_read_authorization",
        "revoke_read_authorization",
        "grant_write_authorization",
        "revoke_write_authorization",
    ]
    
    print("="*70)
    print("批量查询函数")
    print("="*70)
    
    for func_name in functions_to_query:
        print(f"\n查询: {func_name}")
        print("-"*70)
        
        result = query_engine.query_function(index, func_name)
        
        if result:
            func = result.function_info
            print(f"✓ 找到函数")
            print(f"  模块: {func.module_name}")
            print(f"  文件: {func.file_path}")
            print(f"  行号: {func.start_line}-{func.end_line}")
            print(f"  可见性: {func.visibility}")
            print(f"  参数数量: {len(func.parameters)}")
            print(f"  调用数量: {len(result.calls)}")
        else:
            print(f"✗ 未找到函数")
    
    # 统计信息
    print("\n" + "="*70)
    print("统计信息")
    print("="*70)
    
    total_functions = sum(len(funcs) for funcs in index.functions.values())
    public_functions = sum(
        1 for funcs in index.functions.values() 
        for func in funcs 
        if func.visibility == "public"
    )
    
    print(f"总函数数: {total_functions}")
    print(f"公共函数数: {public_functions}")
    print(f"私有函数数: {total_functions - public_functions}")
    print(f"模块数: {len(index.modules)}")


if __name__ == "__main__":
    main()
