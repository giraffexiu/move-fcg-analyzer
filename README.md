# Tree-sitter Move on Aptos

Semgrep integration, Move Tree-sitter grammar, and Aptos Move Analyzer

---

## 🐍 Aptos Move Analyzer - Python Library

**一个用于索引和查询 Aptos Move 项目的 Python 库**

### 快速安装

```bash
# 1. 安装 Python 依赖和构建 tree-sitter 绑定
pip install -r requirements.txt
pip install -e .

# 2. 验证安装
python verify_installation.py
```

**注意**: `pip install -e .` 会同时构建 tree-sitter Move 的 Python 绑定（C 扩展）和安装 aptos-move-analyzer 包。

### 快速使用

**Python 库：**

```python
from aptos_move_analyzer import ProjectIndexer, FunctionQueryEngine

# 创建索引器和查询引擎
indexer = ProjectIndexer()
query_engine = FunctionQueryEngine()

# 索引项目
index = indexer.index_project("./test/caas-framework")

# 查询函数
result = query_engine.query_function(index, "grant_read_authorization")

if result:
    print(f"函数: {result.function_info.name}")
    print(f"模块: {result.function_info.module_name}")
    print(f"参数: {len(result.function_info.parameters)}")
    
    # 转换为 JSON
    json_output = result.to_json()
```

**命令行工具：**

```bash
# 查询函数
aptos-move-analyzer ./test/caas-framework grant_read_authorization

# JSON 格式输出
aptos-move-analyzer ./test/caas-framework grant_read_authorization --json

# 查看帮助
aptos-move-analyzer --help
```

### 主要功能

#### ProjectIndexer - 项目索引器

```python
indexer = ProjectIndexer()

# 索引项目
index = indexer.index_project("./my-project")

# 查看索引信息
print(f"包名: {index.package_name}")
print(f"模块数: {len(index.modules)}")
print(f"函数数: {sum(len(funcs) for funcs in index.functions.values())}")
```

#### FunctionQueryEngine - 函数查询引擎

```python
query_engine = FunctionQueryEngine()

# 查询简单函数名
result = query_engine.query_function(index, "transfer")

# 查询模块限定的函数名
result = query_engine.query_function(index, "coin::transfer")

# 查询模块中的所有函数
functions = query_engine.query_module_functions(index, "coin")
```

#### 数据类型

- **FunctionInfo** - 函数详细信息（名称、参数、返回类型、可见性、源代码等）
- **ModuleInfo** - 模块信息
- **ProjectIndex** - 项目索引
- **QueryResult** - 查询结果（包含函数信息和调用关系）
- **ParameterInfo** - 参数信息
- **CallInfo** - 函数调用信息

### API 文档

#### ProjectIndexer

```python
class ProjectIndexer:
    def __init__(self, language_path: str = None):
        """
        初始化项目索引器
        
        Args:
            language_path: tree-sitter Move 语言绑定路径（可选）
        """
    
    def index_project(self, project_path: str) -> ProjectIndex:
        """
        索引 Aptos Move 项目
        
        Args:
            project_path: 项目根目录路径
            
        Returns:
            ProjectIndex: 包含所有模块和函数的项目索引
        """
```

#### FunctionQueryEngine

```python
class FunctionQueryEngine:
    def query_function(self, index: ProjectIndex, function_name: str) -> Optional[QueryResult]:
        """
        查询函数
        
        Args:
            index: 项目索引
            function_name: 函数名或模块限定名（如 "module::function"）
            
        Returns:
            QueryResult: 查询结果，未找到则返回 None
        """
    
    def query_module_functions(self, index: ProjectIndex, module_name: str) -> List[FunctionInfo]:
        """
        查询模块中的所有函数
        
        Args:
            index: 项目索引
            module_name: 模块名
            
        Returns:
            List[FunctionInfo]: 函数信息列表
        """
```

#### QueryResult

```python
@dataclass
class QueryResult:
    function_info: FunctionInfo  # 函数信息
    calls: List[CallInfo]        # 函数调用列表
    
    def to_json(self) -> dict:
        """转换为 JSON 格式"""
```

### 使用示例

#### 示例 1: 列出项目中的所有函数

```python
from aptos_move_analyzer import ProjectIndexer

indexer = ProjectIndexer()
index = indexer.index_project("./my-project")

print("项目中的所有函数:")
for func_name, func_list in index.functions.items():
    for func in func_list:
        print(f"  - {func.module_name}::{func.name}")
```

#### 示例 2: 查找特定模块的公共函数

```python
from aptos_move_analyzer import ProjectIndexer, FunctionQueryEngine

indexer = ProjectIndexer()
query_engine = FunctionQueryEngine()

index = indexer.index_project("./my-project")
functions = query_engine.query_module_functions(index, "my_module")

print("公共函数:")
for func in functions:
    if func.visibility == "public":
        print(f"  - {func.name}")
        print(f"    参数: {[f'{p.name}: {p.type}' for p in func.parameters]}")
```

#### 示例 3: 分析函数调用关系

