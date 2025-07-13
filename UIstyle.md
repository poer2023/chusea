以下内容就是把 **MVP 首屏 + 关键子流程** 拆到“像写前端工单一样”的交互规格。你可以直接把这一段贴给 Cursor / Claude ，让 AI 按组件-粒度去生成代码。

---

## 0. 设计原则

| 维度   | 决策                                                                                                     | 说明                                                |
| ---- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| 布局   | **Holy Grail**：上—中—右三栏                                                                                 | 中央正文 66 % 宽；右侧 24 %；左右各留 5 % 空白，抗 1440–1920 px 宽度 |
| 响应式  | **Desktop ≥ 768 px**：三栏<br>**Tablet 560-767 px**：正文 + 折叠 Chat 按钮<br>**Mobile < 560 px**：全屏正文，Chat 浮动圆钮 | 组件位置不跳，只做折叠与抽屉                                    |
| 交互模式 | **光标不离正文**；复杂指令走 Slash / Chat                                                                          | 浮动工具条覆盖 80 % AI 操作                                |
| 动效   | 200 ms ease-out；流程条节点用 **Framer Motion scaleY**                                                        | 生成 / 写入 / 回退动画统一                                  |

---

## 1. 页面骨架（Desktop）

```
------------------------------------------------------------
| TopBar (56px)                                           |
------------------------------------------------------------
| ProcessBar (48px, sticky)                               |
------------------------------------------------------------
|                      | ChatPanel (min-w 300px, max-w 380px)
|  MainEditor          |------------------------------------
|  (flex-1)            |  ChatHeader (tabs: Prompt / Log)
|                      |  ChatBody   (auto-scroll)
|                      |  ChatInput  (/slash + prompt feed)
------------------------------------------------------------
| FloatingToolbar (contextual, 40px) • Toaster (bottom-right)
```

### Tailwind 快照

| 区域           | 类名                                                                         |
| ------------ | -------------------------------------------------------------------------- |
| `TopBar`     | `h-14 px-4 flex items-center justify-between bg-white shadow-sm`           |
| `ProcessBar` | `h-12 pl-4 flex items-center gap-2 bg-gray-50 border-b sticky top-14 z-30` |
| `MainEditor` | `flex-1 prose max-w-none px-[min(8%,120px)] py-8 overflow-y-auto`          |
| `ChatPanel`  | `w-[24%] max-w-[380px] min-w-[300px] border-l flex flex-col`               |

---

## 2. 组件交互细节

### 2.1 TopBar

| 子区 | 元件                                                               | 交互                                                             |
| -- | ---------------------------------------------------------------- | -------------------------------------------------------------- |
| 左  | Logo → 主页                                                        | 点击刷新并清空状态机                                                     |
| 中  | 文档标题 ∶ 可编辑 `contentEditable`                                     | onBlur 保存 → toast“已保存”                                         |
| 右  | `Run ▷`（Auto-Run toggle）<br>`History ⟳`（版本树 modal）<br>`Export ⬇` | `Run`：切换开关 → ProcessBar 节点直播<br>`History`：Drawer 从右滑出，树状图+回滚按钮 |

### 2.2 ProcessBar 2.0

* 数据结构

  ```ts
  type Node = {
    id: string
    type: "Plan" | "Draft" | "Citation" | "Grammar" | "Readability" | "UserEdit" | "Plugin"
    status: "pending" | "running" | "pass" | "fail"
    branch?: string  // 同段落多分支
  }
  ```
* **节点 UI**

  * 16 px 圆点 + 文字；status 用颜色／内环进度。
  * hover 时 Tooltip：耗时、token 消耗、命中率等。
  * click：

    * `pass` 节点 → 设为当前快照（正文闪白一次并滚动至段首）；
    * `fail` 节点 → 弹框：“要回滚并重跑吗”✅/❌
* **自动滚动**：新节点 append 时横向滚动居中。

### 2.3 MainEditor

| 交互    | 触发                                 | 反馈                                                     |
| ----- | ---------------------------------- | ------------------------------------------------------ |
| 选中文本  | mouseup >30 ms & >3 chars          | 显示 **FloatingToolbar**                                 |
| 灰层预览  | Auto-Run 写入前                       | ① 浅灰 overlay ② 左侧竖条闪动 ③ 3 s 倒计时写入<br>用户点 ✅ 立即写入；点 ❌ 回滚 |
| AI 写入 | Node.status === "running" → "pass" | 文本淡入，背景 #fdf7e3 600 ms 后恢复                             |

