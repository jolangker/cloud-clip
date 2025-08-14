<script setup lang='ts'>
import dayjs from 'dayjs';
import type { Message } from '~~/types/database.types';

const props = defineProps<{
  message: Message
}>()



const file = computedAsync(async() => {
  if (!props.message.url) return null
  const res = await $fetch<Blob>(props.message.url)
  

  return {
    type: res.type,
    url: URL.createObjectURL(res),
    raw: res
  }
})

const mime = computed(() => {
  if (props.message.content) return 'text/plain'
  if (!file.value) return 'text/plain'
  else return file.value.type
})

const source = computed(() => {
  return [
    new ClipboardItem({
      [mime.value]: props.message.content && !file.value ? new Blob([props.message.content], { type: mime.value }) : file.value!.raw
    })
  ]
})

const { copy, copied } = useClipboardItems({ source })
</script>

<template>
  <div class="p-4 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex flex-col gap-y-2">
    <div class="flex items-center justify-between">
      <u-button 
        :icon="copied ? 'i-tabler:copy-check' : 'i-tabler:copy'" 
        :label="copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'" 
        size="xs" 
        @click="() => copy()" />
      <span class="text-xs">{{ dayjs(message.created_at).format('dddd, D MMMM YYYY HH:mm:ss') }}</span>
    </div>
    <div class="text-lg">
      <div v-if="message.content" class="break-all">{{ message.content }}</div>
      <div v-else-if="file">
        <nuxt-img v-if="file.type.startsWith('image/')" :src="file.url" custom class="rounded-lg">
          <template #default="{ isLoaded, imgAttrs, src}">
            <img v-if="isLoaded" :src="src" v-bind="imgAttrs">
            <img v-else src="https://placehold.co/400x400" alt="placeholder">
          </template>
          </nuxt-img>
        <span v-else>{{ message.url }}</span>
      </div>
    </div>
  </div>
</template>