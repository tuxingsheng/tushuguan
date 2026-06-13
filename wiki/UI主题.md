# UI 主题

当前主题：**「麦纸」（Wheat + Slate Blue）** — 暖麦色底 + 蓝灰侧栏 + 石板蓝点缀。

## 修改主题需同步三处

### 位置 1：CSS 设计令牌

**文件：** `src/styles/global.css` → `:root`

```css
:root {
  --sidebar-bg: #e8ecf1;        /* 侧栏底色（蓝灰） */
  --sidebar-hover: #dce1e7;
  --sidebar-active: #d0d8e0;
  --sidebar-text: #4a5568;
  --sidebar-text-active: #2c3e5a;

  --accent: #4a6fa5;            /* 主色（石板蓝） */
  --accent-hover: #5b82b8;
  --accent-light: #edf2f8;
  --danger: #b53b3b;            /* 删除红 */

  --page-bg: #faf6ef;           /* 内容区底色（暖麦） */
  --card-bg: #ffffff;           /* 卡片白 */
  --text-primary: #2d2a25;      /* 正文 */
  --text-secondary: #6b6560;    /* 辅助文字 */
  --text-muted: #958f88;        /* 次要文字 */
  --border: #e5e0d8;            /* 边框 */
  --header-bg: #ffffff;         /* 顶栏 */

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 2px 12px rgba(0,0,0,0.06);
}
```

### 位置 2：Naive UI 主题覆写

**文件：** `src/App.vue` → `themeOverrides`

```js
const themeOverrides = {
  common: {
    primaryColor: '#4a6fa5',
    primaryColorHover: '#5b82b8',
    primaryColorPressed: '#3c5c8a',
    successColor: '#3d7a4f',
    warningColor: '#c57814',
    errorColor: '#b53b3b',
    borderRadius: '6px',
  },
  Button: { borderRadiusMedium: '6px' },
  Card: { borderRadius: '8px' },
  DataTable: {
    borderRadius: '8px',
    thColor: '#faf8f3',
    tdColor: '#ffffff',
  },
  Tag: { borderRadius: '4px' },
}
```

### 位置 3：侧栏菜单样式

**文件：** `src/components/SideMenu.vue` → `<style scoped>`

```css
:deep(.n-menu) {
  --n-item-text-color: var(--sidebar-text);
  --n-item-color-hover: var(--sidebar-hover);
  --n-item-color-active: var(--sidebar-active);
  --n-item-text-color-hover: var(--sidebar-text-active);
  --n-item-text-color-active: var(--sidebar-text-active);
  --n-font-size: 14px;
}
```

## 布局要点

| 元素 | 宽度/高度 |
|---|---|
| 顶栏 | 52px |
| 侧栏 | 220px |
| 内容区 | calc(100vh - 52px) |

> **注意**：Naive UI `n-layout` 默认 `position: static`，不响应 `flex: 1`。内层 layout 使用了 `height: calc(100vh - 52px)` 硬编码来绕过这个问题。

## 响应式

`global.css` 包含 `@media (max-width: 768px)` 断点：
- 页面内边距减半
- 统计卡片变为 2 列
- 工具栏变为纵排
- 页面标题折行

## 全局布局样式

```css
html, body, #app { height: 100%; }

.n-layout--static-positioned {
  display: flex !important;
  flex-direction: column;
  height: 100%;
}

.n-layout-content {
  background: var(--page-bg) !important;
}
```
