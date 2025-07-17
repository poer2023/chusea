# 编译错误跟踪文档

## 文档说明
此文档用于跟踪编译过程中发现的错误、解决状态以及新发现的问题。

## 错误分类

### 🔴 高优先级错误 (阻塞编译)
### 🟡 中优先级错误 (警告但不阻塞)
### 🟢 已解决错误

---

## 错误记录

### 🔴 TypeScript 编译错误 (373个)

**发现时间**: 2025-07-17  
**状态**: 未解决  
**优先级**: 高  

#### 主要错误类型

##### 1. RequestCache 类型错误 (src/lib/api-client.ts)
```
Type 'RequestCache' is not assignable to type 'never'.
Type '"default"' is not assignable to type 'never'.
```

**影响位置**:
- 第375行: `cache: 'no-store' as RequestCache,`
- 第386行: `cache: 'default' as RequestCache,`
- 第411行: `cache: 'default' as RequestCache,`
- 第421行: `cache: 'default' as RequestCache,`
- 第459行: `cache: 'default' as RequestCache,`
- 第471行: `cache: 'default' as RequestCache,`
- 第482行: `cache: 'default' as RequestCache,`
- 第493行: `cache: 'default' as RequestCache,`
- 第513行: `cache: 'default' as RequestCache,`
- 第524行: `cache: 'default' as RequestCache,`
- 第535行: `cache: 'default' as RequestCache,`
- 第546行: `cache: 'default' as RequestCache,`
- 第566行: `cache: 'default' as RequestCache,`
- 第595行: `cache: 'default' as RequestCache,`
- 第607行: `cache: 'default' as RequestCache,`
- 第618行: `cache: 'default' as RequestCache,`
- 第629行: `cache: 'default' as RequestCache,`
- 第642行: `cache: 'default' as RequestCache,`
- 第653行: `cache: 'default' as RequestCache,`
- 第664行: `cache: 'default' as RequestCache,`
- 第678行: `cache: 'default' as RequestCache,`
- 第689行: `cache: 'default' as RequestCache,`
- 第707行: `cache: 'default' as RequestCache,`
- 第718行: `cache: 'default' as RequestCache,`
- 第730行: `cache: 'default' as RequestCache,`
- 第819行: `cache: 'default' as RequestCache,`
- 第845行: `cache: 'default' as RequestCache,`

**解决方案**: 需要检查 fetch API 的类型定义和 RequestCache 的正确使用

##### 2. API 类型定义错误 (src/lib/api-examples.ts)
```
Type '"apa"' is not assignable to type 'CitationStyle'.
Type '"plan"' is not assignable to type 'NodeType'.
```

**影响位置**:
- 第256行: CitationStyle 类型不匹配
- 第367行: NodeType 类型不匹配 ("plan", "draft", "grammar", "readability")

##### 3. 认证相关类型错误 (src/lib/api/auth.ts)
```
Property 'data' does not exist on type 'UserResponse'.
Property 'data' does not exist on type 'Token'.
```

**影响位置**:
- 第27行: UserResponse.data 属性缺失
- 第47行: Token.data 属性缺失
- 第58行: Token.data 属性缺失

##### 4. Store 相关类型错误
- 多个 store 文件中存在属性缺失和类型不匹配问题
- logEvent 属性在 WorkflowState 中缺失
- 类型定义与实际使用不一致

##### 5. WebSocket 消息类型错误 (src/types/chat.ts)
```
Interface 'ChatWebSocketMessage' incorrectly extends interface 'WebSocketMessage<any>'.
Type '"chat_typing"' is not assignable to type 'WebSocketMessageType'.
```

### 🟡 ESLint 警告

**发现时间**: 2025-07-17  
**状态**: 需要处理  
**优先级**: 中  

#### 主要警告类型

##### 1. Console 语句警告 (no-console)
**影响文件**:
- src/app/api/chat/route.ts (第222行)
- src/app/api/chat/ws/route.ts (第120, 236, 246, 280行)
- src/app/api/trpc/[trpc]/route.ts (第26行)
- src/app/documents/[id]/edit/page.tsx (第215, 239行)
- src/app/documents/[id]/page.tsx (第53, 92, 102行)
- src/app/documents/new/page.tsx (第225行)
- src/app/documents/page.tsx (第455, 477行)
- src/app/writing/page.tsx (第74行)
- 以及多个组件文件

**解决方案**: 
- 生产环境移除 console.log
- 使用适当的日志记录库
- 或配置 eslint 忽略开发环境的 console 语句

##### 2. 任意类型警告 (@typescript-eslint/no-explicit-any)
**影响范围**: 大量文件使用了 `any` 类型

**建议解决方案**:
- 为所有 `any` 类型提供具体的类型定义
- 使用泛型或联合类型替代 `any`

##### 3. 未使用变量错误 (@typescript-eslint/no-unused-vars)
**示例**:
- src/components/ai/ContentGenerator.tsx (第15行): 'WritingRequest' 定义但未使用
- src/components/chat/chat-layout.tsx: 多个变量定义但未使用

---

## 解决进度跟踪

### 待修复 (Todo)
- [ ] 修复 RequestCache 类型错误 (api-client.ts)
- [ ] 修复 API 类型定义错误
- [ ] 修复认证相关类型错误
- [ ] 修复 Store 类型错误
- [ ] 修复 WebSocket 消息类型错误
- [ ] 处理 Console 语句警告
- [ ] 替换所有 `any` 类型为具体类型
- [ ] 移除未使用的变量和导入

### 正在处理 (In Progress)
- 当前无正在处理的项目

### 已完成 (Completed)
- 当前无已完成的项目

---

## 新发现问题

### 潜在问题
1. **类型定义不一致**: 多个文件中的类型定义与实际使用不匹配
2. **接口扩展问题**: 一些接口扩展存在类型冲突
3. **依赖类型更新**: 可能需要更新依赖包的类型定义

### 建议改进
1. **建立统一的类型定义文件**: 避免类型定义分散和不一致
2. **添加严格的类型检查**: 在 tsconfig.json 中启用更严格的类型检查
3. **代码审查流程**: 建立代码提交前的类型检查流程

---

## 更新日志

### 2025-07-17
- 初始创建文档
- 记录了 TypeScript 编译错误 (373个)
- 记录了 ESLint 警告
- 创建了错误分类和跟踪系统

---

## 注意事项

⚠️ **重要**: 
- 修复错误前请确保备份相关文件
- 类型修复可能影响其他依赖文件
- 建议逐步修复，每次修复后进行编译测试
- 优先修复阻塞编译的高优先级错误