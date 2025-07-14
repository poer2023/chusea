# AI Writing Tool - 开发任务清单 (2025版)

## 📋 项目概述
基于2025年最新技术栈的智能写作工具，支持Plan→Draft→Citation→Grammar→Readability自动循环引擎，提供学术写作、博客创作和社交媒体内容生成一体化解决方案。

## 🎯 整体开发规范

### 代码规范
- **Python后端**：遵循PEP 8标准，使用type hints，FastAPI最佳实践
- **TypeScript前端**：ESLint + Prettier，严格模式，React 19最佳实践
- **Git提交**：conventional commits格式，语义化版本控制
- **文档**：所有公共API和组件必须有TSDoc/docstring注释
- **测试**：TDD开发，单元测试+集成测试+E2E测试

### 技术栈约定 (2025版)
- **后端**：FastAPI + Python 3.12 + PostgreSQL + Redis + Celery
- **前端**：Next.js 15 + React 19 + TypeScript 5.x + Tailwind CSS v4.0
- **状态管理**：Zustand v5 (客户端) + TanStack Query v5 (服务端)
- **UI组件**：shadcn/ui + 21st.dev AI Chat Components
- **文本编辑**：TipTap v2.x (富文本编辑器)
- **PWA**：Workbox v8 (Service Worker + 离线功能)
- **通信**：tRPC v11 (类型安全) + WebSocket (实时通信)
- **部署**：Vercel (前端) + Docker (后端)

### 开发流程 (2025版)
1. PRD设计 → 2. 技术调研 → 3. 架构设计 → 4. API设计 → 5. 并行开发 → 6. 集成测试 → 7. 性能优化 → 8. 部署上线

## 🚀 开发里程碑规划 (基于PRD_FINAL_2025.md)

### M0: 架构升级 (2025技术栈迁移) - 2周
**目标**：建立基于2025年最新技术的现代化架构
**技术重点**：Next.js 15 + React 19 RSC + Tailwind CSS v4.0
**规范**：
- Server Components优先，减少客户端JS Bundle
- 使用@theme指令和OKLCH色彩空间
- TypeScript 5.x严格模式
- tRPC v11类型安全通信层

### M1: 循环引擎核心 (智能写作引擎) - 3周  
**目标**：实现Plan→Draft→Grammar→Readability自动循环
**技术重点**：XState状态机 + TanStack Query + 异步任务队列
**规范**：
- XState状态机管理工作流
- 智能回退策略和失败重试
- 质量阈值动态调整
- WebSocket实时状态同步

### M2: 现代UI界面 (21st.dev集成) - 3周
**目标**：构建基于21st.dev组件的现代化界面  
**技术重点**：Holy Grail布局 + AI Chat组件 + TipTap编辑器
**规范**：
- 21st.dev AI Chat组件深度集成
- TipTap富文本编辑器配置
- 响应式设计(Desktop/Tablet/Mobile)
- tw-animate-css动画系统

### M3: 高级功能 (引用系统+PWA) - 2周
**目标**：引用校验系统和PWA离线功能
**技术重点**：DOI校验 + Workbox v8 + IndexedDB
**规范**：
- CrossRef/PubMed API集成
- Service Worker离线策略
- IndexedDB本地存储
- 网络状态智能同步

### M4: 多场景转化 (内容适配) - 2周  
**目标**：实现论文→博客→推文跨场景转化
**技术重点**：Agent系统 + 格式转换算法
**规范**：
- 智能内容分析和结构提取
- 受众适配和语言风格调整
- 平台优化(字数限制、格式要求)
- 批量转换和模板系统

---

## 📝 详细任务清单 (2025版)

### 🔄 M0: 架构升级 (2025技术栈迁移) - 当前进行中
**第1周：核心架构搭建**
- [ ] M0.1 Next.js 15项目初始化
  - [ ] 创建Next.js 15项目，启用App Router
  - [ ] 配置React 19 + Server Components
  - [ ] TypeScript 5.x配置，严格模式
  - [ ] ESLint + Prettier + Git hooks配置
- [ ] M0.2 Tailwind CSS v4.0配置
  - [ ] 安装Tailwind CSS v4.0
  - [ ] 配置@theme指令和OKLCH色彩
  - [ ] 集成tw-animate-css动画库
  - [ ] 建立设计token系统

**第2周：状态管理和通信**
- [ ] M0.3 状态管理架构
  - [ ] Zustand v5客户端状态配置
  - [ ] TanStack Query v5服务端状态
  - [ ] 分离关注点架构设计
  - [ ] 状态持久化策略
- [ ] M0.4 API通信层
  - [ ] tRPC v11配置，类型安全API
  - [ ] 与现有FastAPI后端集成
  - [ ] WebSocket实时通信升级
  - [ ] 错误处理和重试机制

### ⏳ M1: 循环引擎核心 (智能写作引擎) - 计划中
**第1周：状态机设计**
- [ ] M1.1 XState工作流状态机
  - [ ] 设计Plan→Draft→Citation→Grammar→Readability流程
  - [ ] 实现状态转换逻辑
  - [ ] 配置失败回退策略
  - [ ] 集成质量阈值检查
