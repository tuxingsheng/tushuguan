<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NForm, NFormItem, NInput, NButton, NSelect, NInputNumber, NDatePicker, NCard } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { useBooksStore } from '@/stores/books'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const route = useRoute()
const booksStore = useBooksStore()
const message = useMessage()

const isEdit = ref(false)
const formRef = ref(null)
const categories = ref([])
const submitting = ref(false)

const formValue = ref({
  title: '',
  author: '',
  isbn: '',
  category_id: null,
  publisher: '',
  publish_date: null,
  stock: 1,
  cover_image: '',
  description: ''
})

const rules = {
  title: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  stock: [{ required: true, type: 'number', min: 0, message: '库存不能为负数', trigger: 'blur' }]
}

async function loadCategories() {
  const { data } = await supabase.from('categories').select('*').order('name')
  categories.value = (data || []).map(c => ({ label: c.name, value: c.id }))
}

async function loadBook() {
  const id = route.params.id
  if (!id) return
  isEdit.value = true
  try {
    const book = await booksStore.fetchBook(id)
    formValue.value = {
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      category_id: book.category_id,
      publisher: book.publisher || '',
      publish_date: book.publish_date ? new Date(book.publish_date).getTime() : null,
      stock: book.stock,
      cover_image: book.cover_image || '',
      description: book.description || ''
    }
  } catch (err) {
    message.error('加载图书信息失败')
    router.push('/books')
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitting.value = true

    const publishDate = formValue.value.publish_date
      ? new Date(formValue.value.publish_date).toISOString().split('T')[0]
      : null

    if (isEdit.value) {
      const id = route.params.id
      // 非库存字段用普通 update
      const { stock, ...rest } = formValue.value
      await booksStore.updateBook(id, { ...rest, publish_date: publishDate })
      // 库存变动通过安全 RPC（检查借出数）
      await booksStore.updateBookStock(id, stock)
      message.success('更新成功')
    } else {
      await booksStore.createBook({ ...formValue.value, publish_date: publishDate })
      message.success('添加成功')
    }
    router.push('/books')
  } catch (err) {
    if (err.message) message.error(err.message)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadCategories()
  loadBook()
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2>{{ isEdit ? '✏️ 编辑图书' : '➕ 新增图书' }}</h2>
      <n-button @click="router.push('/books')">返回列表</n-button>
    </div>

    <n-card class="form-card" style="border-radius: 12px">
      <n-form ref="formRef" :model="formValue" :rules="rules" label-placement="left" label-width="80">
        <n-grid :cols="2" :x-gap="24">
          <n-grid-item>
            <n-form-item label="书名" path="title">
              <n-input v-model:value="formValue.title" placeholder="请输入书名" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="作者" path="author">
              <n-input v-model:value="formValue.author" placeholder="请输入作者" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="ISBN" path="isbn">
              <n-input v-model:value="formValue.isbn" placeholder="请输入 ISBN" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="分类" path="category_id">
              <n-select v-model:value="formValue.category_id" :options="categories" placeholder="请选择分类" clearable />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="出版社">
              <n-input v-model:value="formValue.publisher" placeholder="请输入出版社" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="出版日期">
              <n-date-picker v-model:value="formValue.publish_date" type="date" clearable style="width: 100%" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="库存数量" path="stock">
              <n-input-number v-model:value="formValue.stock" :min="0" style="width: 100%" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="封面图片">
              <n-input v-model:value="formValue.cover_image" placeholder="封面图片 URL" />
            </n-form-item>
          </n-grid-item>
        </n-grid>
        <n-form-item label="简介">
          <n-input v-model:value="formValue.description" type="textarea" :rows="3" placeholder="请输入图书简介" />
        </n-form-item>
        <n-form-item>
          <n-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ isEdit ? '保存修改' : '确认添加' }}
          </n-button>
          <n-button style="margin-left: 12px" @click="router.push('/books')">取消</n-button>
        </n-form-item>
      </n-form>
    </n-card>
  </div>
</template>
