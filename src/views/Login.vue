<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NForm, NFormItem, NInput, NButton } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const message = useMessage()

const isRegister = ref(false)
const formRef = ref(null)
const formValue = ref({ email: '', password: '', confirmPassword: '' })
const submitting = ref(false)

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (_, value) => value === formValue.value.password,
      message: '两次密码不一致',
      trigger: 'blur'
    }
  ]
}

function toggleMode() {
  isRegister.value = !isRegister.value
  formValue.value = { email: '', password: '', confirmPassword: '' }
}

function switchToLogin() {
  isRegister.value = false
  formValue.value = { email: '', password: '', confirmPassword: '' }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitting.value = true

    const email = formValue.value.email.trim()
    const password = formValue.value.password

    if (isRegister.value) {
      const data = await auth.register(email, password)
      if (data.user?.identities?.length === 0) {
        message.warning('该邮箱已注册，请直接登录')
        switchToLogin()
      } else {
        auth.user = data.user
        message.success('注册成功')
        router.push('/')
      }
    } else {
      await auth.login(email, password)
      message.success('登录成功')
      router.push('/')
    }
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
        <p>{{ isRegister ? '创建管理员账号' : '登录以继续管理您的图书馆' }}</p>
      </div>

      <n-form
        ref="formRef"
        :model="formValue"
        :rules="isRegister ? rules : { email: rules.email, password: rules.password }"
        label-placement="top"
      >
        <n-form-item label="邮箱" path="email">
          <n-input
            v-model:value="formValue.email"
            placeholder="请输入邮箱"
            size="large"
          />
        </n-form-item>

        <n-form-item label="密码" path="password">
          <n-input
            v-model:value="formValue.password"
            type="password"
            placeholder="请输入密码"
            size="large"
          />
        </n-form-item>

        <n-form-item v-if="isRegister" label="确认密码" path="confirmPassword">
          <n-input
            v-model:value="formValue.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            size="large"
          />
        </n-form-item>
      </n-form>

      <n-button
        type="primary"
        block
        size="large"
        :loading="submitting"
        @click="handleSubmit"
        style="margin-top: 8px"
      >
        {{ isRegister ? '注册' : '登录' }}
      </n-button>

      <div class="login-toggle">
        <a @click.prevent="toggleMode">
          {{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}
        </a>
      </div>

      <div class="login-footer">
        {{ isRegister ? '注册后需在 Supabase Dashboard 中确认用户' : '请先在 Supabase Dashboard 中创建管理员账号' }}
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

.login-toggle {
  margin-top: 16px;
  text-align: center;
}

.login-toggle a {
  font-size: 13px;
  color: var(--accent);
  cursor: pointer;
  user-select: none;
}

.login-toggle a:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}

.login-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .login-page {
    align-items: flex-start;
    padding: 0;
  }

  .login-card {
    width: 100%;
    min-height: 100vh;
    border-radius: 0;
    border: none;
    box-shadow: none;
    padding: 60px 24px 32px;
  }
}
</style>