#### FloatingToolbar

* **按钮**：改写、扩写、翻译、引用、总结（五个）
* **动效**：`scale(0.9) → scale(1)` pop-in
* 点击后：

  1. 右侧 Chat append 指令卡；
  2. Node type = “Plugin”；加入流水线；
  3. 成功写入同样走灰层预览逻辑。

### 2.4 ChatPanel

| 区域     | 功能                           | 说明                                                                    |
| ------ | ---------------------------- | --------------------------------------------------------------------- |
| Header | Tabs “Prompt / Log” + 查询框    | Log 按节点分组；点击跳正文                                                       |
| Body   | 消息气泡                         | AI 消息 = 左对齐灰底；用户消息 = 右对齐主色                                            |
| Input  | `textarea rows=1 → autoGrow` | `/` 触发 Command Palette<br>Tab 键选中建议 prompt<br>Enter 发送；Shift+Enter 换行 |

#### Prompt Feed (建议卡)

* ChatInput 空闲 3 s 就拉取最新 3 条建议，展示为淡灰 tag，可点击或↑↓键切换。
* 建议算法：`embedding.similarity(currentChunk, promptTemplate)` 按余弦值排序。

---

## 3. 循环引擎可视化

1. **Run ON**

   * TopBar `Run ▷` 亮绿色；ProcessBar 实时推节点。
   * 每个节点运行时在右侧弹 `Toast: Grammar-Lint 进行中…`，完成后 `✓ Grammar-Lint 通过`。
2. **Fail → 回退**

   * Node.status = "fail" → 红色闪烁 2 次；自动回到 Draft 节点重写。
   * 若连续 3 次失败，弹对话框要求用户介入。
3. **指标面板**

   * ProcessBar 右端显示 InfoIcon；点击侧滑 Panel，展示：

     * 可读性分数 Gauge；
     * 引用命中率条形；
     * Grammar Error Count。
   * 任何分数 < 阈值时，该条红色；指标达标即绿色。

---

## 4. 键盘快捷键

| 按键                  | 上下文        | 动作                 |
| ------------------- | ---------- | ------------------ |
| `⌘/Ctrl + K`        | 任意         | 打开 Command Palette |
| `⌘/Ctrl + Enter`    | 选区         | 触发默认 AI 动作（改写）     |
| `⌘/Ctrl + ⇧ + E`    | 正文         | 进入 Review Mode     |
| `⌘/Ctrl + [`  / `]` | ProcessBar | 在节点间跳转             |

---

## 5. 失败回退 (UX 细节)

* 循环超时 > 60 s → Node 标橙色，提示“等待模型响应…(可中断)”。
* AI 端报错 → `Toast` + Node 红圈；“Retry 一次”按钮自动出现。
* 引用验证失败 → 写入占位 `[[Invalid Citation #123]]` 且气泡警告，用户可点修复。

---

## 6. Tablet / Mobile 自适应

| 元件              | 位移                                    | 保留            |
| --------------- | ------------------------------------- | ------------- |
| ProcessBar      | Tablet：收为横向 swipe；Mobile：顶部 “…” 抽屉    | 保留状态色、点击回滚    |
| ChatPanel       | Tablet：右侧抽屉<br>Mobile：右下圆形 `Chat` FAB | FAB 点击后全屏抽屉覆盖 |
| FloatingToolbar | Tablet/Mobile 同样出现；按钮改为 Icon Only；纵向排 | 避免遮住文字        |

---

## 7. 开发任务拆分（可喂给 AI 一次出 PR）

1. **Layout Shell**：TopBar / ProcessBar / Main-Right Split（Tailwind + CSS Grid）
2. **ProcessBar 组件**：`<ProcessNode />` + Framer Motion 状态机
3. **Editor 基座**：TipTap / Slate.js，注入灰层预览 & 选区 ContextMenu
4. **Chat 组件**：Tabs + AutoScroll Body + Slash Command 池
5. **Loop Orchestrator**：前端状态机 (XState) 触发后端 `/loop/:step` API
6. **Readability & Citation 插件**：前端标红 + 后端 Redis 缓存钩子
7. **Responsive Breakpoints**：Tailwind `md`, `sm`，自测 560 px

---

### 下一步

* **确定文本编辑器库（TipTap vs Slate）** → 决定浮动工具条实现方式
* **ProcessBar 节点配色 & Icon 集** → 设计师确认 Token

