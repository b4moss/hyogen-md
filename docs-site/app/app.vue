<script setup lang="ts">
const config = useRuntimeConfig();

const siteName = computed(() => String(config.public.siteName || "Doc Site"));

useHead({
  titleTemplate: (title) =>
    title ? `${title} :: ${siteName.value}` : siteName.value,
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
