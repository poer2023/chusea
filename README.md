# AI辅助写作工具

一个智能化的多场景写作助手，支持学术写作、博客创作和社交媒体内容生成。

## 项目特色

- 🤖 **智能Agent系统**：写作Agent、文献Agent、工具Agent协同工作
- 📚 **精准文献管理**：支持Semantic Scholar、ArXiv等多源文献搜索
- 🔄 **跨场景转化**：学术论文→博客→社交媒体一键转换
- 🛠️ **工具化功能**：图表生成、数据生成、格式转换
- 💡 **个性化写作**：支持写作风格学习和模仿

## 技术架构

### 后端
- **框架**: FastAPI + Python 3.12
- **AI引擎**: MiniMax API (开发)，支持Claude/Gemini
- **Agent框架**: 自研Agent管理系统
- **数据库**: SQLite + ChromaDB
- **文献API**: Semantic Scholar API, ArXiv API

### 前端
- **框架**: React + TypeScript
- **编辑器**: Tiptap富文本编辑器
- **图表**: Plotly.js
- **实时通信**: WebSocket

## 快速开始

### 1. 环境准备

```bash
# 克隆项目
git clone <repository-url>
cd ai-writing-assistant

# 创建Python虚拟环境
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入您的API密钥
# MINIMAX_API_KEY=your_minimax_api_key
# MINIMAX_GROUP_ID=your_group_id
```

### 3. 启动后端服务

```bash
python start_server.py
```

服务启动后访问：
- API文档: http://localhost:8000/docs
- 健康检查: http://localhost:8000/health

## API使用示例

### 写作生成
```bash
curl -X POST "http://localhost:8000/api/writing/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "帮我写一篇关于机器学习的论文摘要",
    "mode": "academic",
    "user_id": 1
  }'
```

### 文献搜索
```bash
curl -X POST "http://localhost:8000/api/literature/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "machine learning",
    "max_results": 5,
    "source": "semantic_scholar"
  }'
```

### 图表生成
```bash
curl -X POST "http://localhost:8000/api/tools/chart/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "chart_type": "bar",
    "data": [{"x": "A", "y": 10}, {"x": "B", "y": 20}],
    "x_axis": "x",
    "y_axis": "y",
    "title": "示例图表"
  }'
```

## 功能模块

### 写作Agent
- 学术写作模式：论文、研究报告等
- 博客写作模式：技术博客、个人博客等
- 社交媒体模式：推文、朋友圈等

### 文献Agent
- 多源文献搜索 (Semantic Scholar, ArXiv)
- 智能引用生成 (APA, MLA, Chicago)
- 文献分析和推荐
- 本地文献管理

### 工具Agent
- 图表生成 (柱状图、折线图、饼图等)
- 数据生成 (随机数据、序列数据、分布数据)
- 格式转换 (Markdown, LaTeX, HTML)

## 开发计划

### 第一阶段 (已完成)
- [x] 项目初始化和基础架构
- [x] 核心Agent系统
- [x] 基础写作Agent
- [x] 文献搜索和引用功能
- [x] 工具Agent基础功能
- [x] API接口设计

### 第二阶段 (进行中)
- [ ] 前端界面开发
- [ ] 前后端集成
- [ ] 功能测试和优化

### 第三阶段 (计划中)
- [ ] 高级个性化功能
- [ ] 性能优化
- [ ] 部署和发布

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请提交 Issue 或联系开发团队。