<script setup lang="ts">
const { t } = useI18n();
const colorMode = useColorMode();

const options = computed(() => [
  { value: "system", label: t("theme.system"), compact: "Sys" },
  { value: "light", label: t("theme.light"), compact: "Lt" },
  { value: "dark", label: t("theme.dark"), compact: "Dk" },
]);

const current = computed(
  () =>
    options.value.find((item) => item.value === colorMode.preference) ??
    options.value[0],
);

function choose(value: string, close: () => void) {
  colorMode.preference = value;
  close();
}
</script>

<template>
  <HeaderDropdown
    :label="t('theme.label')"
    :trigger-text="current.label"
    :compact-text="current.compact"
  >
    <template #default="{ close }">
      <button
        v-for="item in options"
        :key="item.value"
        type="button"
        class="option"
        role="option"
        :aria-selected="item.value === colorMode.preference"
        :data-active="item.value === colorMode.preference ? 'true' : 'false'"
        @click="choose(item.value, close)"
      >
        {{ item.label }}
      </button>
    </template>
  </HeaderDropdown>
</template>

<style scoped>
.option {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 2.1rem;
  padding: 0.4rem 0.65rem;
  border: 0;
  border-radius: 0.3rem;
  background: transparent;
  color: var(--color-ink);
  font: inherit;
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
}

.option:hover {
  background: var(--color-accent-soft);
}

.option[data-active="true"] {
  color: var(--color-accent);
  font-weight: 600;
}

@media (max-width: 640px) {
  .option {
    min-height: 2.4rem;
    font-size: 0.95rem;
  }
}
</style>
