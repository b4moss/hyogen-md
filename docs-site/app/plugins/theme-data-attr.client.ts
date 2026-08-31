/**
 * Bridge @nuxtjs/color-mode (html.dark) to playground CSS (html[data-theme]).
 */
export default defineNuxtPlugin(() => {
  const colorMode = useColorMode()

  const sync = () => {
    const value = colorMode.value === 'dark' ? 'dark' : 'light'
    document.documentElement.dataset.theme = value
  }

  sync()
  watch(() => colorMode.value, sync, { immediate: true })
})
