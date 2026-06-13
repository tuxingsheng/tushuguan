<script setup>
import { NMenu } from 'naive-ui'

defineProps({ activeKey: String })
defineEmits(['click'])

const menuOptions = [
  { label: '仪表盘', key: 'dashboard' },
  { label: '图书管理', key: 'books' },
  { label: '读者管理', key: 'members' },
  { label: '借阅管理', key: 'borrowings' },
  { label: '分类管理', key: 'categories' }
]
</script>

<template>
  <div class="sidebar-wrapper">
    <div class="sidebar-brand">管理后台</div>
    <n-menu
      :options="menuOptions"
      :value="activeKey"
      @update:value="$emit('click', $event)"
    />
  </div>
</template>

<style scoped>
.sidebar-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-brand {
  padding: 20px 20px 12px;
  font-size: 11px;
  font-weight: 500;
  color: #8894a6;
  letter-spacing: 0.06em;
}

:deep(.n-menu) {
  --n-item-text-color: var(--sidebar-text);
  --n-item-color-hover: var(--sidebar-hover);
  --n-item-color-active: var(--sidebar-active);
  --n-item-text-color-hover: var(--sidebar-text-active);
  --n-item-text-color-active: var(--sidebar-text-active);
  --n-border-color: transparent;
  --n-font-size: 14px;
  padding: 0 12px;
}

:deep(.n-menu-item) {
  border-radius: 6px;
  margin-bottom: 2px;
}

:deep(.n-menu-item.n-menu-item--selected) {
  font-weight: 600;
}
</style>
