# Aptos Move Analyzer

一个用于分析 Aptos Move 项目的静态分析工具，可以提取函数信息、调用关系、参数等。

## 功能

- 提取函数签名、参数、返回类型
- 提取函数源代码和位置信息
- **准确提取函数调用关系（calls）**
- 支持模块限定的函数查询
- 输出标准 JSON 格式

## 构建

### 1. 安装依赖

```bash
npm install
```

### 2. 构建 TypeScript Indexer

```bash
npm run build:indexer
```

## 使用

### Python API

```python
from aptos_move_analyzer import MoveFunctionAnalyzer

analyzer = MoveFunctionAnalyzer()
result = analyzer.analyze_raw("./project_path", "function_name")

# result 包含 contract, function, source, location, parameter, calls 等字段
print(result["calls"])  # 查看函数调用关系
```

### 命令行

```bash
python3 -m aptos_move_analyzer <project_path> <function_name>
```

示例：
```bash
python3 -m aptos_move_analyzer ./test/caas-framework grant_read_authorization
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
