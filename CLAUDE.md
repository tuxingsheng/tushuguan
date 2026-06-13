# 图书管理系统

## 项目概述

基于 Vue 3 + Naive UI + Supabase 的图书管理系统。功能模块：图书管理、读者管理、借阅/归还、分类管理、仪表盘统计。支持桌面端和 H5 移动端响应式布局。

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Vue 3（Composition API + `<script setup>`） |
| UI 库 | Naive UI 2.x |
| 构建 | Vite 8.x |
| 路由 | Vue Router 4 |
| 状态管理 | Pinia 3 |
| 后端 | Supabase（PostgreSQL + Auth + REST API） |

## 启动

```bash
npm install
npm run dev      # 开发服务器
npm run build    # 生产构建
```

## 项目结构

```
src/
├── main.js                    # 入口：挂载 Pinia → Router → Naive UI → App
├── App.vue                    # 根：n-config-provider（主题 + 中文 locale）→ message/dialog provider
├── lib/
│   └── supabase.js            # Supabase 客户端（URL + anon_key）
├── router/
│   └── index.js               # 路由表 + beforeEach 守卫（检查 session）
├── stores/
│   ├── auth.js                # 登录 / 注册 / 登出 / 会话
│   ├── books.js               # 图书 CRUD + updateBookStock（安全库存 RPC）
│   ├── members.js             # 读者 CRUD
│   └── borrowings.js          # 借阅管理（fetch 时自动标记逾期 → borrow_book/return_book RPC）
├── components/
│   ├── AppLayout.vue          # 主布局：顶栏 + 侧栏 + <router-view>
│   └── SideMenu.vue           # Naive Menu（覆写 CSS 变量适配深色/浅色侧栏）
├── views/
│   ├── Login.vue              # 登录/注册页（双模式切换）
│   ├── Dashboard.vue          # 统计卡片（computed 响应式），逾期 > 0 时高亮
│   ├── Books.vue              # 图书列表（搜索 / 分类筛选 / 分页），空状态 n-empty
│   ├── BookForm.vue           # 图书新增/编辑（编辑时库存走安全 RPC）
│   ├── Members.vue            # 读者列表
│   ├── MemberForm.vue         # 读者新增/编辑
│   ├── Borrowings.vue         # 借阅记录（状态筛选 / 还书 / 删除），空状态 n-empty
│   ├── BorrowForm.vue         # 新建借阅（只显示 available>0 的图书）
│   └── Categories.vue         # 分类管理（内联 Modal CRUD），空状态 n-empty
└── styles/
    └── global.css             # 设计令牌（CSS 变量）+ 布局类 + 响应式
supabase/
└── schema.sql                 # 建表 + RLS 策略 + 3 个原子 RPC 函数
```

## 路由表

| 路径 | 组件 | 需认证 |
|---|---|---|
| `/login` | Login | 否 |
| `/` | Dashboard | 是 |
| `/books` | Books | 是 |
| `/books/add` | BookForm | 是 |
| `/books/:id/edit` | BookForm | 是 |
| `/members` | Members | 是 |
| `/members/add` | MemberForm | 是 |
| `/members/:id/edit` | MemberForm | 是 |
| `/borrowings` | Borrowings | 是 |
| `/borrowings/new` | BorrowForm | 是 |
| `/categories` | Categories | 是 |

路由守卫 `beforeEach`：需认证但无 session → 跳 `/login`；已登录访问 `/login` → 跳 `/`

## 数据库

### 表

- **categories**：id、name（UNIQUE）、description、created_at
- **books**：id、title、author、isbn（UNIQUE）、category_id（FK）、publisher、publish_date、stock、available、cover_image、description、created_at、updated_at
- **members**：id、name、phone、email、address、member_type、join_date、created_at
- **borrowings**：id、book_id（FK CASCADE）、member_id（FK CASCADE）、borrow_date、due_date、return_date、status（borrowed / returned / overdue）、created_at

### RPC 函数（原子操作，SECURITY DEFINER）

| 函数 | 说明 |
|---|---|
| `borrow_book(p_book_id, p_member_id, p_borrow_date, p_due_date)` | `FOR UPDATE` 锁行 → 检查 available>0 → 减库存 → 插入借阅记录。全程原子化 |
| `return_book(p_borrowing_id)` | `FOR UPDATE` 锁行 → 检查未归还 → 更新状态为 returned → 恢复库存 |
| `update_book_stock(p_book_id, p_new_stock)` | 计算 `新库存 − 当前借出数`，结果 <0 则抛异常，否则更新 stock 和 available |

### RLS

所有表启用 RLS，仅 `authenticated` 用户可 CRUD。单管理员模式，认证即可全量操作。

## 认证流程

1. Supabase Auth（邮箱 + 密码）
2. 注册：登录页切换至注册模式 → `auth.register()` → `supabase.auth.signUp()`
3. 登录：`auth.login()` → `supabase.auth.signInWithPassword()`
4. `router/index.js` 的 `beforeEach` 检查 `supabase.auth.getSession()`
5. AppLayout 退出按钮调用 `auth.logout()` 后手动 `router.push('/login')`

## UI 主题

当前主题：「麦纸」（Wheat + Slate Blue）
- CSS 变量在 `src/styles/global.css` 的 `:root` 中定义
- Naive UI 主题覆写在 `src/App.vue` 的 `themeOverrides` 中
- 侧栏菜单样式覆写在 `src/components/SideMenu.vue` 的 `:deep(.n-menu)` 中

改主题需同步更新以上三处。

### 关键 CSS 令牌

```
--sidebar-bg: #e8ecf1    侧栏底色（蓝灰）
--accent: #4a6fa5        主色（石板蓝）
--page-bg: #faf6ef       内容区底色（暖麦）
--card-bg: #ffffff       卡片白
--danger: #b53b3b        删除红
```

## 关键设计决策

1. **借阅/归还原子的 RPC**：放弃前端两步操作，统一用数据库事务保证一致性
2. **编辑图书库存安全**：`BookForm.vue` 提交时分离库存字段，单独走 `update_book_stock` RPC 检查借出数
3. **逾期自动标记**：`borrowings.js` 的 `fetchBorrowings()` 在每次查询前批量 `UPDATE status='overdue' WHERE due_date < today`，保证状态筛选准确
4. **Dashboard 响应式卡片**：`cards` 为 `computed`，`stats` 更新时自动刷新；逾期 > 0 时卡片红色高亮
5. **空状态**：所有列表页 DataTable 使用 `#empty` 插槽 + `<n-empty>` 提示
6. **级联删除提示**：删除图书/读者时确认框明确告知关联借阅记录也会被删除
7. **Naive UI 全局包裹**：`App.vue` 中 `n-config-provider`（中文 locale + themeOverrides）→ `n-message-provider` → `n-dialog-provider`

## Supabase 初始化

1. Supabase Dashboard 创建项目
2. SQL Editor 执行 `supabase/schema.sql`
3. Authentication → 启用 Email 登录
4. Authentication → Users → Add User 创建管理员账号
5. 将项目 URL 和 anon_key 填入 `src/lib/supabase.js`

## 注意事项

- `src/lib/supabase.js` 中的 key 是 publishable key，可公开暴露
- Naive UI 的 `useMessage()` 必须在 `<n-message-provider>` 子组件内调用
- `<script setup>` 中导入的组件自动注册到模板，IDE 的 "unused import" 是误报
- 数据库 schema 变更后务必同步更新 `supabase/schema.sql`
- 本项目所有输出、注释、文档均使用中文
- 详细文档见 `wiki/` 目录（README.md 为索引入口）
