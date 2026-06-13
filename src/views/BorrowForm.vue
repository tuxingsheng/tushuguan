<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NForm, NFormItem, NButton, NSelect, NDatePicker, NCard } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { useBorrowingsStore } from '@/stores/borrowings'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const borrowingsStore = useBorrowingsStore()
const message = useMessage()

const formRef = ref(null)
const submitting = ref(false)
const books = ref([])
const members = ref([])

const formValue = ref({
  book_id: null,
  member_id: null,
  borrow_date: Date.now(),
  due_date: Date.now() + 30 * 24 * 60 * 60 * 1000
})

const rules = {
  book_id: [{ required: true, message: '请选择图书', trigger: 'change' }],
  member_id: [{ required: true, message: '请选择读者', trigger: 'change' }],
  due_date: [{ required: true, message: '请选择应还日期', trigger: 'change' }]
}

async function loadOptions() {
  const [bookRes, memberRes] = await Promise.all([
    supabase.from('books').select('id, title, available').gt('available', 0).order('title'),
    supabase.from('members').select('id, name').order('name')
  ])
  books.value = (bookRes.data || []).map(b => ({
    label: `${b.title} (可借: ${b.available})`,
    value: b.id
  }))
  members.value = (memberRes.data || []).map(m => ({
    label: m.name,
    value: m.id
  }))
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitting.value = true

    const data = {
      book_id: formValue.value.book_id,
      member_id: formValue.value.member_id,
      borrow_date: new Date(formValue.value.borrow_date).toISOString().split('T')[0],
      due_date: new Date(formValue.value.due_date).toISOString().split('T')[0],
      status: 'borrowed'
    }

    await borrowingsStore.createBorrowing(data)
    message.success('借阅成功')
    router.push('/borrowings')
  } catch (err) {
    if (err.message) message.error(err.message)
  } finally {
    submitting.value = false
  }
}

onMounted(loadOptions)
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2>➕ 新建借阅</h2>
      <n-button @click="router.push('/borrowings')">返回列表</n-button>
    </div>

    <n-card class="form-card" style="border-radius: 12px">
      <n-form ref="formRef" :model="formValue" :rules="rules" label-placement="left" label-width="80">
        <n-form-item label="选择图书" path="book_id">
          <n-select v-model:value="formValue.book_id" :options="books" placeholder="请选择图书" filterable />
        </n-form-item>
        <n-form-item label="选择读者" path="member_id">
          <n-select v-model:value="formValue.member_id" :options="members" placeholder="请选择读者" filterable />
        </n-form-item>
        <n-form-item label="借阅日期">
          <n-date-picker v-model:value="formValue.borrow_date" type="date" style="width: 100%" />
        </n-form-item>
        <n-form-item label="应还日期" path="due_date">
          <n-date-picker v-model:value="formValue.due_date" type="date" style="width: 100%" />
        </n-form-item>
        <n-form-item>
          <n-button type="primary" :loading="submitting" @click="handleSubmit">确认借阅</n-button>
          <n-button style="margin-left: 12px" @click="router.push('/borrowings')">取消</n-button>
        </n-form-item>
      </n-form>
    </n-card>
  </div>
</template>