- [ ] M1.2 后端任务队列
  - [ ] Celery异步任务系统
  - [ ] Redis队列和结果存储
  - [ ] 任务监控和日志
  - [ ] 错误恢复机制

**第2-3周：核心算法实现**
- [ ] M1.3 智能写作算法
  - [ ] Plan阶段：大纲生成优化
  - [ ] Draft阶段：内容生成优化
  - [ ] Grammar阶段：语法检查集成
  - [ ] Readability阶段：可读性算法(≥70分)
- [ ] M1.4 循环优化机制
  - [ ] 智能重试策略(指数退避)
  - [ ] 质量阈值动态调整
  - [ ] 用户干预触发条件
  - [ ] 性能监控和优化

### ⏳ M2: 现代UI界面 (21st.dev集成) - 计划中
**第1周：布局和组件基础**
- [ ] M2.1 Holy Grail布局实现
  - [ ] 响应式三栏布局(Desktop ≥1024px)
  - [ ] 平板抽屉式布局(768-1023px)
  - [ ] 移动端全屏布局(<768px)
  - [ ] 布局状态管理
- [ ] M2.2 shadcn/ui + 21st.dev集成
  - [ ] shadcn/ui基础组件安装
  - [ ] 21st.dev AI Chat组件集成(30种)
  - [ ] Button组件定制(130种选择)
  - [ ] Input组件配置(102种变体)

**第2周：核心编辑器**
- [ ] M2.3 TipTap富文本编辑器
  - [ ] TipTap v2.x基础配置
  - [ ] 自定义扩展开发
  - [ ] 灰层预览功能
  - [ ] 选区FloatingToolbar
- [ ] M2.4 ProcessBar可视化
  - [ ] 节点状态可视化组件
  - [ ] 流程进度动画效果
  - [ ] 点击回滚交互
  - [ ] 实时状态同步

**第3周：交互优化**
- [ ] M2.5 用户交互完善
  - [ ] 键盘快捷键系统
  - [ ] 拖拽操作支持
  - [ ] 无障碍功能(WCAG 2.1 AA)
  - [ ] 暗色主题支持
- [ ] M2.6 性能优化
  - [ ] 代码分割和懒加载
  - [ ] 图片优化(WebP格式)
  - [ ] 首屏加载时间优化(<2s)
  - [ ] Core Web Vitals优化

### ⏳ M3: 高级功能 (引用系统+PWA) - 计划中
**第1周：引用校验系统**
- [ ] M3.1 DOI/PMID验证API
  - [ ] CrossRef API集成
  - [ ] PubMed API集成
  - [ ] 引用数据缓存(Redis)
  - [ ] 批量验证队列
- [ ] M3.2 引用格式化引擎
  - [ ] GB/T 7714格式支持
  - [ ] APA格式支持
  - [ ] MLA格式支持
  - [ ] 自定义格式配置

**第2周：PWA离线功能**
- [ ] M3.3 Workbox v8 PWA
  - [ ] Service Worker配置
  - [ ] 缓存策略设计
  - [ ] 离线页面支持
  - [ ] PWA安装提示
- [ ] M3.4 离线数据存储
  - [ ] IndexedDB本地存储
  - [ ] Cache API静态资源
  - [ ] 数据同步机制
  - [ ] 网络状态检测

### ⏳ M4: 多场景转化 (内容适配) - 计划中
**第1周：内容分析引擎**
- [ ] M4.1 智能内容分析
  - [ ] 文档结构识别
  - [ ] 关键信息提取
  - [ ] 语言风格分析
  - [ ] 受众适配逻辑
- [ ] M4.2 格式转换算法
  - [ ] 论文→博客转换
  - [ ] 博客→推文转换
  - [ ] 长文→摘要生成
  - [ ] 专业术语简化

**第2周：转换系统完善**
- [ ] M4.3 平台优化功能
  - [ ] 字数限制处理
  - [ ] 格式要求适配
  - [ ] 标签和分类建议
  - [ ] 发布时间优化
- [ ] M4.4 批量处理系统
  - [ ] 模板系统开发
  - [ ] 批量转换功能
  - [ ] 预览和确认机制
  - [ ] 导出多格式支持

---

## 🎯 当前任务重点

### 🔄 当前进行：M0架构升级 (2025技术栈迁移)
**负责人**：技术团队
**预计完成**：2025年7月底
**当前状态**：📋 PRD规划完成，🚧 技术选型完成，⏳ 实施待开始

**优先任务**：
1. 🔥 **Next.js 15项目搭建** - 启用React 19 + Server Components
2. 🔥 **Tailwind CSS v4.0配置** - @theme指令 + OKLCH色彩空间  
3. 🔥 **状态管理架构** - Zustand v5 + TanStack Query v5
4. 🔥 **tRPC v11集成** - 类型安全API通信层

