# macOS 平台构建指南

本文档提供在 macOS 平台上构建 move-fcg-analyzer Python 包的完整指南。

## 环境要求

在开始构建之前，请确保您的 macOS 系统满足以下要求：

### 必需软件

- **Python 3.8+**: 支持 Python 3.8, 3.9, 3.10, 3.11, 3.12
- **Node.js 18+**: 用于构建 TypeScript indexer 和 Node.js binding
- **Xcode Command Line Tools**: C 编译器和构建工具
- **tree-sitter-cli**: Tree-sitter 解析器生成工具
- **Git**: 用于克隆项目

### 安装依赖

#### 安装 Xcode Command Line Tools

```bash
# 安装 Xcode Command Line Tools
xcode-select --install

# 验证安装
xcode-select -p
# 应该输出: /Library/Developer/CommandLineTools

# 验证 C 编译器
gcc --version
clang --version
```

#### 安装 Homebrew（推荐）

如果您还没有安装 Homebrew，建议先安装：

```bash
# 安装 Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 验证安装
brew --version
```

#### 安装 Python

```bash
# 使用 Homebrew 安装 Python
brew install python@3.10

# 或者安装多个版本
brew install python@3.8 python@3.9 python@3.10 python@3.11 python@3.12

# 验证安装
python3 --version
pip3 --version
```

#### 安装 Node.js

```bash
# 使用 Homebrew 安装 Node.js
brew install node@18

# 或者使用 nvm 管理多个 Node.js 版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# 验证安装
node --version     # 应该显示 v18.x 或更高版本
npm --version
```

#### 安装 Git

```bash
# Git 通常随 Xcode Command Line Tools 一起安装
# 如果需要最新版本，可以使用 Homebrew
brew install git

# 验证安装
git --version
```

#### 验证所有依赖

```bash
# 验证 Python 版本
python3 --version  # 应该显示 3.8 或更高版本

# 验证 Node.js 版本
node --version     # 应该显示 v18.x 或更高版本
npm --version

# 验证编译工具
gcc --version
clang --version

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

# macOS 特定配置
[tool.cibuildwheel.macos]
# 支持 x86_64 和 arm64 (Apple Silicon)
archs = ["x86_64", "arm64"]
```

#### 执行构建

```bash
# 构建所有支持的 Python 版本和架构的 wheels
cibuildwheel --platform macos --output-dir wheelhouse

# 构建过程会：
# 1. 为每个 Python 版本创建隔离环境
# 2. 为 x86_64 和 arm64 架构分别编译 C 扩展
# 3. 打包 wheel 文件
# 4. 输出到 wheelhouse/ 目录
```

#### 仅构建特定架构

```bash
# 仅构建 x86_64 架构
cibuildwheel --platform macos --archs x86_64 --output-dir wheelhouse

# 仅构建 arm64 架构（Apple Silicon）
cibuildwheel --platform macos --archs arm64 --output-dir wheelhouse

# 构建通用二进制（universal2）
cibuildwheel --platform macos --archs universal2 --output-dir wheelhouse
```

#### 构建输出

构建完成后，`wheelhouse/` 目录将包含：

```
wheelhouse/
├── move_fcg_analyzer-1.0.9-cp38-cp38-macosx_10_9_x86_64.whl
├── move_fcg_analyzer-1.0.9-cp38-cp38-macosx_11_0_arm64.whl
├── move_fcg_analyzer-1.0.9-cp39-cp39-macosx_10_9_x86_64.whl
├── move_fcg_analyzer-1.0.9-cp39-cp39-macosx_11_0_arm64.whl
├── move_fcg_analyzer-1.0.9-cp310-cp310-macosx_10_9_x86_64.whl
├── move_fcg_analyzer-1.0.9-cp310-cp310-macosx_11_0_arm64.whl
├── move_fcg_analyzer-1.0.9-cp311-cp311-macosx_10_9_x86_64.whl
├── move_fcg_analyzer-1.0.9-cp311-cp311-macosx_11_0_arm64.whl
├── move_fcg_analyzer-1.0.9-cp312-cp312-macosx_10_9_x86_64.whl
└── move_fcg_analyzer-1.0.9-cp312-cp312-macosx_11_0_arm64.whl
```

## 构建验证

### 验证 Wheel 文件

```bash
# 创建测试虚拟环境
python3 -m venv test-env
source test-env/bin/activate

# 安装构建的 wheel（选择一个与当前 Python 版本和架构匹配的）
# 对于 Intel Mac (x86_64):
pip install wheelhouse/move_fcg_analyzer-1.0.9-cp310-cp310-macosx_10_9_x86_64.whl

# 对于 Apple Silicon Mac (arm64):
pip install wheelhouse/move_fcg_analyzer-1.0.9-cp310-cp310-macosx_11_0_arm64.whl

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

### 检查架构兼容性

```bash
# 检查当前系统架构
uname -m
# x86_64 = Intel Mac
# arm64 = Apple Silicon Mac

