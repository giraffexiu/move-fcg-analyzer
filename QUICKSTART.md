# 快速发布指南

## 发布到 PyPI（推荐流程）

### 1. 准备工作（只需一次）

1. **注册 PyPI 账号**
   - 访问 https://pypi.org/account/register/
   - 验证邮箱

2. **创建 API Token**
   - 登录 PyPI → https://pypi.org/manage/account/token/
   - 创建 token（保存好，格式：`pypi-...`）

3. **配置 GitHub Secret**
   - GitHub 仓库 → Settings → Secrets and variables → Actions
   - 新建 secret：
     - Name: `PYPI_API_TOKEN`
     - Value: 你的 PyPI token

### 2. 发布新版本（每次发布）

```bash
# 1. 更新版本号
# 编辑 pyproject.toml 和 move_fcg_analyzer/__init__.py
# 修改 version = "1.0.1"

# 2. 提交代码
git add .
git commit -m "Release v1.0.1"
git push

# 3. 创建 tag（触发自动构建和发布）
git tag v1.0.1
git push origin v1.0.1

# 4. 等待 GitHub Actions 完成
# 访问 https://github.com/你的用户名/move-fcg-analyzer/actions
# 等待构建完成（约 10-15 分钟）

# 5. 验证发布
pip install move-fcg-analyzer
```

就这么简单！GitHub Actions 会自动：
- ✅ 构建 Linux wheels (x86_64)
- ✅ 构建 macOS wheels (x86_64 + arm64)
- ✅ 构建 Windows wheels (x86_64)
- ✅ 构建 source distribution
- ✅ 发布到 PyPI

## 本地测试（发布前）

```bash
# 1. 本地构建测试
python -m build

# 2. 测试安装
python -m venv test_env
source test_env/bin/activate  # Windows: test_env\Scripts\activate
pip install dist/*.whl

# 3. 测试导入
python -c "import move_fcg_analyzer; print(move_fcg_analyzer.__version__)"

# 4. 清理
deactivate
rm -rf test_env
```

## 发布到 TestPyPI（可选）

如果想先在测试环境验证：

```bash
# 1. 注册 TestPyPI 账号
# https://test.pypi.org/account/register/

# 2. 创建 TestPyPI token
# https://test.pypi.org/manage/account/token/

# 3. 本地构建
python -m build

# 4. 上传到 TestPyPI
pip install twine
twine upload --repository testpypi dist/*

# 5. 测试安装
pip install --index-url https://test.pypi.org/simple/ move-fcg-analyzer
```

## 常见问题

**Q: 为什么本地只构建了 macOS 版本？**
A: `python -m build` 只构建当前平台。其他平台由 GitHub Actions 自动构建。

**Q: 如何查看构建进度？**
A: 访问 GitHub 仓库的 Actions 标签页。

**Q: 构建失败怎么办？**
A: 查看 Actions 日志，通常是 C 代码编译问题或依赖问题。

**Q: 可以手动触发构建吗？**
A: 可以，在 Actions 页面点击 "Build and Publish Wheels" → "Run workflow"。

**Q: 需要 Docker 吗？**
A: 不需要！GitHub Actions 会在云端构建所有平台。
