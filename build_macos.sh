#!/bin/bash
set -e

echo "=========================================="
echo "macOS 平台构建脚本"
echo "move-fcg-analyzer v1.0.9"
echo "=========================================="
echo ""

# 检查必需的工具
echo "检查必需工具..."

if ! command -v node &> /dev/null; then
    echo "错误: Node.js 未安装"
    echo "请运行: brew install node@18"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "错误: npm 未安装"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "错误: Python 3 未安装"
    echo "请运行: brew install python@3.10"
    exit 1
fi

if ! command -v gcc &> /dev/null && ! command -v clang &> /dev/null; then
    echo "错误: C 编译器未安装"
    echo "请运行: xcode-select --install"
    exit 1
fi

echo "✓ Node.js $(node --version)"
echo "✓ npm $(npm --version)"
echo "✓ Python $(python3 --version)"
if command -v gcc &> /dev/null; then
    echo "✓ GCC $(gcc --version | head -n1)"
fi
if command -v clang &> /dev/null; then
    echo "✓ Clang $(clang --version | head -n1)"
fi
echo "✓ 架构: $(uname -m)"
echo ""

# 1. 安装 Node.js 依赖
echo "步骤 1/8: 安装 Node.js 依赖..."
npm install

# 2. 安装 tree-sitter-cli
echo ""
echo "步骤 2/8: 安装 tree-sitter-cli..."
if ! command -v tree-sitter &> /dev/null; then
    echo "全局安装 tree-sitter-cli..."
    npm install -g tree-sitter-cli
else
    echo "✓ tree-sitter-cli 已安装 ($(tree-sitter --version))"
fi

# 3. 生成 parser
echo ""
echo "步骤 3/8: 生成 Tree-sitter parser..."
tree-sitter generate

# 4. 构建 Node.js binding
echo ""
echo "步骤 4/8: 构建 Node.js binding..."
npx node-gyp rebuild

# 5. 构建 TypeScript indexer
echo ""
echo "步骤 5/8: 构建 TypeScript indexer..."
npm run build:indexer

# 6. 复制构建产物
echo ""
echo "步骤 6/8: 复制构建产物到包目录..."

echo "  - 复制 TypeScript 编译输出..."
rm -rf move_fcg_analyzer/dist
cp -r dist move_fcg_analyzer/dist

echo "  - 复制 Node.js binding..."
mkdir -p move_fcg_analyzer/build/Release
cp build/Release/tree_sitter_move_binding.node move_fcg_analyzer/build/Release/

echo "✓ 构建产物复制完成"

# 7. 安装 cibuildwheel
echo ""
echo "步骤 7/8: 准备 Python 构建环境..."

# 检查是否在虚拟环境中
if [[ -z "${VIRTUAL_ENV}" ]]; then
    echo "创建 Python 虚拟环境..."
    python3 -m venv build-env
    source build-env/bin/activate
    echo "✓ 虚拟环境已激活"
else
    echo "✓ 已在虚拟环境中: ${VIRTUAL_ENV}"
fi

echo "安装 cibuildwheel..."
pip install --upgrade pip
pip install cibuildwheel

# 8. 构建 wheels
echo ""
echo "步骤 8/8: 构建 macOS wheels..."
echo "这可能需要几分钟时间，请耐心等待..."
echo ""

# 检测当前架构并构建
ARCH=$(uname -m)
echo "当前架构: ${ARCH}"
echo "构建所有支持的架构 (x86_64 和 arm64)..."
echo ""

cibuildwheel --platform macos --output-dir wheelhouse

# 构建完成
echo ""
echo "=========================================="
echo "构建完成！"
echo "=========================================="
echo ""
echo "构建产物位置:"
echo "  - macOS wheels: wheelhouse/"
echo ""

# 列出构建的 wheel 文件
if [ -d "wheelhouse" ] && [ "$(ls -A wheelhouse)" ]; then
    echo "生成的 wheel 文件:"
    ls -lh wheelhouse/*.whl | awk '{print "  - " $9 " (" $5 ")"}'
    echo ""
    echo "总计: $(ls wheelhouse/*.whl | wc -l | tr -d ' ') 个 wheel 文件"
else
    echo "警告: wheelhouse/ 目录为空"
fi

echo ""
echo "下一步:"
echo "  1. 验证构建: pip install wheelhouse/move_fcg_analyzer-1.0.9-*.whl"
echo "  2. 收集 Linux wheels 和 macOS wheels"
echo "  3. 参考 PUBLISH.md 上传到 PyPI"
echo ""

# 提供验证命令
echo "快速验证命令:"
echo "  python3 -m venv test-env"
echo "  source test-env/bin/activate"
echo "  pip install wheelhouse/move_fcg_analyzer-1.0.9-cp310-cp310-macosx_*_${ARCH}.whl"
echo "  python -c 'import move_fcg_analyzer; print(move_fcg_analyzer.__version__)'"
echo "  move-fcg-analyzer --help"
echo "  deactivate"
echo ""
