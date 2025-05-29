import { v4 as uuidv4 } from 'uuid'

export const useBucket = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const uploadFile = (blob: Blob) => {
    return useAsyncData('upload-file', async() => {
      const path = `${user.value?.id}/images/${uuidv4()}`
      const { data } = await supabase.storage.from('clip-attachments').upload(path, blob, {
        contentType: blob.type
      })
      return data
    })
  }

  const getPublicUrl = (path: string) => {
    return useAsyncData(`get-public-url-${path}`, async () => {
      const { data } = supabase.storage.from('clip-attachments').getPublicUrl(path)
      return data.publicUrl
    })
  }

  return {
    uploadFile,
    getPublicUrl
  }
}