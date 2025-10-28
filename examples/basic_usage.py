"""
基本使用示例 - Aptos Move Analyzer
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
    
    print(f"\n✓ 索引完成!")
    print(f"  - 找到 {len(index.modules)} 个模块")
    print(f"  - 找到 {sum(len(funcs) for funcs in index.functions.values())} 个函数")
    print(f"  - 包名: {index.package_name}")
    
    # 列出所有模块
    print("\n模块列表:")
    for module_key, module in index.modules.items():
        print(f"  - {module_key} ({len(module.functions)} 个函数)")
    
    # 查询特定函数
    print("\n" + "="*60)
    function_name = "grant_read_authorization"
    print(f"查询函数: {function_name}")
    print("="*60)
    
    result = query_engine.query_function(index, function_name)
    
    if result:
        func = result.function_info
        print(f"\n函数信息:")
        print(f"  名称: {func.name}")
        print(f"  模块: {func.module_name}")
        print(f"  地址: {func.module_address}")
        print(f"  文件: {func.file_path}")
        print(f"  行号: {func.start_line}-{func.end_line}")
        print(f"  可见性: {func.visibility}")
        
        if func.modifiers:
            print(f"  修饰符: {', '.join(func.modifiers)}")
        
        print(f"\n参数 ({len(func.parameters)}):")
        for param in func.parameters:
            print(f"  - {param.name}: {param.type}")
        
        if func.return_type:
            print(f"\n返回类型: {func.return_type}")
        
        print(f"\n调用的函数 ({len(result.calls)}):")
        if result.calls:
            for call in result.calls:
                print(f"  - {call.called_function}")
                print(f"    类型: {call.call_type}")
                if call.called_file_path:
                    print(f"    位置: {call.called_file_path}")
        else:
            print("  (无外部函数调用)")
        
        print(f"\n源代码:")
        print("-" * 60)
        print(func.source_code)
        print("-" * 60)
    else:
        print(f"✗ 未找到函数: {function_name}")


if __name__ == "__main__":
    main()
