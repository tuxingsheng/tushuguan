<script setup>
import { ref, computed, onMounted } from 'vue'
import { NCard, NSpin, NButton, NResult } from 'naive-ui'
import { supabase } from '@/lib/supabase'

const stats = ref({
  totalBooks: 0,
  totalMembers: 0,
  borrowedCount: 0,
  overdueCount: 0
})
const loading = ref(true)
const error = ref(null)

async function loadStats() {
  loading.value = true
  error.value = null
  try {
    const today = new Date().toISOString().split('T')[0]
    const [{ count: totalBooks }, { count: totalMembers }, { count: borrowedCount }, { count: overdueCount }] = await Promise.all([
      supabase.from('books').select('*', { count: 'exact', head: true }),
      supabase.from('members').select('*', { count: 'exact', head: true }),
      supabase.from('borrowings').select('*', { count: 'exact', head: true }).eq('status', 'borrowed'),
      supabase.from('borrowings').select('*', { count: 'exact', head: true })
        .or(`status.eq.overdue,and(status.eq.borrowed,due_date.lt.${today})`)
    ])
    stats.value = {
      totalBooks: totalBooks || 0,
      totalMembers: totalMembers || 0,
      borrowedCount: borrowedCount || 0,
      overdueCount: overdueCount || 0
    }
  } catch (err) {
    error.value = err.message || '未知错误'
  } finally {
    loading.value = false
  }
}

onMounted(loadStats)

const cards = computed(() => [
  { label: '图书总数', value: stats.value.totalBooks, icon: '📖', bg: '#e8eaf6', iconBg: '#c5cae9' },
  { label: '读者总数', value: stats.value.totalMembers, icon: '👤', bg: '#e8f5e9', iconBg: '#c8e6c9' },
  { label: '借出中', value: stats.value.borrowedCount, icon: '📋', bg: '#fff3e0', iconBg: '#ffe0b2' },
  { label: '已逾期', value: stats.value.overdueCount, icon: '⚠', bg: '#ffebee', iconBg: '#ffcdd2' }
])

const isEmpty = computed(() =>
  !error.value &&
  !loading.value &&
  stats.value.totalBooks === 0 &&
  stats.value.totalMembers === 0
)
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2>仪表盘</h2>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" style="display: flex; justify-content: center; align-items: center; height: 60vh">
      <n-spin :show="true" />
    </div>

    <!-- 加载出错 -->
    <n-result
      v-else-if="error"
      status="500"
      title="加载失败"
      :description="error"
    >
      <template #footer>
        <n-button type="primary" @click="loadStats">重新加载</n-button>
      </template>
    </n-result>

    <!-- 正常显示 -->
    <template v-else>
      <div class="stat-cards">
        <div
          v-for="card in cards"
          :key="card.label"
          class="stat-card"
          :class="{ 'overdue-warn': card.label === '已逾期' && card.value > 0 }"
        >
          <div class="stat-icon" :style="{ background: card.bg }">{{ card.icon }}</div>
          <div class="stat-info">
            <h3>{{ card.value }}</h3>
            <p>{{ card.label }}</p>
          </div>
        </div>
      </div>

      <!-- 首次使用引导 -->
      <n-card v-if="isEmpty" title="👋 欢迎使用" style="border-radius: 10px; margin-bottom: 20px">
        <p style="color: var(--text-secondary); margin-bottom: 16px">
          看起来还没有任何数据，请先在 Supabase 中执行建表 SQL，然后开始添加数据。
        </p>
        <div class="quick-actions">
          <router-link to="/categories">
            <n-button type="primary">1. 先添加分类</n-button>
          </router-link>
          <router-link to="/books/add">
            <n-button type="primary">2. 再录入图书</n-button>
          </router-link>
          <router-link to="/members/add">
            <n-button type="info">3. 登记读者</n-button>
          </router-link>
          <router-link to="/borrowings/new">
            <n-button type="warning">4. 开始借阅</n-button>
          </router-link>
        </div>
      </n-card>

      <n-card v-else title="快速操作" style="border-radius: 10px">
        <div class="quick-actions">
          <router-link to="/books/add">
            <n-button type="primary" dashed>新增图书</n-button>
          </router-link>
          <router-link to="/members/add">
            <n-button type="info" dashed>新增读者</n-button>
          </router-link>
          <router-link to="/borrowings/new">
            <n-button type="warning" dashed>新建借阅</n-button>
          </router-link>
          <router-link to="/categories">
            <n-button dashed>管理分类</n-button>
          </router-link>
        </div>
      </n-card>
    </template>
  </div>
</template>