### 📋 已完成基础工作
**完成时间**：2025年7月13日
**完成任务**：
1. ✅ **技术调研**：搜索2025年最新前端技术栈
2. ✅ **架构设计**：基于React 19 RSC的Server-First架构
3. ✅ **组件选型**：21st.dev AI Chat组件集成方案
4. ✅ **PRD整合**：完整的PRD_FINAL_2025.md文档
5. ✅ **项目清理**：删除旧PRD文档，重命名前端文件夹
6. ✅ **任务规划**：基于最新架构的详细开发计划

### 🎯 近期目标 (接下来2周)
**M0.1 核心架构搭建** (第1周)
- Next.js 15 + React 19项目初始化
- Tailwind CSS v4.0完整配置
- TypeScript 5.x严格模式设置

**M0.2 状态管理和通信** (第2周)  
- Zustand + TanStack Query状态架构
- tRPC v11类型安全API层
- 与现有FastAPI后端集成测试

---

## 📊 2025版进度统计

### 整体里程碑进度
- **✅ 规划阶段**：100% 完成 (技术调研 + PRD制定)
- **🔄 M0 架构升级**：0% 进行中 (2025技术栈迁移)
- **⏳ M1 循环引擎**：0% 待开始 (智能写作引擎)
- **⏳ M2 现代UI**：0% 待开始 (21st.dev组件集成)
- **⏳ M3 高级功能**：0% 待开始 (引用系统+PWA)
- **⏳ M4 多场景转化**：0% 待开始 (内容适配)

### 技术栈升级状态
- **前端框架**：❌ 待升级到Next.js 15 + React 19
- **状态管理**：❌ 待迁移到Zustand v5 + TanStack Query v5
- **UI组件**：❌ 待集成shadcn/ui + 21st.dev组件
- **样式系统**：❌ 待升级到Tailwind CSS v4.0
- **PWA方案**：❌ 待实施Workbox v8
- **API通信**：❌ 待升级到tRPC v11

### 功能模块状态
- **循环写作引擎**：🔧 后端基础完成，前端待重构
- **富文本编辑器**：🔧 TipTap基础完成，待升级v2.x
- **AI聊天面板**：❌ 待集成21st.dev AI Chat组件
- **引用校验系统**：❌ 待开发DOI/PMID验证
- **多场景转化**：❌ 待开发论文→博客→推文转换
- **PWA离线功能**：❌ 待实施Service Worker

---

## 🔧 技术债务管理

### 架构债务
- [ ] **前端技术栈现代化**：从旧版本迁移到2025最新技术栈
- [ ] **状态管理重构**：分离客户端状态和服务端状态
- [ ] **组件库标准化**：统一使用shadcn/ui设计系统
- [ ] **API层类型安全**：引入tRPC替代RESTful API

### 性能债务  
- [ ] **Server Components优化**：利用React 19 RSC减少客户端Bundle
- [ ] **缓存策略升级**：实施多层缓存架构
- [ ] **首屏加载优化**：目标<2s加载时间
- [ ] **Core Web Vitals优化**：LCP≤2.5s, FID≤100ms, CLS≤0.1

### 用户体验债务
- [ ] **响应式设计现代化**：基于2025年设备标准
- [ ] **无障碍功能完善**：WCAG 2.1 AA标准
- [ ] **PWA体验提升**：离线优先架构
- [ ] **交互动画优化**：使用tw-animate-css

---

## 🚀 里程碑时间线

```
2025年7月13日 ✅ PRD规划完成
2025年7月15日 🎯 M0.1 开始 - Next.js 15项目搭建
2025年7月22日 🎯 M0.2 开始 - 状态管理和API层
2025年7月29日 🎯 M0完成 - 架构升级完毕
2025年8月05日 🎯 M1开始 - 循环引擎开发
2025年8月26日 🎯 M1完成 - 智能写作引擎
2025年9月02日 🎯 M2开始 - 现代UI界面
2025年9月23日 🎯 M2完成 - 21st.dev组件集成
2025年9月30日 🎯 M3开始 - 高级功能开发
2025年10月14日 🎯 M3完成 - 引用系统+PWA
2025年10月21日 🎯 M4开始 - 多场景转化
2025年11月04日 🎯 M4完成 - 项目完整交付
```

---

## 📞 协作和反馈

### 开发规范
- **Git工作流**：feature branches + PR review
- **代码质量**：ESLint + Prettier + TypeScript strict
- **测试策略**：Unit Tests + Integration Tests + E2E Tests
- **文档要求**：TSDoc注释 + README更新

### 技术支持
- **前端技术**：React 19 + Next.js 15 + TypeScript 5.x
- **后端API**：FastAPI + Python 3.12 + PostgreSQL
- **DevOps**：Vercel部署 + Docker容器化
- **监控分析**：Vercel Analytics + Sentry错误监控

### 问题反馈流程
1. **技术问题**：在对应里程碑任务下创建子任务
2. **Bug反馈**：使用Issue模板，附带复现步骤
3. **功能建议**：通过Feature Request模板提交
4. **文档更新**：完成任务后及时更新相关文档

---

**文档版本**：v3.0 (2025技术栈版)  
**最后更新**：2025-07-13  
**下次更新**：M0.1完成后  
**负责人**：技术团队