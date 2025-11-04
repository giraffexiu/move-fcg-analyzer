#!/bin/bash

# macOS arm64 构建脚本
# 用于在本地macOS环境构建arm64版本的wheel包

set -e  # 遇到错误立即退出

echo "🍎 开始构建 macOS arm64 版本..."

# 切换到项目根目录（脚本所在目录的上一级）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"
echo "🔧 工作目录: $PROJECT_ROOT"

# 1. 清理之前的构建文件
echo "🧹 清理之前的构建文件..."
rm -rf dist/*macos*.whl
rm -rf build/
rm -rf move_fcg_analyzer/dist/
rm -rf move_fcg_analyzer/build/
rm -rf move_fcg_analyzer/node_modules/

# 2. 构建TypeScript
echo "📦 构建TypeScript..."
if [ ! -f "package.json" ]; then
    echo "❌ 错误：找不到package.json文件"
    exit 1
fi

npm install
npm run build:indexer

# 验证dist目录是否存在
if [ ! -d "dist" ]; then
    echo "❌ 错误：TypeScript构建失败，dist目录不存在"
    exit 1
fi

# 3. 复制必要文件到包目录
echo "📂 复制文件到包目录..."
cp -r dist move_fcg_analyzer/

# 复制build目录（如果存在）
if [ -d "build" ]; then
    cp -r build move_fcg_analyzer/
fi

# 复制node_modules目录
if [ -d "node_modules" ]; then
    cp -r node_modules move_fcg_analyzer/
else
    echo "⚠️  警告：node_modules目录不存在，请先运行npm install"
fi

# 4. 使用macOS配置构建wheel
echo "🔨 构建wheel包..."
if [ ! -f "pyproject-macos.toml" ]; then
    echo "❌ 错误：找不到pyproject-macos.toml配置文件"
    exit 1
fi

# 临时复制配置文件为pyproject.toml
cp pyproject-macos.toml pyproject.toml
python3 -m build --wheel

# 5. 重命名wheel文件
echo "🏷️  重命名wheel文件..."
wheel_file=$(ls dist/move_fcg_analyzer-*.whl | head -n 1)
if [ -z "$wheel_file" ]; then
    echo "❌ 错误：未找到生成的wheel文件"
    exit 1
fi

new_name="dist/move_fcg_analyzer-1.1.1-1-py3-none-macosx_11_0_arm64.whl"
mv "$wheel_file" "$new_name"

# 6. 清理临时文件
echo "🧹 清理临时文件..."
rm -f pyproject.toml
rm -rf move_fcg_analyzer/dist/
rm -rf move_fcg_analyzer/build/
rm -rf move_fcg_analyzer/node_modules/

echo "✅ macOS构建完成: $new_name"
echo "📊 文件大小: $(du -h "$new_name" | cut -f1)"
echo ""
echo "🚀 可以使用以下命令安装测试："
echo "   pip install $new_name"