# 检查 wheel 文件支持的架构
unzip -l wheelhouse/move_fcg_analyzer-1.0.9-cp310-cp310-macosx_10_9_x86_64.whl | grep ".so\|.dylib"
```

### 功能测试

```bash
# 使用测试项目验证功能
move-fcg-analyzer test/caas-framework grant_read_authorization

# 验证输出 JSON 格式正确
# 应该输出函数调用图的 JSON 数据
```

## 自动化构建脚本

为了简化构建过程，项目提供了自动化构建脚本 `build_macos.sh`。

### 使用方法

```bash
# 赋予执行权限
chmod +x build_macos.sh

# 运行构建脚本
./build_macos.sh

# 脚本将自动执行所有构建步骤
```

### 脚本输出

构建完成后，您将获得：
- `wheelhouse/` - 包含所有 macOS wheels (x86_64 和 arm64)

## 常见问题

### 问题 1: node-gyp 构建失败

**错误信息**: `gyp ERR! build error` 或 `No Xcode or CLT version detected`

**解决方案**:
```bash
# 确保安装了 Xcode Command Line Tools
xcode-select --install

# 如果已安装但仍有问题，重置路径
sudo xcode-select --reset

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

# 如果使用 nvm，确保在正确的 Node.js 版本下
nvm use 18
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
cibuildwheel --platform macos --output-dir wheelhouse --build-verbosity 3

# 确保所有前置步骤已完成
# 1. tree-sitter generate
# 2. node-gyp rebuild
# 3. npm run build:indexer
# 4. 复制构建产物

# 检查是否有权限问题
sudo chown -R $(whoami) .
```

### 问题 4: Apple Silicon (M1/M2) 兼容性问题

**错误信息**: `architecture not supported` 或 `bad CPU type`

**解决方案**:
```bash
# 确保使用 arm64 原生 Python
which python3
file $(which python3)
# 应该显示 "arm64" 而不是 "x86_64"

# 如果需要，安装 arm64 原生 Python
arch -arm64 brew install python@3.10

# 使用 Rosetta 2 运行 x86_64 构建（如果需要）
arch -x86_64 /bin/bash
```

### 问题 5: Python 版本不匹配

**错误信息**: `Python version mismatch`

**解决方案**:
```bash
# 使用 pyenv 管理多个 Python 版本
brew install pyenv

# 安装特定 Python 版本
pyenv install 3.10.0
pyenv local 3.10.0

# 使用特定版本创建虚拟环境
python3.10 -m venv build-env
source build-env/bin/activate
```

### 问题 6: 缺少 C 编译器

**错误信息**: `error: command 'clang' failed`

**解决方案**:
```bash
# 重新安装 Xcode Command Line Tools
sudo rm -rf /Library/Developer/CommandLineTools
xcode-select --install

# 接受许可协议
sudo xcodebuild -license accept

# 验证安装
clang --version
```

### 问题 7: 权限问题

**错误信息**: `Permission denied` 或 `EACCES`

**解决方案**:
```bash
# 修复 npm 全局包权限
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# 或者修复当前目录权限
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

## 性能优化

### 并行构建

```bash
# cibuildwheel 默认会并行构建不同的 Python 版本
# 可以通过环境变量控制并行度
CIBW_BUILD_VERBOSITY=1 cibuildwheel --platform macos --output-dir wheelhouse
```

### 缓存依赖

```bash
# 使用 npm ci 代替 npm install（更快且可重现）
npm ci
```

### 跳过不需要的架构

```bash
# 如果只需要当前架构的 wheel
cibuildwheel --platform macos --archs $(uname -m) --output-dir wheelhouse
```

## Apple Silicon 特别说明

### 原生 arm64 构建

在 Apple Silicon Mac 上，建议使用原生 arm64 工具链：

```bash
# 检查当前 shell 架构
arch
# 应该显示 "arm64"

# 确保使用 arm64 原生 Homebrew
which brew
# 应该是 /opt/homebrew/bin/brew

# 确保使用 arm64 原生 Python
file $(which python3)
# 应该包含 "arm64"
```

### 交叉编译

如果需要在 Apple Silicon 上构建 x86_64 wheel：

```bash
# 使用 Rosetta 2 运行 x86_64 shell
arch -x86_64 /bin/bash

# 在 x86_64 模式下安装依赖和构建
arch -x86_64 brew install python@3.10
arch -x86_64 cibuildwheel --platform macos --archs x86_64 --output-dir wheelhouse
```

## 下一步

构建完成后，请参考 [PUBLISH.md](PUBLISH.md) 了解如何将构建产物与 Linux wheels 一起上传到 PyPI。

## 技术支持

如果遇到问题，请：
1. 检查本文档的"常见问题"部分
2. 查看构建日志中的详细错误信息
3. 在项目 GitHub 仓库提交 Issue
4. 对于 Apple Silicon 相关问题，请注明您的 Mac 型号和 macOS 版本
