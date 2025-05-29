export const useBucket = () => {
  const supabase = useSupabaseClient()

  const uploadFile = (file: File) => {
    return useAsyncData('upload-file', async() => {
      const path = createPath(file.name)
      const { data } = await supabase.storage.from('clip-attachments').upload(path, file, {
        contentType: file.type
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