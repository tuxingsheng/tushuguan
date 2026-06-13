<script setup>
import { ref, onMounted, h } from 'vue'
import { NButton, NInput, NDataTable, NSpace, NPopconfirm, NModal, NForm, NFormItem, NEmpty } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { supabase } from '@/lib/supabase'

const message = useMessage()
const categories = ref([])
const loading = ref(false)
const showModal = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const formRef = ref(null)
const formValue = ref({ name: '', description: '' })

const columns = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '分类名称', key: 'name', width: 200 },
  { title: '描述', key: 'description', ellipsis: { tooltip: true } },
  {
    title: '操作', key: 'actions', width: 200,
    render: (row) => h(NSpace, null, {
      default: () => [
        h(NButton, { size: 'small', onClick: () => openEdit(row) }, { default: () => '编辑' }),
        h(NPopconfirm, { onPositiveClick: () => handleDelete(row.id) }, {
          trigger: () => h(NButton, { size: 'small', type: 'error' }, { default: () => '删除' }),
          default: () => '确定删除该分类？'
        })
      ]
    })
  }
]

async function loadCategories() {
  loading.value = true
  const { data, error } = await supabase.from('categories').select('*').order('id')
  loading.value = false
  if (error) {
    message.error('加载分类失败')
    return
  }
  categories.value = data || []
}

function openAdd() {
  isEdit.value = false
  editingId.value = null
  formValue.value = { name: '', description: '' }
  showModal.value = true
}

function openEdit(row) {
  isEdit.value = true
  editingId.value = row.id
  formValue.value = { name: row.name, description: row.description || '' }
  showModal.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    if (isEdit.value) {
      const { error } = await supabase.from('categories').update(formValue.value).eq('id', editingId.value)
      if (error) throw error
      message.success('更新成功')
    } else {
      const { error } = await supabase.from('categories').insert(formValue.value)
      if (error) throw error
      message.success('添加成功')
    }
    showModal.value = false
    loadCategories()
  } catch (err) {
    if (err.message) message.error(err.message)
  }
}

async function handleDelete(id) {
  try {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    message.success('删除成功')
    loadCategories()
  } catch (err) {
    message.error('删除失败: ' + err.message)
  }
}

onMounted(loadCategories)
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2>🏷️ 分类管理</h2>
      <n-button type="primary" @click="openAdd">新增分类</n-button>
    </div>

    <n-dataTable
      :columns="columns"
      :data="categories"
      :loading="loading"
      :bordered="false"
      striped
      :pagination="{ pageSize: 20 }"
    >
      <template #empty>
        <n-empty description="暂无分类" />
      </template>
    </n-dataTable>

    <n-modal v-model:show="showModal" preset="card" :title="isEdit ? '编辑分类' : '新增分类'" style="width: 480px">
      <n-form ref="formRef" :model="formValue" :rules="{ name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }] }" label-placement="left" label-width="64">
        <n-form-item label="名称" path="name">
          <n-input v-model:value="formValue.name" placeholder="请输入分类名称" />
        </n-form-item>
        <n-form-item label="描述">
          <n-input v-model:value="formValue.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </n-form-item>
        <n-form-item>
          <n-button type="primary" @click="handleSubmit">确认</n-button>
          <n-button style="margin-left: 12px" @click="showModal = false">取消</n-button>
        </n-form-item>
      </n-form>
    </n-modal>
  </div>
</template>
