#!/usr/bin/env python3
"""
验证 Aptos Move Analyzer 安装脚本
"""

import sys
import os


def print_status(message, status="info"):
    """打印状态信息"""
    symbols = {
        "info": "ℹ",
        "success": "✓",
        "error": "✗",
        "warning": "⚠"
    }
    colors = {
        "info": "\033[94m",
        "success": "\033[92m",
        "error": "\033[91m",
        "warning": "\033[93m",
        "reset": "\033[0m"
    }
    
    symbol = symbols.get(status, "•")
    color = colors.get(status, "")
    reset = colors["reset"]
    
    print(f"{color}{symbol} {message}{reset}")


def check_python_version():
    """检查 Python 版本"""
    print_status("检查 Python 版本...", "info")
    version = sys.version_info
    
    if version >= (3, 8):
        print_status(f"Python {version.major}.{version.minor}.{version.micro} ✓", "success")
        return True
    else:
        print_status(f"Python 版本过低: {version.major}.{version.minor}.{version.micro} (需要 >= 3.8)", "error")
        return False


def check_package_import():
    """检查包是否可以导入"""
    print_status("检查包导入...", "info")
    
    try:
        import aptos_move_analyzer
        print_status("aptos_move_analyzer 包导入成功", "success")
        
        # 检查主要组件
        from aptos_move_analyzer import ProjectIndexer, FunctionQueryEngine
        print_status("ProjectIndexer 导入成功", "success")
        print_status("FunctionQueryEngine 导入成功", "success")
        
        return True
    except ImportError as e:
        print_status(f"包导入失败: {e}", "error")
        print_status("请运行: pip install -e .", "warning")
        return False


def check_tree_sitter():
    """检查 tree-sitter 依赖"""
    print_status("检查 tree-sitter...", "info")
    
    try:
        import tree_sitter
        print_status("tree-sitter 已安装", "success")
        return True
    except ImportError:
        print_status("tree-sitter 未安装", "error")
        print_status("请运行: pip install tree-sitter", "warning")
        return False


def check_tree_sitter_binding():
    """检查 tree-sitter Move 绑定"""
    print_status("检查 tree-sitter Move 绑定...", "info")
    
    binding_paths = [
        "build/Release/tree_sitter_move_on_aptos_binding.node",
        "./build/Release/tree_sitter_move_on_aptos_binding.node",
        "bindings/node/build/Release/tree_sitter_move_on_aptos_binding.node",
        "../bindings/node/build/Release/tree_sitter_move_on_aptos_binding.node",
    ]
    
    for path in binding_paths:
        if os.path.exists(path):
            print_status(f"找到绑定文件: {path}", "success")
            return True
    
    print_status("未找到 tree-sitter Move 绑定", "error")
    print_status("请运行: npm install", "warning")
    return False


def check_test_project():
    """检查测试项目"""
    print_status("检查测试项目...", "info")
    
    test_path = "./test/caas-framework"
    if os.path.exists(test_path) and os.path.isdir(test_path):
        print_status(f"测试项目存在: {test_path}", "success")
        return True
    else:
        print_status(f"测试项目不存在: {test_path}", "warning")
        print_status("某些示例可能无法运行", "warning")
        return False


def check_examples():
    """检查示例文件"""
    print_status("检查示例文件...", "info")
    
    examples = [
        "examples/basic_usage.py",
        "examples/json_output.py",
        "examples/batch_query.py",
    ]
    
    all_exist = True
    for example in examples:
        if os.path.exists(example):
            print_status(f"  {example} ✓", "success")
        else:
            print_status(f"  {example} ✗", "error")
            all_exist = False
    
    return all_exist


def test_basic_functionality():
    """测试基本功能"""
    print_status("测试基本功能...", "info")
    
    try:
        from aptos_move_analyzer import ProjectIndexer, FunctionQueryEngine
        
        # 创建实例
        try:
            indexer = ProjectIndexer()
            print_status("ProjectIndexer 创建成功", "success")
        except RuntimeError as e:
            print_status(f"ProjectIndexer 创建失败: {e}", "error")
            print_status("请确保已运行 npm install 构建绑定", "warning")
            return False
        
        query_engine = FunctionQueryEngine()
        print_status("FunctionQueryEngine 创建成功", "success")
        
        return True
    except Exception as e:
        print_status(f"功能测试失败: {e}", "error")
        return False


def main():
    """主函数"""
    print("\n" + "="*70)
    print("Aptos Move Analyzer - 安装验证")
    print("="*70 + "\n")
    
    checks = [
        ("Python 版本", check_python_version),
        ("包导入", check_package_import),
        ("tree-sitter", check_tree_sitter),
        ("tree-sitter 绑定", check_tree_sitter_binding),
        ("测试项目", check_test_project),
        ("示例文件", check_examples),
        ("基本功能", test_basic_functionality),
    ]
    
    results = []
    for name, check_func in checks:
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print_status(f"{name} 检查出错: {e}", "error")
            results.append((name, False))
        print()
    
    # 总结
    print("="*70)
    print("验证总结")
    print("="*70 + "\n")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "success" if result else "error"
        print_status(f"{name}: {'通过' if result else '失败'}", status)
    
    print(f"\n通过: {passed}/{total}")
    
    if passed == total:
        print_status("\n✓ 所有检查通过！可以开始使用 Aptos Move Analyzer", "success")
        print_status("\n运行示例: python examples/basic_usage.py", "info")
        return 0
    else:
        print_status(f"\n✗ {total - passed} 项检查失败", "error")
        print_status("\n请查看上面的错误信息并修复问题", "warning")
        return 1


if __name__ == "__main__":
    sys.exit(main())
