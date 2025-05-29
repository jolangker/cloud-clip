export const useBucket = () => {
  const supabase = useSupabaseClient()

  const uploadFile = (filename: string, blob: Blob) => {
    return useAsyncData('upload-file', async() => {
      const path = createPath(filename)
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