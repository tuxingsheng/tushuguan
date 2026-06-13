<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NForm, NFormItem, NInput, NButton, NSelect, NDatePicker, NCard, NGrid, NGridItem } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { useMembersStore } from '@/stores/members'

const router = useRouter()
const route = useRoute()
const membersStore = useMembersStore()
const message = useMessage()

const isEdit = ref(false)
const formRef = ref(null)
const submitting = ref(false)

const formValue = ref({
  name: '',
  phone: '',
  email: '',
  address: '',
  member_type: '普通',
  join_date: Date.now()
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
}

const typeOptions = [
  { label: '普通', value: '普通' },
  { label: 'VIP', value: 'VIP' },
  { label: '学生', value: '学生' },
  { label: '教师', value: '教师' }
]

async function loadMember() {
  const id = route.params.id
  if (!id) return
  isEdit.value = true
  try {
    const member = await membersStore.fetchMember(id)
    formValue.value = {
      name: member.name,
      phone: member.phone || '',
      email: member.email || '',
      address: member.address || '',
      member_type: member.member_type || '普通',
      join_date: member.join_date ? new Date(member.join_date).getTime() : Date.now()
    }
  } catch (err) {
    message.error('加载读者信息失败')
    router.push('/members')
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitting.value = true

    const data = {
      ...formValue.value,
      join_date: formValue.value.join_date
        ? new Date(formValue.value.join_date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
    }

    if (isEdit.value) {
      await membersStore.updateMember(route.params.id, data)
      message.success('更新成功')
    } else {
      await membersStore.createMember(data)
      message.success('添加成功')
    }
    router.push('/members')
  } catch (err) {
    if (err.message) message.error(err.message)
  } finally {
    submitting.value = false
  }
}

onMounted(loadMember)
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2>{{ isEdit ? '✏️ 编辑读者' : '➕ 新增读者' }}</h2>
      <n-button @click="router.push('/members')">返回列表</n-button>
    </div>

    <n-card class="form-card" style="border-radius: 12px">
      <n-form ref="formRef" :model="formValue" :rules="rules" label-placement="left" label-width="80">
        <n-grid :cols="2" :x-gap="24">
          <n-grid-item>
            <n-form-item label="姓名" path="name">
              <n-input v-model:value="formValue.name" placeholder="请输入姓名" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="电话">
              <n-input v-model:value="formValue.phone" placeholder="请输入电话" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="邮箱">
              <n-input v-model:value="formValue.email" placeholder="请输入邮箱" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="读者类型">
              <n-select v-model:value="formValue.member_type" :options="typeOptions" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="注册日期">
              <n-date-picker v-model:value="formValue.join_date" type="date" style="width: 100%" />
            </n-form-item>
          </n-grid-item>
        </n-grid>
        <n-form-item label="地址">
          <n-input v-model:value="formValue.address" type="textarea" :rows="2" placeholder="请输入地址" />
        </n-form-item>
        <n-form-item>
          <n-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ isEdit ? '保存修改' : '确认添加' }}
          </n-button>
          <n-button style="margin-left: 12px" @click="router.push('/members')">取消</n-button>
        </n-form-item>
      </n-form>
    </n-card>
  </div>
</template>
