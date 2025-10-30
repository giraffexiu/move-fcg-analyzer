#!/bin/bash
# Linux 平台自动化构建脚本
# 用于构建 move-fcg-analyzer Python 包的所有 Linux wheels 和 sdist

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 未安装，请先安装 $1"
        exit 1
    fi
}

# 步骤 0: 检查环境
print_info "检查构建环境..."
check_command node
check_command npm
check_command python3
check_command gcc
check_command git

# 检查 Python 版本
PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
print_info "Python 版本: $PYTHON_VERSION"

# 检查 Node.js 版本
NODE_VERSION=$(node --version)
print_info "Node.js 版本: $NODE_VERSION"

# 步骤 1: 安装 Node.js 依赖
print_info "安装 Node.js 依赖..."
npm install

# 步骤 2: 安装 tree-sitter-cli
print_info "检查 tree-sitter-cli..."
if ! command -v tree-sitter &> /dev/null; then
    print_warning "tree-sitter-cli 未安装，正在安装..."
    npm install -g tree-sitter-cli
else
    TREE_SITTER_VERSION=$(tree-sitter --version)
    print_info "tree-sitter-cli 已安装: $TREE_SITTER_VERSION"
fi

# 步骤 3: 生成 parser
print_info "生成 Tree-sitter parser..."
tree-sitter generate

# 验证生成的文件
if [ ! -f "src/parser.c" ]; then
    print_error "parser.c 生成失败"
    exit 1
fi
print_info "Parser 生成成功"

# 步骤 4: 构建 Node.js binding
print_info "构建 Node.js native binding..."
npx node-gyp rebuild

# 验证 binding 文件
if [ ! -f "build/Release/tree_sitter_move_binding.node" ]; then
    print_error "Node.js binding 构建失败"
    exit 1
fi
print_info "Node.js binding 构建成功"

# 步骤 5: 构建 TypeScript indexer
print_info "构建 TypeScript indexer..."
npm run build:indexer

# 验证 TypeScript 编译输出
if [ ! -d "dist" ]; then
    print_error "TypeScript 编译失败"
    exit 1
fi
print_info "TypeScript indexer 构建成功"

# 步骤 6: 复制构建产物到包目录
print_info "复制构建产物到包目录..."

# 复制 TypeScript 编译输出
rm -rf move_fcg_analyzer/dist
cp -r dist move_fcg_analyzer/dist
print_info "已复制 TypeScript 编译输出"

# 复制 Node.js binding
mkdir -p move_fcg_analyzer/build/Release
cp build/Release/tree_sitter_move_binding.node move_fcg_analyzer/build/Release/
print_info "已复制 Node.js binding"

# 步骤 7: 设置 Python 虚拟环境
print_info "设置 Python 虚拟环境..."
if [ -d "build-env" ]; then
    print_warning "删除现有的 build-env 虚拟环境"
    rm -rf build-env
fi

python3 -m venv build-env
source build-env/bin/activate
print_info "Python 虚拟环境已激活"

# 步骤 8: 安装构建工具
print_info "安装 Python 构建工具..."
pip install --upgrade pip
pip install cibuildwheel build twine

# 步骤 9: 使用 cibuildwheel 构建 wheels
print_info "使用 cibuildwheel 构建 Linux wheels..."
print_info "这可能需要几分钟时间，请耐心等待..."

# 清理旧的 wheelhouse
if [ -d "wheelhouse" ]; then
    rm -rf wheelhouse
fi

# 构建 wheels
cibuildwheel --platform linux --output-dir wheelhouse

# 验证 wheels
WHEEL_COUNT=$(ls -1 wheelhouse/*.whl 2>/dev/null | wc -l)
if [ $WHEEL_COUNT -eq 0 ]; then
    print_error "没有生成任何 wheel 文件"
    exit 1
fi
print_info "成功构建 $WHEEL_COUNT 个 wheel 文件"

# 步骤 10: 构建源码分发包
print_info "构建源码分发包 (sdist)..."

# 清理旧的 dist 目录（只清理 .tar.gz 文件）
rm -f dist/*.tar.gz

# 构建 sdist
python -m build --sdist --outdir dist/

# 验证 sdist
if [ ! -f dist/*.tar.gz ]; then
    print_error "源码分发包构建失败"
    exit 1
fi
print_info "源码分发包构建成功"

# 步骤 11: 验证构建产物
print_info "验证构建产物..."
twine check wheelhouse/*.whl dist/*.tar.gz

if [ $? -eq 0 ]; then
    print_info "所有构建产物验证通过"
else
    print_error "构建产物验证失败"
    exit 1
fi

# 步骤 12: 显示构建摘要
print_info "=========================================="
print_info "构建完成！"
print_info "=========================================="
print_info ""
print_info "构建产物位置："
print_info "  Wheels: wheelhouse/"
ls -lh wheelhouse/*.whl | awk '{print "    - " $9 " (" $5 ")"}'
print_info ""
print_info "  Source distribution: dist/"
ls -lh dist/*.tar.gz | awk '{print "    - " $9 " (" $5 ")"}'
print_info ""
print_info "下一步："
print_info "  1. 验证构建产物（已完成）"
print_info "  2. 测试安装 wheel 包"
print_info "  3. 收集 macOS wheels（如需要）"
print_info "  4. 参考 PUBLISH.md 上传到 PyPI"
print_info ""
print_info "快速测试命令："
print_info "  python3 -m venv test-env"
print_info "  source test-env/bin/activate"
print_info "  pip install wheelhouse/move_fcg_analyzer-1.0.9-*.whl"
print_info "  move-fcg-analyzer --help"
print_info ""

# 退出虚拟环境
deactivate

print_info "构建脚本执行完成"
