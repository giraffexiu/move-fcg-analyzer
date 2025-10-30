#!/bin/bash
# 本地构建脚本 - 用于测试构建流程

set -e

echo "🔨 Building move-fcg-analyzer locally..."

# 清理旧的构建产物
echo "🧹 Cleaning old builds..."
rm -rf build/ dist/ *.egg-info
rm -rf bindings/python/*.egg-info

# 安装构建依赖
echo "📦 Installing build dependencies..."
pip install -U pip setuptools wheel build twine

# 构建 wheel 和 sdist
echo "🏗️  Building package..."
python -m build

# 检查构建产物
echo "✅ Checking build artifacts..."
twine check dist/*

# 显示构建结果
echo ""
echo "✨ Build complete! Files in dist/:"
ls -lh dist/

echo ""
echo "📝 Next steps:"
echo "  - Test install: pip install dist/*.whl"
echo "  - Upload to TestPyPI: twine upload --repository testpypi dist/*"
echo "  - Upload to PyPI: twine upload dist/*"