```python
from aptos_move_analyzer import ProjectIndexer, FunctionQueryEngine

indexer = ProjectIndexer()
query_engine = FunctionQueryEngine()

index = indexer.index_project("./my-project")
result = query_engine.query_function(index, "my_function")

if result:
    print(f"函数 {result.function_info.name} 调用了:")
    for call in result.calls:
        print(f"  - {call.called_function} (类型: {call.call_type})")
        if call.called_file_path:
            print(f"    位置: {call.called_file_path}")
```

#### 示例 4: 导出为 JSON

```python
import json
from aptos_move_analyzer import ProjectIndexer, FunctionQueryEngine

indexer = ProjectIndexer()
query_engine = FunctionQueryEngine()

index = indexer.index_project("./my-project")
result = query_engine.query_function(index, "my_function")

if result:
    json_output = result.to_json()
    print(json.dumps(json_output, indent=2, ensure_ascii=False))
```

### 运行示例代码

项目包含三个完整的示例：

```bash
# 基本使用示例
python examples/basic_usage.py

# JSON 输出示例
python examples/json_output.py

# 批量查询示例
python examples/batch_query.py
```

### 开发

#### 运行测试

```bash
pytest tests/
```

#### 代码格式化

```bash
black aptos_move_analyzer/ tests/ examples/
```

#### 类型检查

```bash
mypy aptos_move_analyzer/
```



### 项目结构

```
aptos_move_analyzer/
├── __init__.py           # 包初始化，导出主要接口
├── __main__.py           # 支持 python -m aptos_move_analyzer 运行
├── types.py              # 数据类型定义
├── indexer.py            # 项目索引器
├── query_engine.py       # 函数查询引擎
├── call_extractor.py     # 函数调用提取器
├── cli.py                # 命令行接口
└── py.typed              # 类型检查支持

examples/
├── basic_usage.py        # 基本使用示例
├── json_output.py        # JSON 输出示例
└── batch_query.py        # 批量查询示例

tests/
└── test_indexer.py       # 单元测试和集成测试
```

### 依赖项

- **运行时依赖**: `tree-sitter>=0.20.0`
- **开发依赖**: `pytest>=7.0.0`, `black>=22.0.0`, `mypy>=0.950`

### 支持的 Python 版本

- Python 3.8+
- Python 3.9+
- Python 3.10+
- Python 3.11+
- Python 3.12+

### 常见问题

**Q: 提示 "Tree-sitter Move language binding not found"？**

A: 确保已运行 `npm install` 构建 tree-sitter 绑定。

**Q: 如何查询模块限定的函数？**

A: 使用 `module::function` 格式：
```python
result = query_engine.query_function(index, "coin::transfer")
```

**Q: 如何获取函数的源代码？**

A: 
```python
result = query_engine.query_function(index, "my_function")
print(result.function_info.source_code)
```

---

## 🌳 Tree-sitter Grammar

### Project Structure

Most files within this repo are auto-generated by `tree-sitter`. The only files you need to care about:

- `grammar.js`: the main grammar rules for move programming language
- `src/scanner.c`: the external scanner used in `grammar.js`
- `batch-test.py`: a Python script for testing the grammar
- `.github/workflows/test-on-repo.yaml`: GitHub Workflow configurations

### Setting up the Environment

Before contributing to the grammar rules, install and configure `tree-sitter`:

1. Install Node.js (recommended: use a version manager)
2. Install a working C compiler (macOS: Xcode Command Line Tools)
3. Install `tree-sitter` via `cargo` or `npm`
4. (Optional) Install Rust compiler and Cargo
5. Install Python for batch testing

Initialize tree-sitter:

```bash
tree-sitter init-config
```

### Writing the Rules

To learn how to write tree-sitter grammar DSL, see:

- https://tree-sitter.github.io/tree-sitter/creating-parsers#the-grammar-dsl
- https://tree-sitter.github.io/tree-sitter/creating-parsers#writing-the-grammar

Reference sources:

1. https://github.com/tree-sitter/tree-sitter-rust - Rust's tree-sitter grammars
2. https://github.com/tree-sitter/tree-sitter-javascript - JavaScript's tree-sitter grammars
3. [Move parser syntax.rs](https://github.com/aptos-labs/aptos-core/blob/main/third_party/move/move-compiler/src/parser/syntax.rs) - Move's official parser

After coding:

```bash
npm run format           # Format code
tree-sitter generate     # Generate parser
```

### Testing the Grammar

Test on individual files:

```bash
tree-sitter parse ${MOVE_FILE}
```

Useful flags:
- `-d`: show parsing debug log
- `-D`: produce log.html with debugging graphs

Batch testing:

```bash
python3 batch-test.py <PATH> [<PATH> ...]
```

### Submitting Code

Before committing:

```bash
npm run format
tree-sitter generate
```

Remember to include all updated generated code in your commit.

---

## 📦 TypeScript Indexer

The TypeScript-based function indexer tool is located in the `indexer/` directory.

### Setup

```bash
npm install
npm run build:indexer
```

### Usage

See `indexer/README.md` for detailed documentation.

---

## 📄 License

Apache License 2.0

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

- Author: ArArgon
- Email: liaozping@gmail.com

## 🙏 Acknowledgments

- Tree-sitter team
- Aptos team
- All contributors
