# Aptos Function Indexer | Aptos 函数索引器

[English](#english) | [中文](#chinese)

---

<a name="english"></a>
## English

A TypeScript-based tool for indexing and querying Aptos Move projects.

### Getting Started

#### Prerequisites

Before setting up the indexer, ensure you have:

- Node.js (v16 or higher)
- npm (comes with Node.js)
- A working C compiler (for building tree-sitter native bindings)
  - macOS: Install Xcode Command Line Tools
  - Linux: Install `build-essential` or equivalent
  - Windows: Install Visual Studio Build Tools

#### Installation Steps

1. **Navigate to the project root directory**:
   ```bash
   cd tree-sitter-move-on-aptos
   ```

2. **Install all dependencies**:
   ```bash
   npm install
   ```
   
   This will install:
   - `tree-sitter` (^0.21.0) - Parser framework
   - `typescript` (^5.9.3) - TypeScript compiler
   - `@types/node` (^20.0.0) - Node.js type definitions
   - `tree-sitter-move-on-aptos` - Move parser (built from source)
   - Other required dependencies

3. **Verify tree-sitter installation**:
   ```bash
   node -e "const Parser = require('tree-sitter'); console.log('tree-sitter loaded successfully');"
   ```
   
   Expected output: `tree-sitter loaded successfully`

4. **Verify Move parser loading**:
   ```bash
   node -e "const Parser = require('tree-sitter'); const Move = require('./bindings/node'); const parser = new Parser(); parser.setLanguage(Move); console.log('Move parser loaded successfully');"
   ```
   
   Expected output: `Move parser loaded successfully`

5. **Build the indexer**:
   ```bash
   npm run build:indexer
   ```
   
   This compiles TypeScript files from `indexer/src/` to the `dist/` directory.

6. **Verify the build**:
   ```bash
   ls -la dist/src/
   ```
   
   You should see compiled `.js` and `.d.ts` files.

### CLI Usage

#### Basic Usage

```bash
node dist/src/cli.js <project_path> <function_name>
```

#### Using npm script

```bash
npm run indexer <project_path> <function_name>
```

#### Arguments

- `project_path`: Path to the Aptos Move project directory (must contain Move.toml)
- `function_name`: Name of the function to query
  - Simple name: `grant_read_authorization`
  - Module-qualified: `authorization::grant_read_authorization`
  - Fully-qualified: `address::module::function`

#### Examples

Query a function by simple name:

```bash
node dist/src/cli.js ./test/caas-framework grant_read_authorization
```

Query a function by module-qualified name:

```bash
node dist/src/cli.js ./test/caas-framework identity::verify_identity
```

Using npm script:

```bash
npm run indexer ./test/caas-framework grant_read_authorization
```

### Output Format

The CLI outputs JSON to stdout with the following structure:

```json
{
  "contract": "module_name",
  "function": "function_signature",
  "source": "function_source_code",
  "location": {
    "file": "/path/to/file.move",
    "start_line": 10,
    "end_line": 50
  },
  "parameter": [
    {
      "name": "param_name",
      "type": "param_type"
    }
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

### Error Handling

The CLI provides user-friendly error messages for common issues:

- **Function not found**: When the specified function doesn't exist in the project
- **Invalid project path**: When the project directory doesn't exist
- **Missing Move.toml**: Warning when Move.toml is not found (uses default package name)
- **Parse errors**: Logs errors for individual files but continues processing

All error messages are written to stderr, while the JSON output goes to stdout.

### Exit Codes

- `0`: Success
- `1`: Error (function not found, invalid path, etc.)

### Logging

Progress messages are written to stderr:
- Indexing progress
- Number of modules and functions indexed
- Query status

This allows you to redirect the JSON output to a file while still seeing progress:

```bash
node dist/src/cli.js ./test/caas-framework grant_read_authorization > output.json
```

### Project Structure

```
indexer/
├── src/
│   ├── types.ts           # Core data model interfaces
│   ├── parser.ts          # Move file parser
│   ├── indexer.ts         # Project indexer
│   ├── query-engine.ts    # Function query engine
│   ├── call-extractor.ts  # Call extraction
│   ├── json-formatter.ts  # JSON output formatter
│   ├── cli.ts             # CLI interface
│   └── index.ts           # Main entry point
└── README.md              # This file

dist/                      # Compiled output (generated)
├── src/
│   ├── *.js
│   └── *.d.ts
```

### Core Interfaces

The following interfaces are defined in `src/types.ts`:

- **ProjectIndex**: Project-level index containing all modules and functions
- **ModuleInfo**: Information about a Move module
- **FunctionInfo**: Detailed function metadata (name, parameters, location, source code)
- **ParameterInfo**: Function parameter information (name and type)
- **CallInfo**: Function call information within a function body
- **QueryResultJSON**: JSON output format for query results
- **StructInfo**: Struct definition information
- **ConstantInfo**: Constant definition information
- **DependencyInfo**: Project dependency information
- **ParsedFile**: Tree-sitter parsed file result
- **FunctionQueryResult**: Function query result with calls

### Development

#### Building

To compile TypeScript files:

```bash
npm run build:indexer
```

#### Type Checking

To check for TypeScript errors without compiling:

```bash
npx tsc --noEmit
```

#### Checking TypeScript Version

```bash
npx tsc --version
```

### Architecture

The indexer uses the tree-sitter-move-on-aptos parser from the parent directory to parse Move source files. It builds an in-memory index of all modules and functions in a Move project, enabling fast queries for function information and call graphs.

---

<a name="chinese"></a>
## 中文

一个基于 TypeScript 的 Aptos Move 项目索引和查询工具。

### 快速开始

#### 前置要求

在设置索引器之前，请确保您已安装：

- Node.js (v16 或更高版本)
- npm (随 Node.js 一起安装)
- 可用的 C 编译器（用于构建 tree-sitter 原生绑定）
  - macOS: 安装 Xcode Command Line Tools
  - Linux: 安装 `build-essential` 或等效工具
  - Windows: 安装 Visual Studio Build Tools

#### 安装步骤

1. **进入项目根目录**：
   ```bash
   cd tree-sitter-move-on-aptos
   ```

2. **安装所有依赖**：
   ```bash
   npm install
   ```
   
   这将安装：
   - `tree-sitter` (^0.21.0) - 解析器框架
   - `typescript` (^5.9.3) - TypeScript 编译器
   - `@types/node` (^20.0.0) - Node.js 类型定义
   - `tree-sitter-move-on-aptos` - Move 解析器（从源码构建）
   - 其他必需的依赖项

3. **验证 tree-sitter 安装**：
   ```bash
   node -e "const Parser = require('tree-sitter'); console.log('tree-sitter loaded successfully');"
   ```
   
   预期输出：`tree-sitter loaded successfully`

4. **验证 Move 解析器加载**：
   ```bash
   node -e "const Parser = require('tree-sitter'); const Move = require('./bindings/node'); const parser = new Parser(); parser.setLanguage(Move); console.log('Move parser loaded successfully');"
   ```
   
   预期输出：`Move parser loaded successfully`

5. **构建索引器**：
   ```bash
   npm run build:indexer
   ```
   
   这会将 `indexer/src/` 中的 TypeScript 文件编译到 `dist/` 目录。

6. **验证构建**：
   ```bash
   ls -la dist/src/
   ```
   
   您应该能看到编译后的 `.js` 和 `.d.ts` 文件。

### CLI 使用方法

#### 基本用法

```bash
node dist/src/cli.js <项目路径> <函数名>
```

#### 使用 npm 脚本

```bash
npm run indexer <项目路径> <函数名>
```

#### 参数说明

- `项目路径`: Aptos Move 项目目录的路径（必须包含 Move.toml）
- `函数名`: 要查询的函数名称
  - 简单名称：`grant_read_authorization`
  - 模块限定名：`authorization::grant_read_authorization`
  - 完全限定名：`address::module::function`

#### 示例

通过简单名称查询函数：

```bash
node dist/src/cli.js ./test/caas-framework grant_read_authorization
```

通过模块限定名查询函数：

```bash
node dist/src/cli.js ./test/caas-framework identity::verify_identity
```

使用 npm 脚本：

```bash
npm run indexer ./test/caas-framework grant_read_authorization
```

### 输出格式

CLI 将 JSON 输出到标准输出，结构如下：

```json
{
  "contract": "模块名",
  "function": "函数签名",
  "source": "函数源代码",
  "location": {
    "file": "/文件路径/file.move",
    "start_line": 10,
    "end_line": 50
  },
  "parameter": [
    {
      "name": "参数名",
      "type": "参数类型"
    }
  ],
  "calls": [
    {
      "file": "/被调用函数的文件路径/function.move",
      "function": "被调用的函数名",
      "module": "被调用的模块名"
    }
  ]
}
```

### 错误处理

CLI 为常见问题提供友好的错误消息：

- **函数未找到**：当指定的函数在项目中不存在时
- **无效的项目路径**：当项目目录不存在时
- **缺少 Move.toml**：当未找到 Move.toml 时的警告（使用默认包名）
- **解析错误**：记录单个文件的错误但继续处理

所有错误消息都写入标准错误输出，而 JSON 输出则写入标准输出。

### 退出代码

- `0`: 成功
- `1`: 错误（函数未找到、无效路径等）

### 日志记录

进度消息写入标准错误输出：
- 索引进度
- 已索引的模块和函数数量
- 查询状态

这允许您将 JSON 输出重定向到文件，同时仍能看到进度：

```bash
node dist/src/cli.js ./test/caas-framework grant_read_authorization > output.json
```

### 项目结构

```
indexer/
├── src/
│   ├── types.ts           # 核心数据模型接口
│   ├── parser.ts          # Move 文件解析器
│   ├── indexer.ts         # 项目索引器
│   ├── query-engine.ts    # 函数查询引擎
│   ├── call-extractor.ts  # 调用提取器
│   ├── json-formatter.ts  # JSON 输出格式化器
│   ├── cli.ts             # CLI 接口
│   └── index.ts           # 主入口点
└── README.md              # 本文件

dist/                      # 编译输出（自动生成）
├── src/
│   ├── *.js
│   └── *.d.ts
```

### 核心接口

以下接口定义在 `src/types.ts` 中：

- **ProjectIndex**: 项目级索引，包含所有模块和函数
- **ModuleInfo**: Move 模块信息
- **FunctionInfo**: 详细的函数元数据（名称、参数、位置、源代码）
- **ParameterInfo**: 函数参数信息（名称和类型）
- **CallInfo**: 函数体内的函数调用信息
- **QueryResultJSON**: 查询结果的 JSON 输出格式
- **StructInfo**: 结构体定义信息
- **ConstantInfo**: 常量定义信息
- **DependencyInfo**: 项目依赖信息
- **ParsedFile**: Tree-sitter 解析的文件结果
- **FunctionQueryResult**: 带调用信息的函数查询结果

### 开发

#### 构建

编译 TypeScript 文件：

```bash
npm run build:indexer
```

#### 类型检查

在不编译的情况下检查 TypeScript 错误：

```bash
npx tsc --noEmit
```

#### 检查 TypeScript 版本

```bash
npx tsc --version
```

### 架构

索引器使用父目录中的 tree-sitter-move-on-aptos 解析器来解析 Move 源文件。它构建 Move 项目中所有模块和函数的内存索引，支持快速查询函数信息和调用图。
