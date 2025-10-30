# Linux 平台构建指南

本文档提供在 Linux 平台上构建 move-fcg-analyzer Python 包的完整指南。

## 环境要求

在开始构建之前，请确保您的 Linux 系统满足以下要求：

### 必需软件

- **Python 3.8+**: 支持 Python 3.8, 3.9, 3.10, 3.11, 3.12
- **Node.js 18+**: 用于构建 TypeScript indexer 和 Node.js binding
- **GCC/build-essential**: C 编译器和构建工具
- **tree-sitter-cli**: Tree-sitter 解析器生成工具
- **Git**: 用于克隆项目

### 安装依赖

#### Ubuntu/Debian 系统

```bash
# 更新包管理器
sudo apt-get update

# 安装 build-essential (包含 GCC 和 make)
sudo apt-get install -y build-essential

# 安装 Python 3 和 pip
sudo apt-get install -y python3 python3-pip python3-venv

# 安装 Node.js 18+ (使用 NodeSource 仓库)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 Git
sudo apt-get install -y git
```

#### RHEL/CentOS/Fedora 系统

```bash
# 安装开发工具
sudo yum groupinstall -y "Development Tools"

# 或者在 Fedora 上
sudo dnf groupinstall -y "Development Tools"

# 安装 Python 3
sudo yum install -y python3 python3-pip

# 安装 Node.js 18+
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 安装 Git
sudo yum install -y git
```

#### 验证安装

```bash
# 验证 Python 版本
python3 --version  # 应该显示 3.8 或更高版本

# 验证 Node.js 版本
node --version     # 应该显示 v18.x 或更高版本
npm --version

# 验证 GCC
gcc --version

# 验证 Git
git --version
```

## 构建步骤

### 1. 克隆项目

```bash
# 克隆项目仓库
git clone https://github.com/your-org/move-fcg-analyzer.git
cd move-fcg-analyzer

# 切换到要构建的版本（如果需要）
git checkout v1.0.9
```

### 2. 安装 Node.js 依赖

```bash
# 安装项目依赖
npm install

# 全局安装 tree-sitter-cli
npm install -g tree-sitter-cli

# 验证 tree-sitter-cli 安装
tree-sitter --version
```

### 3. 生成 Tree-sitter Parser

```bash
# 使用 tree-sitter 生成 parser
tree-sitter generate

# 这将生成以下文件：
# - src/parser.c
# - src/tree_sitter/parser.h
# - src/grammar.json
# - src/node-types.json
```

### 4. 构建 Node.js Binding

```bash
# 使用 node-gyp 构建 native binding
npx node-gyp rebuild

# 构建成功后，会在 build/Release/ 目录下生成：
# - tree_sitter_move_binding.node
```

### 5. 构建 TypeScript Indexer

```bash
# 编译 TypeScript 代码
npm run build:indexer

# 这将在 dist/ 目录下生成编译后的 JavaScript 文件
```

### 6. 复制构建产物

```bash
# 复制 TypeScript 编译输出到包目录
rm -rf move_fcg_analyzer/dist
cp -r dist move_fcg_analyzer/dist

# 复制 Node.js binding 到包目录
mkdir -p move_fcg_analyzer/build/Release
cp build/Release/tree_sitter_move_binding.node move_fcg_analyzer/build/Release/
```

### 7. 使用 cibuildwheel 构建 Wheels

cibuildwheel 是一个用于构建多平台、多 Python 版本 wheel 的工具。

#### 安装 cibuildwheel

```bash
# 创建 Python 虚拟环境（推荐）
python3 -m venv build-env
source build-env/bin/activate

# 安装 cibuildwheel
pip install cibuildwheel
```

#### 配置说明

项目的 `pyproject.toml` 已包含 cibuildwheel 配置：

```toml
[tool.cibuildwheel]
# 构建 CPython 3.8 到 3.12
build = "cp38-* cp39-* cp310-* cp311-* cp312-*"

# 跳过 PyPy 构建
skip = "pp*"

# 构建详细输出
build-verbosity = 1

# 支持 musllinux 以获得更广泛的 Linux 兼容性
[tool.cibuildwheel.linux]
musllinux-x86_64-image = "musllinux_1_1"
musllinux-aarch64-image = "musllinux_1_1"
```

#### 执行构建

```bash
# 构建所有支持的 Python 版本的 wheels
cibuildwheel --platform linux --output-dir wheelhouse

# 构建过程会：
# 1. 为每个 Python 版本创建隔离环境
# 2. 编译 C 扩展
# 3. 打包 wheel 文件
# 4. 输出到 wheelhouse/ 目录
```

#### 构建输出

构建完成后，`wheelhouse/` 目录将包含：

