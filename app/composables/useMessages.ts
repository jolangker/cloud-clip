import type { Database, Message } from "~~/types/database.types"

export const useMessages = () => {
  const supabase = useSupabaseClient<Database>()

  const getMessages = () => {
    return useAsyncData('get-messages',async () => {
      const { data } = await supabase.from('messages').select('*')
      return data || []
    })
  }

  const createMessage = (payload: Partial<Message>) => {
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