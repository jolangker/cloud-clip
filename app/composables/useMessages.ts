import type { Database } from "~~/types/database.types"

export const useMessages = () => {
  const supabase = useSupabaseClient<Database>()

  const getMessages = (slug: string) => {
    return useAsyncData(`get-messages-${slug}`, async () => {
      const { data } = await supabase.from('messages').select('*').eq('slug', slug).order('created_at', { ascending: false })
      return data || []
    })
  }

  const createMessage = (payload: Partial<Database['public']['Tables']['messages']['Row']>) => {
    return useAsyncData('create-message', async () => {
      const { data } = await supabase.from('messages').insert(payload).select().single()
      return data
    })
  }

  return {
    getMessages,
    createMessage
  }
}