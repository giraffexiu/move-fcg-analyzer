# Move FCG Analyzer

[![PyPI version](https://badge.fury.io/py/move-fcg-analyzer.svg)](https://badge.fury.io/py/move-fcg-analyzer)
[![PyPI Publish](https://github.com/YOUR_USERNAME/move-fcg-analyzer/actions/workflows/publish-to-pypi.yml/badge.svg)](https://github.com/YOUR_USERNAME/move-fcg-analyzer/actions/workflows/publish-to-pypi.yml)
[![Test Build](https://github.com/YOUR_USERNAME/move-fcg-analyzer/actions/workflows/test-build.yml/badge.svg)](https://github.com/YOUR_USERNAME/move-fcg-analyzer/actions/workflows/test-build.yml)

一个用于分析 Move 项目的静态分析工具，支持函数调用图（Function Call Graph）分析，可以提取函数信息、调用关系、参数等。

## 功能

- 提取函数签名、参数、返回类型
- 提取函数源代码和位置信息
- **准确提取函数调用关系（calls）**
- 支持模块限定的函数查询
- 输出标准 JSON 格式

## 安装

### 从 PyPI 安装（推荐）

```bash
pip install move-fcg-analyzer
```

安装后即可直接使用，无需手动构建。

### 系统要求

- **Python**: 3.8 或更高版本
- **Node.js**: 18 或更高版本（运行时需要）

### 从源码构建（开发者）

如果你需要从源码构建：

#### 1. 安装依赖

```bash
npm install
```

#### 2. 构建 TypeScript Indexer

```bash
npm run build:indexer
```

## 使用

### 命令行接口（CLI）

安装后可以直接使用 `move-fcg-analyzer` 命令：

```bash
move-fcg-analyzer <project_path> <function_name>
```

示例：
```bash
move-fcg-analyzer ./test/caas-framework grant_read_authorization
```

或者使用 Python 模块方式：
```bash
python -m move_fcg_analyzer <project_path> <function_name>
```

### Python API

```python
from move_fcg_analyzer import MoveFunctionAnalyzer

# 创建分析器实例
analyzer = MoveFunctionAnalyzer()

# 分析指定函数
result = analyzer.analyze_raw("./project_path", "function_name")

# result 包含 contract, function, source, location, parameter, calls 等字段
print(result["calls"])  # 查看函数调用关系
print(result["function"])  # 查看函数签名
print(result["parameter"])  # 查看函数参数
```

完整示例：
```python
from move_fcg_analyzer import MoveFunctionAnalyzer
import json

analyzer = MoveFunctionAnalyzer()
result = analyzer.analyze_raw("./test/caas-framework", "grant_read_authorization")

# 打印格式化的 JSON 输出
print(json.dumps(result, indent=2))

# 访问特定字段
print(f"Module: {result['contract']}")
print(f"Function: {result['function']}")
print(f"Location: {result['location']['file']}:{result['location']['start_line']}")
print(f"Calls {len(result['calls'])} functions")
```

## 输出格式

```json
{
  "contract": "module_name",
  "function": "function_signature",
  "source": "function_source_code",
  "location": {
    "file": "/path/to/file.move",
    "start_line": 134,
    "end_line": 204
  },
  "parameter": [
    {"name": "param_name", "type": "param_type"}
  ],
  "calls": [
    {
      "file": "/path/to/called/function.move",
      "function": "called_function_name",
      "module": "called_module_name"
    }
  ]
}
```

## License

Apache-2.0