```
wheelhouse/
├── move_fcg_analyzer-1.0.9-cp38-cp38-manylinux_2_28_x86_64.whl
├── move_fcg_analyzer-1.0.9-cp38-cp38-musllinux_1_1_x86_64.whl
├── move_fcg_analyzer-1.0.9-cp39-cp39-manylinux_2_28_x86_64.whl
├── move_fcg_analyzer-1.0.9-cp39-cp39-musllinux_1_1_x86_64.whl
├── move_fcg_analyzer-1.0.9-cp310-cp310-manylinux_2_28_x86_64.whl
├── move_fcg_analyzer-1.0.9-cp310-cp310-musllinux_1_1_x86_64.whl
├── move_fcg_analyzer-1.0.9-cp311-cp311-manylinux_2_28_x86_64.whl
├── move_fcg_analyzer-1.0.9-cp311-cp311-musllinux_1_1_x86_64.whl
├── move_fcg_analyzer-1.0.9-cp312-cp312-manylinux_2_28_x86_64.whl
└── move_fcg_analyzer-1.0.9-cp312-cp312-musllinux_1_1_x86_64.whl
```

### 8. 构建源码分发包 (sdist)

```bash
# 安装 build 工具
pip install build

# 构建 source distribution
python -m build --sdist --outdir dist/

# 这将在 dist/ 目录下生成：
# - move_fcg_analyzer-1.0.9.tar.gz
```

## 构建验证

### 验证 Wheel 文件

```bash
# 创建测试虚拟环境
python3 -m venv test-env
source test-env/bin/activate

# 安装构建的 wheel（选择一个与当前 Python 版本匹配的）
pip install wheelhouse/move_fcg_analyzer-1.0.9-cp310-cp310-manylinux_2_28_x86_64.whl

# 验证导入
python -c "import move_fcg_analyzer; print(move_fcg_analyzer.__version__)"
# 应该输出: 1.0.9

# 验证 CLI 命令
move-fcg-analyzer --help
# 应该显示帮助信息

# 清理测试环境
deactivate
rm -rf test-env
```

### 验证源码分发包

```bash
# 创建测试虚拟环境
python3 -m venv test-sdist-env
source test-sdist-env/bin/activate

# 从 sdist 安装
pip install dist/move_fcg_analyzer-1.0.9.tar.gz

# 验证功能
python -c "import move_fcg_analyzer; print(move_fcg_analyzer.__version__)"
move-fcg-analyzer --help

# 清理
deactivate
rm -rf test-sdist-env
```

### 功能测试

```bash
# 使用测试项目验证功能
move-fcg-analyzer test/caas-framework grant_read_authorization

# 验证输出 JSON 格式正确
# 应该输出函数调用图的 JSON 数据
```

## 自动化构建脚本

为了简化构建过程，项目提供了自动化构建脚本 `build_linux.sh`。

### 使用方法

```bash
# 赋予执行权限
chmod +x build_linux.sh

# 运行构建脚本
./build_linux.sh

# 脚本将自动执行所有构建步骤
```

### 脚本输出

构建完成后，您将获得：
- `wheelhouse/` - 包含所有 Linux wheels
- `dist/` - 包含源码分发包

## 常见问题

### 问题 1: node-gyp 构建失败

**错误信息**: `gyp ERR! build error`

**解决方案**:
```bash
# 确保安装了 build-essential
sudo apt-get install -y build-essential

# 清理并重新构建
rm -rf build
npx node-gyp clean
npx node-gyp rebuild
```

### 问题 2: tree-sitter generate 失败

**错误信息**: `tree-sitter: command not found`

**解决方案**:
```bash
# 重新安装 tree-sitter-cli
npm install -g tree-sitter-cli

# 验证安装
which tree-sitter
tree-sitter --version
```

### 问题 3: cibuildwheel 构建失败

**错误信息**: `Failed to build wheel`

**解决方案**:
```bash
# 检查详细日志
cibuildwheel --platform linux --output-dir wheelhouse --build-verbosity 3

# 确保所有前置步骤已完成
# 1. tree-sitter generate
# 2. node-gyp rebuild
# 3. npm run build:indexer
# 4. 复制构建产物
```

### 问题 4: Python 版本不匹配

**错误信息**: `Python version mismatch`

**解决方案**:
```bash
# 安装特定 Python 版本
sudo apt-get install -y python3.10 python3.10-venv python3.10-dev

# 使用特定版本创建虚拟环境
python3.10 -m venv build-env
source build-env/bin/activate
```

### 问题 5: 缺少 C 编译器

**错误信息**: `error: command 'gcc' failed`

**解决方案**:
```bash
# Ubuntu/Debian
sudo apt-get install -y build-essential python3-dev

# RHEL/CentOS
sudo yum install -y gcc gcc-c++ python3-devel
```

## 性能优化

### 并行构建

```bash
# 使用多核加速 cibuildwheel 构建
CIBW_BUILD_VERBOSITY=1 cibuildwheel --platform linux --output-dir wheelhouse
```

### 缓存依赖

```bash
# 使用 npm ci 代替 npm install（更快且可重现）
npm ci
```

## 下一步

构建完成后，请参考 [PUBLISH.md](PUBLISH.md) 了解如何将构建产物上传到 PyPI。

## 技术支持

如果遇到问题，请：
1. 检查本文档的"常见问题"部分
2. 查看构建日志中的详细错误信息
3. 在项目 GitHub 仓库提交 Issue
