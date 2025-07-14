# AI Writing Tool - 测试文档

## 📋 测试概述

本项目实现了完整的测试覆盖，包括单元测试、集成测试、E2E测试和性能测试，确保系统的可靠性和稳定性。

## 🧪 测试架构

### 测试层级
1. **单元测试** - 测试单个组件和函数
2. **集成测试** - 测试模块间的交互
3. **API测试** - 测试REST API端点
4. **E2E测试** - 测试完整用户流程
5. **性能测试** - 测试系统性能和负载能力

### 测试技术栈

#### 后端测试
- **pytest** - Python测试框架
- **pytest-asyncio** - 异步测试支持
- **pytest-cov** - 代码覆盖率
- **httpx** - HTTP客户端测试
- **unittest.mock** - Mock和存根

#### 前端测试
- **Vitest** - 现代JavaScript测试框架
- **@testing-library/react** - React组件测试
- **Playwright** - E2E测试框架
- **@testing-library/jest-dom** - DOM断言扩展

## 🚀 快速开始

### 运行所有测试
```bash
# 运行完整测试套件
./run_all_tests.sh

# 跳过E2E测试（更快）
./run_all_tests.sh --skip-e2e

# 只运行后端测试
./run_all_tests.sh --skip-frontend --skip-e2e

# 只运行前端测试
./run_all_tests.sh --skip-backend --skip-e2e
```

### 单独运行测试

#### 后端测试
```bash
cd backend

# 运行所有测试
pytest tests/ -v

# 运行特定测试文件
pytest tests/test_workflow_integration.py -v

# 运行带覆盖率的测试
pytest tests/ --cov=. --cov-report=html

# 运行性能测试
pytest tests/test_performance.py -v
```

#### 前端测试
```bash
cd frontend/new-frontend

# 运行单元测试
npm run test

# 运行测试并监视变化
npm run test:watch

# 运行覆盖率测试
npm run test:coverage

# 运行E2E测试
npm run test:e2e

# 运行E2E测试（调试模式）
npm run test:e2e:debug
```

## 📁 测试文件结构

```
backend/tests/
├── conftest.py                      # pytest配置和fixtures
├── test_agents.py                   # Agent单元测试
├── test_agents_integration.py       # Agent集成测试
├── test_workflow_integration.py     # 工作流集成测试
├── test_api_endpoints.py           # API端点测试
└── test_performance.py             # 性能测试

frontend/new-frontend/
├── tests/e2e/                      # E2E测试
│   ├── homepage.spec.ts            # 首页测试
│   ├── editor.spec.ts              # 编辑器测试
│   ├── chat.spec.ts                # 聊天界面测试
│   └── workflow.spec.ts            # 工作流测试
├── src/components/**/*.test.tsx     # 组件单元测试
├── src/hooks/**/*.test.ts          # Hooks测试
└── src/stores/**/*.test.ts         # 状态管理测试
```

## 🧩 测试用例详解

### 后端测试

#### 1. Agent系统测试 (`test_agents_integration.py`)
- **WritingAgent测试**
  - 学术写作模式
  - 博客写作模式
  - 社交媒体写作模式
  - 错误处理和并发处理

- **LiteratureAgent测试**
  - 文献搜索功能
  - 引用格式化
  - DOI验证

- **ToolsAgent测试**
  - 语法检查
  - 可读性分析
  - 字数统计

#### 2. 工作流集成测试 (`test_workflow_integration.py`)
- 完整的写作循环测试
- 可读性重试机制
- 错误处理和恢复
- 工作流取消功能
- 状态跟踪和更新
- 并发工作流处理

#### 3. API端点测试 (`test_api_endpoints.py`)
- 认证端点（注册、登录、token验证）
- 文档CRUD操作
- 工作流管理（启动、状态查询、取消）
- 写作和文献功能
- 错误处理和安全性

#### 4. 性能测试 (`test_performance.py`)
- API响应时间测试
- 并发处理能力测试
- 资源使用监控
- 压力测试和负载测试

### 前端测试

#### 1. E2E测试
- **首页测试** (`homepage.spec.ts`)
  - 页面加载和导航
  - 响应式布局
  - 基础交互

- **编辑器测试** (`editor.spec.ts`)
  - TipTap编辑器功能
  - 文本格式化
  - 工具栏交互
  - 撤销/重做功能

- **聊天测试** (`chat.spec.ts`)
  - 消息发送和接收
  - WebSocket连接
  - 用户界面交互

- **工作流测试** (`workflow.spec.ts`)
  - 工作流启动和管理
  - 状态可视化
  - 配置和错误处理

#### 2. 组件单元测试
- UI组件功能测试
- 状态管理测试
- Hook函数测试
- 用户交互测试

## 🎯 测试覆盖率目标

| 测试类型 | 目标覆盖率 | 当前状态 |
|---------|-----------|---------|
| 后端单元测试 | ≥85% | ✅ 实现 |
| 前端组件测试 | ≥80% | ✅ 实现 |
| API集成测试 | 100% | ✅ 实现 |
| E2E关键流程 | 100% | ✅ 实现 |

## 🔧 测试配置

