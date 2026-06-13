import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useBooksStore = defineStore('books', () => {
  const books = ref([])
  const total = ref(0)
  const loading = ref(false)

  async function fetchBooks({ page = 1, pageSize = 10, search = '', categoryId = null } = {}) {
    loading.value = true
    let query = supabase
      .from('books')
      .select('*, categories(name)', { count: 'exact' })

    if (search) {
      query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,isbn.ilike.%${search}%`)
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    loading.value = false
    if (error) throw error
    books.value = data || []
    total.value = count || 0
    return { data, count }
  }

  async function fetchBook(id) {
    const { data, error } = await supabase
      .from('books')
      .select('*, categories(name)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  }

  async function createBook(book) {
    const { data, error } = await supabase
      .from('books')
      .insert({ ...book, available: book.stock })
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function updateBook(id, book) {
    const { data, error } = await supabase
      .from('books')
      .update({ ...book, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function updateBookStock(id, newStock) {
    const { error } = await supabase.rpc('update_book_stock', {
      p_book_id: id,
      p_new_stock: newStock
    })
    if (error) throw error
  }

  async function deleteBook(id) {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id)
    if (error) throw error
  }

  return { books, total, loading, fetchBooks, fetchBook, createBook, updateBook, updateBookStock, deleteBook }
})
