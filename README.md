# Move FCG Analyzer

一个用于分析 Move 项目的静态分析工具，支持函数调用图（Function Call Graph）分析，可以提取函数信息、调用关系、参数等。

## 功能

- 提取函数签名、参数、返回类型
- 提取函数源代码和位置信息
- **准确提取函数调用关系（calls）**
- 支持模块限定的函数查询
- 输出标准 JSON 格式

## 安装

通过 PyPI 安装（跨平台支持 Linux/macOS/Windows）：

```bash
pip install move-fcg-analyzer
```

安装完成后即可直接使用命令行工具：

```bash
move-fcg-analyzer <project_path> <function_name>
# 或
python -m move_fcg_analyzer <project_path> <function_name>
```

依赖说明：
- 需要系统已安装 Node.js（建议 v18+），用于运行索引器与加载原生解析模块。
- 解析器原生模块（`.node`）已随 wheel 打包，无需手动编译。

## 使用

## 使用

### Python API

```python
from move_fcg_analyzer import MoveFunctionAnalyzer

analyzer = MoveFunctionAnalyzer()
result = analyzer.analyze_raw("./project_path", "function_name")

# result 包含 contract, function, source, location, parameter, calls 等字段
print(result["calls"])  # 查看函数调用关系
```

### 命令行

```bash
move-fcg-analyzer <project_path> <function_name>
```

示例：
```bash
move-fcg-analyzer ./test/caas-framework grant_read_authorization
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

---

## 开发构建（贡献者）

如需本地开发或调试 TypeScript 索引器：

```bash
npm install
npm run build:indexer
```

构建后生成的 JS 会位于 `dist/src/`；发布流程会在 CI 中自动构建并将 `dist` 与原生模块一并打包到 Python wheel。
