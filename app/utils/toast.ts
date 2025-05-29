export const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const toast = useToast()

  const { id } = toast.add({
    title: message,
    color: type === 'success' ? 'success' : 'error',
    icon: type === 'success' ? 'i-tabler:circle-check' : 'i-tabler:circle-x',
    orientation: 'horizontal',
    onClick: () => toast.remove(id),
  })
}