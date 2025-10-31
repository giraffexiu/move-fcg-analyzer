#!/bin/bash

# Linux x86_64 构建脚本
# 使用Docker在Linux环境中构建x86_64版本的wheel包

set -e  # 遇到错误立即退出

echo "🐧 开始构建 Linux x86_64 版本..."

# 1. 检查Docker是否可用
if ! command -v docker &> /dev/null; then
    echo "❌ 错误：Docker未安装或不可用"
    echo "请先安装Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# 2. 检查Dockerfile是否存在
if [ ! -f "Dockerfile.build" ]; then
    echo "❌ 错误：找不到Dockerfile.build文件"
    exit 1
fi

# 3. 清理之前的Linux wheel文件
echo "🧹 清理之前的Linux wheel文件..."
rm -f dist/*linux*.whl

# 4. 临时复制Linux配置文件为pyproject.toml
echo "📋 准备Linux配置文件..."
cp pyproject-linux.toml pyproject.toml

# 5. 构建Docker镜像
echo "🐳 构建Docker镜像..."
docker build --platform linux/amd64 -f Dockerfile.build -t move-fcg-analyzer-builder .

if [ $? -ne 0 ]; then
    echo "❌ 错误：Docker镜像构建失败"
    # 清理临时文件
    rm -f pyproject.toml
    exit 1
fi

# 6. 提取wheel文件
echo "📦 提取wheel文件..."
mkdir -p dist

# 创建临时容器提取文件
container_id=$(docker create --platform linux/amd64 move-fcg-analyzer-builder)
docker cp "$container_id:/workspace/python-dist/." dist/
docker rm "$container_id"

# 7. 清理临时配置文件
rm -f pyproject.toml

# 8. 重命名wheel文件
echo "🏷️  重命名wheel文件..."
wheel_file=$(ls dist/move_fcg_analyzer-*.whl 2>/dev/null | grep -v macos | head -n 1)
if [ -z "$wheel_file" ]; then
    echo "❌ 错误：未找到生成的wheel文件"
    exit 1
fi

new_name="dist/move_fcg_analyzer-1.1.0-py3-none-linux_x86_64.whl"
mv "$wheel_file" "$new_name"

echo "✅ Linux构建完成: $new_name"
echo "📊 文件大小: $(du -h "$new_name" | cut -f1)"
echo ""
echo "🚀 可以使用以下命令安装测试："
echo "   pip install $new_name"
echo ""
echo "💡 提示：此wheel包适用于Linux x86_64系统"