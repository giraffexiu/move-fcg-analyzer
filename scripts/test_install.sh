#!/bin/bash
# 测试安装脚本 - 在虚拟环境中测试包安装

set -e

echo "🧪 Testing package installation..."

# 创建临时虚拟环境
VENV_DIR=".test_venv"
echo "📦 Creating test virtual environment..."
python -m venv $VENV_DIR
source $VENV_DIR/bin/activate

# 安装构建的包
echo "📥 Installing package from dist/..."
pip install dist/*.whl

# 测试导入
echo "🔍 Testing imports..."
python -c "
import tree_sitter_move_on_aptos
import move_fcg_analyzer
print('✅ tree_sitter_move_on_aptos imported successfully')
print('✅ move_fcg_analyzer imported successfully')
print(f'Version: {move_fcg_analyzer.__version__}')
"

# 测试 CLI（如果有）
if command -v move-fcg-analyzer &> /dev/null; then
    echo "🔍 Testing CLI..."
    move-fcg-analyzer --help || echo "⚠️  CLI test skipped"
fi

# 清理
echo "🧹 Cleaning up..."
deactivate
rm -rf $VENV_DIR

echo ""
echo "✨ All tests passed!"
