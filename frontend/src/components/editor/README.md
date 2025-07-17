# 文档编辑器组件

## 概述

本目录包含完整的文档编辑器和AI写作助手功能实现，支持Markdown编辑、实时预览、AI辅助写作等功能。

## 组件结构

### 编辑器组件

#### DocumentEditor.tsx
- 主要的Markdown文档编辑器
- 支持实时预览（分屏模式）
- 自动保存功能
- 字数统计和阅读时间估算
- 拖拽文件上传（图片、文本文件）
- 键盘快捷键支持

#### ToolBar.tsx
- 编辑器工具栏
- 格式化工具（粗体、斜体、标题等）
- 插入工具（链接、图片、表格等）
- 预览切换
- 保存功能

### AI组件

#### AIWritingAssistant.tsx
- AI写作助手主面板
- 多标签界面（生成、改进、建议、转换）
- 支持选中文本的AI处理
- 侧边栏布局

#### ContentGenerator.tsx
- 内容生成器
- 自定义提示生成
- 预设模板（引言、结论、大纲等）
- 分类过滤
- 生成结果管理

#### WritingSuggestions.tsx
- 写作建议组件
- 多种建议类型（语法、风格、结构等）
- 建议分类和过滤
- 一键应用建议

## 功能特性

### 编辑器功能
- ✅ Markdown语法支持
- ✅ 实时预览
- ✅ 自动保存
- ✅ 字数统计
- ✅ 拖拽上传
- ✅ 键盘快捷键
- ✅ 只读模式
- ✅ 导出功能

### AI功能
- ✅ 内容生成
- ✅ 内容改进
- ✅ 写作建议
- ✅ 格式转换
- ✅ 多种写作模式
- ✅ 上下文感知

### 用户体验
- ✅ 响应式设计
- ✅ 暗色主题支持
- ✅ 错误处理
- ✅ 加载状态
- ✅ 实时反馈

## API集成

### 编辑器API
- `GET /api/documents/{id}` - 获取文档
- `PUT /api/documents/{id}` - 更新文档
- `POST /api/files/upload` - 文件上传

### AI API
- `POST /api/writing/generate` - 生成内容
- `POST /api/writing/improve` - 改进内容
- `POST /api/writing/suggestions` - 获取建议
- `POST /api/writing/convert` - 格式转换

## 使用方法

### 基本使用

```tsx
import { DocumentEditor } from '@/components/editor';

function DocumentPage() {
  return (
    <DocumentEditor
      document={document}
      onSave={handleSave}
      onContentChange={handleContentChange}
      readOnly={false}
    />
  );
}
```

### AI助手集成

```tsx
import { AIWritingAssistant } from '@/components/ai';

function EditorWithAI() {
  return (
    <div className="flex">
      <DocumentEditor />
      <AIWritingAssistant
        content={content}
        selectedText={selectedText}
        onInsertText={handleInsertText}
        onReplaceText={handleReplaceText}
        documentId={documentId}
      />
    </div>
  );
}
```

## 技术栈

- **React** - 组件库
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式
- **Zustand** - 状态管理
- **API Client** - 后端通信

## 开发指南

### 添加新的AI模板

1. 在`ContentGenerator.tsx`中添加模板配置
2. 更新模板数组
3. 添加相应的图标和描述

### 扩展编辑器功能

1. 在`ToolBar.tsx`中添加工具按钮
2. 实现对应的处理函数
3. 更新键盘快捷键映射

### 自定义主题

编辑器支持暗色主题，可以通过CSS变量进行自定义：

```css
.dark {
  --editor-bg: #1f2937;
  --editor-text: #f9fafb;
  --editor-border: #374151;
}
```

## 注意事项

1. **性能优化**：大文档编辑时注意防抖处理
2. **错误处理**：网络错误和API错误的优雅处理
3. **用户体验**：保存状态和加载状态的及时反馈
4. **安全性**：用户输入的清理和验证

## 未来改进

- [ ] 协作编辑支持
- [ ] 更多Markdown扩展
- [ ] 插件系统
- [ ] 离线编辑
- [ ] 版本历史
- [ ] 评论系统