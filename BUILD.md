# 构建说明

本项目使用平台特定的构建系统，支持macOS和Linux两个平台的独立构建。

## 文件结构

```
├── build-scripts/
│   ├── build-macos.sh     # macOS构建脚本
│   └── build-linux.sh    # Linux构建脚本
├── pyproject-macos.toml   # macOS专用配置
├── pyproject-linux.toml  # Linux专用配置
└── BUILD.md              # 本文档
```

## 构建方式

### macOS arm64 构建

在macOS系统上运行：

```bash
./build-scripts/build-macos.sh
```

**构建过程：**
1. 清理之前的构建文件
2. 运行 `npm install` 和 `npm run build:indexer`
3. 复制 `dist`、`build`、`node_modules` 到包目录
4. 使用 `pyproject-macos.toml` 构建wheel
5. 重命名为 `move_fcg_analyzer-1.1.0-py3-none-macos_arm64.whl`

### Linux x86_64 构建

在任何支持Docker的系统上运行：

```bash
./build-scripts/build-linux.sh
```

**构建过程：**
1. 检查Docker环境
2. 构建Docker镜像
3. 在容器中使用 `pyproject-linux.toml` 构建wheel
4. 提取并重命名为 `move_fcg_analyzer-1.1.0-py3-none-linux_x86_64.whl`

### 构建所有平台

```bash
./build-scripts/build-macos.sh && ./build-scripts/build-linux.sh
```

## 配置差异

### macOS配置 (pyproject-macos.toml)
- 使用包目录内的文件：`"dist/**/*"`
- 包含本地构建的arm64 native bindings
- 包含本地安装的npm依赖

### Linux配置 (pyproject-linux.toml)
- 使用项目根目录的文件：`"../dist/**/*"`
- 包含Docker中构建的x86_64 native bindings
- 包含Docker中重新安装的npm依赖

## 输出文件

构建完成后，wheel文件将保存在 `dist/` 目录：

- `move_fcg_analyzer-1.1.0-py3-none-macos_arm64.whl` - macOS版本
- `move_fcg_analyzer-1.1.0-py3-none-linux_x86_64.whl` - Linux版本

## 安装测试

```bash
# 安装macOS版本
pip install dist/move_fcg_analyzer-1.1.0-py3-none-macos_arm64.whl

# 安装Linux版本
pip install dist/move_fcg_analyzer-1.1.0-py3-none-linux_x86_64.whl
```

## 依赖要求

### macOS构建
- Node.js 和 npm
- Python 3.8+
- build 包：`pip install build`

### Linux构建
- Docker
- Python 3.8+ (用于运行构建脚本)

## 故障排除

1. **TypeScript构建失败**：确保运行了 `npm install`
2. **Docker构建失败**：检查Docker是否正常运行
3. **权限错误**：确保构建脚本有执行权限：`chmod +x build-scripts/*.sh`