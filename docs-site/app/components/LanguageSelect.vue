<script setup lang="ts">
type LocaleOption = {
  code: string;
  name?: string;
};

const { t, locale, locales, setLocale } = useI18n();

const languageOptions = computed(() => {
  const allowed = new Set(["ja", "en"]);
  const labels: Record<string, string> = {
    en: "English",
    ja: "日本語",
  };

  return (locales.value as LocaleOption[])
    .filter((item) => allowed.has(item.code))
    .map((item) => ({
      code: item.code,
      name: labels[item.code] ?? item.name ?? item.code,
    }));
});

const currentLabel = computed(() => {
  const current = languageOptions.value.find((item) => item.code === locale.value);
  return current?.name ?? locale.value;
});

const compactLabel = computed(() =>
  locale.value === "ja" ? "JA" : locale.value === "en" ? "EN" : locale.value.toUpperCase(),
);

async function choose(code: string, close: () => void) {
  if (code !== locale.value) {
    await setLocale(code);
  }
  close();
}
</script>

<template>
  <HeaderDropdown
    :label="t('nav.language')"
    :trigger-text="currentLabel"
    :compact-text="compactLabel"
  >
    <template #default="{ close }">
      <button
        v-for="item in languageOptions"
        :key="item.code"
        type="button"
        class="option"
        role="option"
        :aria-selected="item.code === locale"
        :data-active="item.code === locale ? 'true' : 'false'"
        @click="choose(item.code, close)"
      >
        {{ item.name }}
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
