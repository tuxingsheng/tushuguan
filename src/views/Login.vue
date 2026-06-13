<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NForm, NFormItem, NInput, NButton } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const message = useMessage()

const formRef = ref(null)
const formValue = ref({ email: '', password: '' })
const submitting = ref(false)

const rules = {
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  try {
    await formRef.value?.validate()
    submitting.value = true
    await auth.login(formValue.value.email, formValue.value.password)
    message.success('登录成功')
    router.push('/')
  } catch (err) {
    if (err.message) message.error(err.message)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="login-icon">📚</div>
        <h1>图书管理系统</h1>
        <p>登录以继续管理您的图书馆</p>
      </div>

      <n-form ref="formRef" :model="formValue" :rules="rules" label-placement="left" label-width="56">
        <n-form-item label="邮箱" path="email">
          <n-input v-model:value="formValue.email" placeholder="请输入管理员邮箱" size="large" />
        </n-form-item>
        <n-form-item label="密码" path="password">
          <n-input v-model:value="formValue.password" type="password" placeholder="请输入密码" size="large" @keyup.enter="handleLogin" />
        </n-form-item>
      </n-form>

      <n-button type="primary" block size="large" :loading="submitting" @click="handleLogin" style="margin-top: 8px">
        登录
      </n-button>

      <div class="login-footer">
        请先在 Supabase Dashboard 中创建管理员账号
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(165deg, #e8ecf1 0%, #dce1e7 50%, #faf6ef 100%);
}

.login-card {
  width: 400px;
  padding: 40px 36px 32px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border);
}

.login-header {
  text-align: center;
  margin-bottom: 28px;
}

.login-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.login-header h1 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
  letter-spacing: 0.03em;
}

.login-header p {
  font-size: 13px;
  color: var(--text-muted);
}

.login-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
