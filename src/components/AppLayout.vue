<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NLayout, NLayoutSider, NLayoutContent, NLayoutHeader, NSpace, NAvatar, NDropdown, NButton } from 'naive-ui'
import SideMenu from './SideMenu.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const isMobile = ref(false)
const sidebarCollapsed = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 768
  sidebarCollapsed.value = isMobile.value
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const activeKey = computed(() => {
  const path = route.path
  if (path.startsWith('/books')) return 'books'
  if (path.startsWith('/members')) return 'members'
  if (path.startsWith('/borrowings')) return 'borrowings'
  if (path.startsWith('/categories')) return 'categories'
  return 'dashboard'
})

const dropdownOptions = [
  { label: '退出登录', key: 'logout' }
]

async function handleSelect(key) {
  if (key === 'logout') {
    await auth.logout()
    router.push('/login')
  }
}

function handleMenuClick(key) {
  const map = {
    dashboard: '/',
    books: '/books',
    members: '/members',
    borrowings: '/borrowings',
    categories: '/categories'
  }
  router.push(map[key] || '/')
  // 移动端点击菜单后自动收起侧栏
  if (isMobile.value) {
    sidebarCollapsed.value = true
  }
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<template>
  <n-layout style="height: 100vh; display: flex; flex-direction: column">
    <!-- 顶栏 -->
    <n-layout-header
      class="app-header"
      style="
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        background: var(--header-bg);
        border-bottom: 1px solid var(--border);
        z-index: 20;
        flex-shrink: 0;
      "
    >
      <div style="display: flex; align-items: center; gap: 8px">
        <!-- 移动端汉堡菜单 -->
        <n-button
          v-if="isMobile"
          text
          size="small"
          @click="toggleSidebar"
          style="font-size: 20px; width: 36px; height: 36px"
        >
          {{ sidebarCollapsed ? '☰' : '✕' }}
        </n-button>
        <span style="font-size: 18px">📚</span>
        <span class="header-title">图书管理系统</span>
      </div>
      <n-dropdown :options="dropdownOptions" @select="handleSelect" trigger="click">
        <n-space align="center" style="cursor: pointer">
          <n-avatar size="small" round :style="{ background: 'var(--accent)' }">管</n-avatar>
          <span class="header-username">管理员</span>
        </n-space>
      </n-dropdown>
    </n-layout-header>

    <!-- 侧栏 + 内容 -->
    <n-layout has-sider style="height: calc(100vh - 52px); flex: 1">
      <n-layout-sider
        :width="220"
        :collapsed-width="0"
        :collapsed="sidebarCollapsed"
        :show-trigger="false"
        :native-scrollbar="false"
        collapse-mode="transform"
        :style="{
          background: 'var(--sidebar-bg)',
          borderRight: isMobile ? 'none' : '1px solid var(--border)',
          zIndex: isMobile ? 15 : 'auto'
        }"
      >
        <SideMenu :active-key="activeKey" @click="handleMenuClick" />
      </n-layout-sider>

      <!-- 移动端遮罩层 -->
      <div
        v-if="isMobile && !sidebarCollapsed"
        class="sidebar-overlay"
        @click="sidebarCollapsed = true"
      />

      <n-layout-content style="overflow-y: auto">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style scoped>
.app-header {
  padding: 0 20px;
}

.header-username {
  font-size: 13px;
  color: var(--text-secondary);
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.03em;
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 10;
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 12px;
  }
  .header-title {
    font-size: 14px;
  }
  .header-username {
    display: none;
  }
}
</style>
