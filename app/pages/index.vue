<script setup lang='ts'>
import type { Database, Message } from '~~/types/database.types'
const supabase = useSupabaseClient<Database>()

const { getMessages, createMessage } = useMessages()
const { uploadFile, getPublicUrl } = useBucket()

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
      const newMessage = payload.new as Database['public']['Tables']['messages']['Row']
      if (messages.value) {
        messages.value = [...messages.value, newMessage]
      }
    }
  ).subscribe()

const state = reactive<Partial<Message>>({
  content: null,
  url: null,
  type: 'text'
})

const loading = ref(false)

const onSubmit = async () => {
  if (!state.content) {
    showToast('Input cannot be empty', 'error')
    return
  }
  state.url = null
  state.type = 'text'
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

const inputFile = ref()
const filePath = ref('')
const isDrawerOpen = ref(false)
const selectedFile = ref<File>()

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length) {
    selectedFile.value = input.files[0]
    isDrawerOpen.value = true
  }
}

const selectedFileUrl = computed(() => {
  if (!selectedFile.value) return null
  return URL.createObjectURL(selectedFile.value)
})

const handleCloseDrawer = () => {
  filePath.value = ''
  selectedFile.value = undefined
}

const handleUpload = async () => {
  loading.value = true
  try {
    const convertedImage = await convertImage(selectedFile.value!)
    const { data, error } = await uploadFile(convertedImage)
    if (!data.value || error.value) throw error.value

    const { data: url, error: errorUrl } = await getPublicUrl(data.value.path)
    if (!url.value || errorUrl.value) throw error.value

    state.url = url.value
    state.type = 'file'
    state.content = null

    await createMessage(state)

    state.url = null
    selectedFile.value = undefined
    isDrawerOpen.value = false
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handlePaste = (e: ClipboardEvent) => {
  const items = e.clipboardData?.items
  if (!items) return

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          selectedFile.value = file
          isDrawerOpen.value = true
        }
      }
    }
  }
}

onUnmounted(channel.unsubscribe)
</script>

<template>
  <div class="flex flex-col min-h-[100dvh] relative pb-32">
    <div class="flex-1 max-w-4xl mx-auto w-full p-4 flex flex-col gap-y-4">
      <template v-for="message in messages ?? []" :key="message.id">
       <clip-unit :message />
      </template>
    </div>
    <div class="bg-neutral-800 pt-6 px-4 pb-8 rounded-t-lg fixed w-full bottom-0">
      <div>
        <u-form :state :disabled="loading" @submit="onSubmit">
          <div class="flex items-center gap-2">
            <u-button icon="i-tabler:plus" variant="outline" color="neutral" size="xl" :loading @click="inputFile.inputRef.click()" />
            <u-form-field class="flex-1">
              <u-input 
                v-model="state.content" 
                class="w-full" 
                size="xl"
                placeholder="Type your message..." 
                @paste="handlePaste"
              />
            </u-form-field>
            <u-button icon="i-tabler:send-2" type="submit" size="xl" :loading />
          </div>
        </u-form>
      </div>
    </div>
    <u-input 
      ref="inputFile" 
      v-model="filePath" 
      type="file" 
      accept="image/*" 
      class="absolute hidden"
      @change="handleFileChange" 
    />
    <u-drawer v-model:open="isDrawerOpen" @close="handleCloseDrawer">
      <template #content>
        <div class="max-w-4xl mx-auto p-4 flex flex-col gap-y-2 overflow-auto">
          <nuxt-img v-if="selectedFileUrl" :src="selectedFileUrl" />
          <u-button label="Upload" icon="i-tabler:send-2" size="xl" block :loading @click="handleUpload" />
        </div>
      </template>
    </u-drawer>
  </div>
</template>