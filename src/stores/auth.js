import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)

  async function login(email, password) {
    loading.value = true
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    loading.value = false
    if (error) throw error
    user.value = data.user
    return data
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
  }

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user || null
    return user.value
  }

  return { user, loading, login, logout, checkSession }
})
