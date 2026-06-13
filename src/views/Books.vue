<script setup>
import { ref, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NInput, NDataTable, NSpace, NTag, NPopconfirm, NSelect, NEmpty } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { useBooksStore } from '@/stores/books'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const booksStore = useBooksStore()
const message = useMessage()

const search = ref('')
const page = ref(1)
const pageSize = ref(10)
const categories = ref([])
const selectedCategory = ref(null)

const columns = [
  { title: '书名', key: 'title', width: 180, ellipsis: { tooltip: true } },
  { title: '作者', key: 'author', width: 140 },
  { title: 'ISBN', key: 'isbn', width: 140 },
  { title: '分类', key: 'category', width: 100, render: (row) => row.categories?.name || '-' },
  { title: '出版社', key: 'publisher', width: 120, ellipsis: { tooltip: true } },
  {
    title: '库存', key: 'stock', width: 80,
    render: (row) => `${row.available}/${row.stock}`
  },
  {
    title: '操作', key: 'actions', width: 160, fixed: 'right',
    render: (row) => h(NSpace, null, {
      default: () => [
        h(NButton, { size: 'small', onClick: () => router.push(`/books/${row.id}/edit`) }, { default: () => '编辑' }),
        h(NPopconfirm, { onPositiveClick: () => handleDelete(row.id) }, {
          trigger: () => h(NButton, { size: 'small', type: 'error' }, { default: () => '删除' }),
          default: () => '确定删除该图书？相关的借阅记录也会被删除'
        })
      ]
    })
  }
]

async function loadBooks() {
  await booksStore.fetchBooks({
    page: page.value,
    pageSize: pageSize.value,
    search: search.value,
    categoryId: selectedCategory.value
  })
}

async function loadCategories() {
  const { data } = await supabase.from('categories').select('*').order('name')
  categories.value = (data || []).map(c => ({ label: c.name, value: c.id }))
}

async function handleDelete(id) {
  try {
    await booksStore.deleteBook(id)
    message.success('删除成功')
    loadBooks()
  } catch (err) {
    message.error('删除失败: ' + err.message)
  }
}

function handleSearch() {
  page.value = 1
  loadBooks()
}

function handlePageChange(p) {
  page.value = p
  loadBooks()
}

onMounted(() => {
  loadBooks()
  loadCategories()
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2>📖 图书管理</h2>
      <n-button type="primary" @click="router.push('/books/add')">新增图书</n-button>
    </div>

    <div class="toolbar-row">
      <n-input
        v-model:value="search"
        placeholder="搜索书名 / 作者 / ISBN"
        clearable
        style="width: 260px"
        @keyup.enter="handleSearch"
      />
      <n-select
        v-model:value="selectedCategory"
        placeholder="全部分类"
        clearable
        :options="categories"
        style="width: 160px"
        @update:value="handleSearch"
      />
      <n-button @click="handleSearch">搜索</n-button>
    </div>

    <n-dataTable
      :columns="columns"
      :data="booksStore.books"
      :loading="booksStore.loading"
      :bordered="false"
      :single-line="false"
      striped
      remote
      :pagination="{
        page: page,
        pageSize: pageSize,
        itemCount: booksStore.total,
        onChange: handlePageChange
      }"
    >
      <template #empty>
        <n-empty description="暂无图书" />
      </template>
    </n-dataTable>
  </div>
</template>
