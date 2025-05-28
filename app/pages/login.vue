<script setup lang='ts'>
import { z } from 'zod'

const supabase = useSupabaseClient()

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  email: '',
  password: ''
})

const loading = ref(false)

const signIn = async () => {
  loading.value = true
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: state.email,
      password: state.password
    })

    if (error) throw error

    showToast('Sign-in successful!', 'success')
    navigateTo('/')
  } catch (error) {
    console.error('Sign-in error:', error)
    showToast(error.message || 'An error occurred during sign-in.', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 min-h-[100dvh] p-4">
    <u-form :state :schema class="flex flex-col gap-4" :disabled="loading" @submit="signIn">
      <u-form-field label="Email" name="email">
        <u-input v-model="state.email" type="email" class="w-full" />
      </u-form-field>
      <u-form-field label="Password" name="password">
        <u-input v-model="state.password" type="password" class="w-full" />
      </u-form-field>
      <u-button label="Sign In" type="submit" block :loading />
    </u-form>
  </div>
</template>