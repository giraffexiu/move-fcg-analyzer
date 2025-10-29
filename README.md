# Tree-sitter Move on Aptos

简体中文 | English

——

简述：本仓库包含 Move 语言的 Tree‑sitter 语法与一个轻量的 Python 库 Aptos Move Analyzer，可对 Aptos Move 项目进行索引与函数查询，并以 JSON 输出结果。

Brief: This repo provides a Tree‑sitter grammar for Move and a lightweight Python library, Aptos Move Analyzer, to index and query Aptos Move projects with JSON output.

—

## 🐍 Aptos Move Analyzer（Python 库）/ Python Library

### 快速安装 / Quick Install

```bash
# 建议在虚拟环境中 / In a virtualenv
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -U pip
pip install -e .

# 可选验证 / Optional verify
python -c "import aptos_move_analyzer as m; print(m.__version__)"
```

要点 / Notes:
- 无需预编译绑定：首次使用会通过 `tree-sitter` 从本仓库 `src/` 自动编译并加载 Move 语言（需要 C/C++ 构建工具）。
- Ensure build tools: macOS（Xcode CLT）、Linux（build‑essential 或等价）、Windows（推荐 WSL2，或安装 Visual Studio Build Tools）。

### 最简用法 / Minimal Usage

```python
from aptos_move_analyzer import MoveFunctionAnalyzer
import json

analyzer = MoveFunctionAnalyzer()
data = analyzer.analyze_raw("./test/caas-framework", "label::get_address_labels")
print(json.dumps(data if data is not None else None, ensure_ascii=False))
```

命令行 / CLI:

```bash
aptos-move-analyzer <project_path> <function_name> --json
# 示例 / Example
aptos-move-analyzer ./test/caas-framework label::get_address_labels --json
```

### 语言加载机制 / How Language Loads

加载顺序 / Order:
1) 尝试导入 Python 绑定 `tree_sitter_move_on_aptos.language()`；
2) 失败则回退为本地编译：使用 `tree_sitter.Language.build_library` 从 `src/` 生成并加载共享库（默认写入 `build/move_aptos.so`）。

Windows 原生环境可能无法加载 `.so`，建议优先使用 WSL2；或自行生成平台对应后缀（如 `.dll`）并调整加载路径。

—

## 🛠️ 从源码构建（Linux/macOS/Windows）/ Build from Source

1) 克隆 / Clone

```bash
git clone https://github.com/aptos-labs/tree-sitter-move-on-aptos.git
cd tree-sitter-move-on-aptos
```

2) 准备环境 / Prepare

- Python 3.8+，推荐虚拟环境；Install in venv.
- 安装本库 / Install the library: `pip install -e .`（自动安装 `tree-sitter`）。
- 安装系统构建工具 / Install system toolchain：
  - macOS: `xcode-select --install`
  - Ubuntu/Debian: `sudo apt-get update && sudo apt-get install -y build-essential`
  - Fedora/CentOS: `sudo dnf/yum install -y gcc make`
  - Windows: 推荐 WSL2；原生需 Visual Studio Build Tools。

3) 首次运行自动编译 / First Run Auto‑Compile

首次调用 `ProjectIndexer()` 且未发现 Python 绑定时，将自动从 `src/` 编译共享库并加载。Windows 原生若加载失败，优先在 WSL2 运行。

—

## 🚀 更细粒度用法 / Granular Usage

```python
from aptos_move_analyzer import ProjectIndexer, FunctionQueryEngine
import json

indexer = ProjectIndexer()
engine = FunctionQueryEngine()
index = indexer.index_project("./test/caas-framework")
result = engine.query_function(index, "label::get_address_labels")

if result:
    print(json.dumps(result.to_json(), indent=2, ensure_ascii=False))
```

仅输出 JSON 的测试脚本 / JSON‑only test script:

编辑仓库根目录 `test.py` 内的变量并运行 / Edit variables in `test.py` and run:

```python
project_path = "test/caas-framework"
function_name = "label::get_address_labels"
```

```bash
python3 test.py
```

输出字段 / Output fields：`contract`、`function`、`source`、`location`（文件与起止行）、`parameter`。`calls` 当前为占位，后续逐步完善。

—

## ❓ 常见问题 / Troubleshooting

- ImportError 找不到绑定 / Missing binding：属正常回退路径；若编译失败，请确认 C/C++ 工具是否安装。
- Windows 加载 `.so` 失败 / Cannot load `.so` on Windows：建议使用 WSL2，或编译 `.dll` 并调整路径。
- Move.toml 解析告警 / Move.toml parse warnings：非致命，索引仍会继续。
- 仅输出 JSON / JSON‑only: 参考 `test.py` 中对 stdout 的抑制逻辑。

—

## 📁 项目结构（精简）/ Slim Project Layout

```
aptos_move_analyzer/
  analyzer.py      # 单函数查询并返回 JSON / Minimal analyzer wrapper
  indexer.py       # 索引器与语言加载 / Indexer and language loading
  query_engine.py  # 查询引擎 / Query engine
  call_extractor.py# 调用提取（精简）/ Call extractor (minimal)
  types.py         # 类型与序列化 / Types and JSON

test.py            # JSON-only 示例 / JSON-only example
grammar.js, src/   # Tree-sitter 语法与生成代码 / Grammar & generated
```

—

## 📜 许可 / License

Apache License 2.0