### Pytest配置 (`backend/pytest.ini`)
```ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    -v
    --strict-markers
    --disable-warnings
    --cov-report=term-missing
    --cov-report=html
markers =
    slow: marks tests as slow
    integration: marks tests as integration tests
    performance: marks tests as performance tests
```

### Playwright配置 (`frontend/new-frontend/playwright.config.ts`)
```typescript
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

## 🔄 CI/CD集成

### GitHub Actions工作流
项目配置了完整的CI/CD管道（`.github/workflows/test.yml`）：

1. **并行作业**
   - 后端测试作业
   - 前端测试作业
   - 代码质量检查
   - 安全扫描

2. **E2E测试作业**
   - 依赖前端和后端测试通过
   - 启动完整应用环境
   - 运行端到端测试

3. **性能基准测试**
   - 仅在主分支运行
   - 性能回归检测
   - 基准比较和告警

### 测试触发条件
- **Push到主分支** - 运行完整测试套件
- **Pull Request** - 运行核心测试
- **定期运行** - 每日性能基准测试

## 📊 测试报告

### 自动生成的报告
1. **代码覆盖率报告**
   - 后端：`backend/htmlcov/index.html`
   - 前端：`frontend/new-frontend/coverage/index.html`

2. **E2E测试报告**
   - Playwright HTML报告：`frontend/new-frontend/playwright-report/index.html`

3. **性能测试报告**
   - 响应时间统计
   - 并发处理能力
   - 资源使用分析

### 查看报告
```bash
# 生成并查看后端覆盖率报告
cd backend
pytest --cov=. --cov-report=html
open htmlcov/index.html

# 查看E2E测试报告
cd frontend/new-frontend
npm run test:e2e:report
```

## 🐛 测试调试

### 调试后端测试
```bash
# 运行特定测试并进入调试模式
pytest tests/test_workflow_integration.py::TestWorkflowIntegration::test_complete_workflow_cycle -v -s --pdb

# 运行测试并查看详细输出
pytest tests/ -v -s --tb=long
```

### 调试前端测试
```bash
# 调试单元测试
npm run test:watch

# 调试E2E测试
npm run test:e2e:debug

# 运行特定E2E测试
npx playwright test homepage.spec.ts --debug
```

## 📝 编写新测试

### 后端测试示例
```python
import pytest
from unittest.mock import Mock, patch

class TestNewFeature:
    @pytest.mark.asyncio
    async def test_new_functionality(self, async_client, mock_auth):
        """测试新功能"""
        # 准备测试数据
        test_data = {"key": "value"}
        
        # 模拟依赖
        with patch('module.dependency') as mock_dep:
            mock_dep.return_value = "expected_result"
            
            # 执行测试
            response = await async_client.post("/api/endpoint", json=test_data)
            
            # 验证结果
            assert response.status_code == 200
            assert response.json()["result"] == "expected"
```

### 前端测试示例
```typescript
import { test, expect } from '@playwright/test';

test.describe('New Feature', () => {
  test('should work correctly', async ({ page }) => {
    await page.goto('/new-feature');
    
    // 交互操作
    await page.click('[data-testid="action-button"]');
    
    // 验证结果
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });
});
```

## 🔒 测试最佳实践

### 1. 测试隔离
- 每个测试独立运行
- 使用适当的setup和teardown
- 避免测试间的依赖关系

### 2. Mock策略
- Mock外部依赖（API、数据库）
- 保持Mock的简单和明确
- 验证Mock的调用

### 3. 数据管理
- 使用测试固定装置（fixtures）
- 测试后清理数据
- 使用测试专用数据库

### 4. 断言明确
- 使用描述性的断言消息
- 测试积极和消极场景
- 验证完整的响应结构

### 5. 性能考虑
- 标记慢速测试
- 使用并行测试执行
- 定期运行性能基准

## 🚨 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查数据库服务状态
sudo service postgresql status

# 重置测试数据库
dropdb test_db && createdb test_db
alembic upgrade head
```

#### 2. 端口占用
```bash
# 查找占用端口的进程
lsof -i :3000
lsof -i :8000

# 终止进程
kill -9 <PID>
```

#### 3. 依赖版本冲突
```bash
# 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# Python依赖
pip freeze > requirements.txt
pip install -r requirements.txt --force-reinstall
```

#### 4. Playwright浏览器问题
```bash
# 重新安装浏览器
npx playwright install --with-deps

# 清理缓存
npx playwright test --reporter=line --workers=1
```

## 📈 测试指标监控

### 关键指标
1. **测试覆盖率** - 代码覆盖百分比
2. **测试执行时间** - 单个和整体测试时间
3. **失败率** - 测试失败的频率
4. **性能基准** - API响应时间和吞吐量

### 监控工具
- **Codecov** - 覆盖率跟踪
- **GitHub Actions** - CI/CD监控
- **Playwright Report** - E2E测试可视化
- **pytest-benchmark** - 性能基准

---

## 📞 获取帮助

如果在测试过程中遇到问题：

1. **查看日志** - 检查测试输出和错误信息
2. **参考文档** - 阅读相关工具的官方文档
3. **运行调试** - 使用调试模式查看详细信息
4. **检查环境** - 确认依赖和配置正确

更多信息请参考项目的其他文档和Issue跟踪系统。