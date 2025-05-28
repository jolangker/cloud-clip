<script setup lang='ts'>
import type { Database, Message } from '~~/types/database.types'
import dayjs from 'dayjs'

const supabase = useSupabaseClient<Database>()

const { getMessages, createMessage } = useMessages()
const { copy } = useClipboard()

const { data: messages } = await getMessages()

const channel = supabase
  .channel('table_db_changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'messages'
    },
    (payload) => {
      console.log(payload)
      const newMessage = payload.new as Database['public']['Tables']['messages']['Row']
      if (messages.value) {
        messages.value = [...messages.value, newMessage]
      }
    }
  ).subscribe()

const state = reactive<Partial<Message>>({
  content: null,
  type: 'text'
})

const loading = ref(false)

const onSubmit = async () => {
  loading.value = true
  try {
    await createMessage(state)
    state.content = null
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleCopy = (text: string) => {
  copy(text)
  showToast('Copied!', 'success')
}

onUnmounted(channel.unsubscribe)
</script>

<template>
  <div class="flex flex-col min-h-[100dvh] relative pb-32">
    <div class="flex-1 max-w-4xl mx-auto w-full p-4 flex flex-col gap-y-4">
      <div v-for="message in messages ?? []" :key="message.id" class="p-4 rounded-xl bg-neutral-800 cursor-pointer" @click="handleCopy(message.content || '')">
        <div class="text-[10px]">{{ dayjs(message.created_at).format('dddd, D MMMM YYYY HH:mm:ss') }}</div>
        <div class="text-lg">{{ message.content }}</div>
      </div>
    </div>
    <div class="bg-neutral-800 pt-6 px-4 pb-8 rounded-t-lg fixed w-full bottom-0">
      <div>
        <u-form :state :disabled="loading" @submit="onSubmit">
          <div class="flex items-center gap-2">
            <u-form-field class="flex-1">
              <u-input v-model="state.content" class="w-full" size="xl" placeholder="Type your message..." />
            </u-form-field>
            <u-button icon="i-tabler:send-2" type="submit" size="xl" :loading />
          </div>
        </u-form>
      </div>
    </div>
  </div>
</template>