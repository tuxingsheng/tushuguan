<script setup>
import { ref, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NInput, NDataTable, NSpace, NPopconfirm, NEmpty } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { useMembersStore } from '@/stores/members'

const router = useRouter()
const membersStore = useMembersStore()
const message = useMessage()

const search = ref('')
const page = ref(1)
const pageSize = ref(10)

const columns = [
  { title: '姓名', key: 'name', width: 100 },
  { title: '电话', key: 'phone', width: 130 },
  { title: '邮箱', key: 'email', width: 180, ellipsis: { tooltip: true } },
  { title: '地址', key: 'address', width: 180, ellipsis: { tooltip: true } },
  { title: '类型', key: 'member_type', width: 80 },
  { title: '注册日期', key: 'join_date', width: 110 },
  {
    title: '操作', key: 'actions', width: 160, fixed: 'right',
    render: (row) => h(NSpace, null, {
      default: () => [
        h(NButton, { size: 'small', onClick: () => router.push(`/members/${row.id}/edit`) }, { default: () => '编辑' }),
        h(NPopconfirm, { onPositiveClick: () => handleDelete(row.id) }, {
          trigger: () => h(NButton, { size: 'small', type: 'error' }, { default: () => '删除' }),
          default: () => '确定删除该读者？相关的借阅记录也会被删除'
        })
      ]
    })
  }
]

async function loadMembers() {
  await membersStore.fetchMembers({
    page: page.value,
    pageSize: pageSize.value,
    search: search.value
  })
}

async function handleDelete(id) {
  try {
    await membersStore.deleteMember(id)
    message.success('删除成功')
    loadMembers()
  } catch (err) {
    message.error('删除失败: ' + err.message)
  }
}

function handleSearch() {
  page.value = 1
  loadMembers()
}

function handlePageChange(p) {
  page.value = p
  loadMembers()
}

onMounted(loadMembers)
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2>👤 读者管理</h2>
      <n-button type="primary" @click="router.push('/members/add')">新增读者</n-button>
    </div>

    <div class="toolbar-row">
      <n-input
        v-model:value="search"
        placeholder="搜索姓名 / 电话 / 邮箱"
        clearable
        style="width: 260px"
        @keyup.enter="handleSearch"
      />
      <n-button @click="handleSearch">搜索</n-button>
    </div>

    <n-dataTable
      :columns="columns"
      :data="membersStore.members"
      :loading="membersStore.loading"
      :bordered="false"
      striped
      remote
      :pagination="{
        page: page,
        pageSize: pageSize,
        itemCount: membersStore.total,
        onChange: handlePageChange
      }"
    >
      <template #empty>
        <n-empty description="暂无读者" />
      </template>
    </n-dataTable>
  </div>
</template>
