import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useMembersStore = defineStore('members', () => {
  const members = ref([])
  const total = ref(0)
  const loading = ref(false)

  async function fetchMembers({ page = 1, pageSize = 10, search = '' } = {}) {
    loading.value = true
    let query = supabase
      .from('members')
      .select('*', { count: 'exact' })

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    loading.value = false
    if (error) throw error
    members.value = data || []
    total.value = count || 0
    return { data, count }
  }

  async function fetchMember(id) {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  }

  async function createMember(member) {
    const { data, error } = await supabase
      .from('members')
      .insert(member)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function updateMember(id, member) {
    const { data, error } = await supabase
      .from('members')
      .update(member)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function deleteMember(id) {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id)
    if (error) throw error
  }

  return { members, total, loading, fetchMembers, fetchMember, createMember, updateMember, deleteMember }
})
