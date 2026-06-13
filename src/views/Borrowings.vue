<script setup>
import { ref, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NInput, NDataTable, NSpace, NTag, NPopconfirm, NSelect, NEmpty } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { useBorrowingsStore } from '@/stores/borrowings'

const router = useRouter()
const borrowingsStore = useBorrowingsStore()
const message = useMessage()

const search = ref('')
const page = ref(1)
const pageSize = ref(10)
const statusFilter = ref('')

const statusOptions = [
  { label: '全部', value: '' },
  { label: '借出中', value: 'borrowed' },
  { label: '已归还', value: 'returned' },
  { label: '已逾期', value: 'overdue' }
]

const columns = [
  { title: '图书', key: 'book_title', width: 180, render: (row) => row.books?.title || '-' },
  { title: '读者', key: 'member_name', width: 100, render: (row) => row.members?.name || '-' },
  { title: '借阅日期', key: 'borrow_date', width: 110 },
  { title: '应还日期', key: 'due_date', width: 110 },
  { title: '归还日期', key: 'return_date', width: 110, render: (row) => row.return_date || '-' },
  {
    title: '状态', key: 'status', width: 90,
    render: (row) => {
      const map = { borrowed: ['借出中', 'warning'], returned: ['已归还', 'success'], overdue: ['已逾期', 'error'] }
      const [label, type] = map[row.status] || [row.status, 'default']
      return h(NTag, { type }, { default: () => label })
    }
  },
  {
    title: '操作', key: 'actions', width: 200, fixed: 'right',
    render: (row) => h(NSpace, null, {
      default: () => {
        const buttons = []
        if (row.status === 'borrowed' || row.status === 'overdue') {
          buttons.push(
            h(NPopconfirm, { onPositiveClick: () => handleReturn(row.id) }, {
              trigger: () => h(NButton, { size: 'small', type: 'success' }, { default: () => '还书' }),
              default: () => '确认归还该图书？'
            })
          )
        }
        buttons.push(
          h(NPopconfirm, { onPositiveClick: () => handleDelete(row.id) }, {
            trigger: () => h(NButton, { size: 'small', type: 'error' }, { default: () => '删除' }),
            default: () => '确定删除该借阅记录？'
          })
        )
        return buttons
      }
    })
  }
]

async function loadBorrowings() {
  await borrowingsStore.fetchBorrowings({
    page: page.value,
    pageSize: pageSize.value,
    search: search.value,
    status: statusFilter.value
  })
}

async function handleReturn(id) {
  try {
    await borrowingsStore.returnBook(id)
    message.success('归还成功')
    loadBorrowings()
  } catch (err) {
    message.error('归还失败: ' + err.message)
  }
}

async function handleDelete(id) {
  try {
    await borrowingsStore.deleteBorrowing(id)
    message.success('删除成功')
    loadBorrowings()
  } catch (err) {
    message.error('删除失败: ' + err.message)
  }
}

function handleSearch() {
  page.value = 1
  loadBorrowings()
}

function handlePageChange(p) {
  page.value = p
  loadBorrowings()
}

onMounted(loadBorrowings)
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2>📋 借阅管理</h2>
      <n-button type="primary" @click="router.push('/borrowings/new')">新建借阅</n-button>
    </div>

    <div class="toolbar-row">
      <n-input
        v-model:value="search"
        placeholder="搜索图书 / 读者"
        clearable
        style="width: 220px"
        @keyup.enter="handleSearch"
      />
      <n-select
        v-model:value="statusFilter"
        :options="statusOptions"
        style="width: 120px"
        @update:value="handleSearch"
      />
      <n-button @click="handleSearch">搜索</n-button>
    </div>

    <n-dataTable
      :columns="columns"
      :data="borrowingsStore.borrowings"
      :loading="borrowingsStore.loading"
      :bordered="false"
      striped
      remote
      :pagination="{
        page: page,
        pageSize: pageSize,
        itemCount: borrowingsStore.total,
        onChange: handlePageChange
      }"
    >
      <template #empty>
        <n-empty description="暂无借阅记录" />
      </template>
    </n-dataTable>
  </div>
</template>
