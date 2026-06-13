import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useBorrowingsStore = defineStore('borrowings', () => {
  const borrowings = ref([])
  const total = ref(0)
  const loading = ref(false)

  async function fetchBorrowings({ page = 1, pageSize = 10, search = '', status = '' } = {}) {
    loading.value = true

    // 前台自动标记逾期：先更新 overdue 状态
    const today = new Date().toISOString().split('T')[0]
    await supabase
      .from('borrowings')
      .update({ status: 'overdue' })
      .eq('status', 'borrowed')
      .lt('due_date', today)

    let query = supabase
      .from('borrowings')
      .select('*, books(title, author, isbn), members(name, phone)', { count: 'exact' })

    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`books(title).ilike.%${search}%,members(name).ilike.%${search}%`)
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    loading.value = false
    if (error) throw error
    borrowings.value = data || []
    total.value = count || 0
    return { data, count }
  }

  async function createBorrowing(borrowing) {
    const { data, error } = await supabase.rpc('borrow_book', {
      p_book_id: borrowing.book_id,
      p_member_id: borrowing.member_id,
      p_borrow_date: borrowing.borrow_date,
      p_due_date: borrowing.due_date
    })
    if (error) throw error
    return data
  }

  async function returnBook(borrowingId) {
    const { error } = await supabase.rpc('return_book', {
      p_borrowing_id: borrowingId
    })
    if (error) throw error
  }

  async function deleteBorrowing(id) {
    const { error } = await supabase
      .from('borrowings')
      .delete()
      .eq('id', id)
    if (error) throw error
  }

  return { borrowings, total, loading, fetchBorrowings, createBorrowing, returnBook, deleteBorrowing }
})
