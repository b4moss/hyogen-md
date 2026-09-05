<script setup lang="ts">
type LocaleOption = {
  code: string;
  name?: string;
};

const { t, locale, locales, setLocale } = useI18n();
const colorMode = useColorMode();

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

const themeOptions = computed(() => [
  { value: "system", label: t("theme.system") },
  { value: "light", label: t("theme.light") },
  { value: "dark", label: t("theme.dark") },
]);

const currentLanguage = computed(() => {
  const current = languageOptions.value.find((item) => item.code === locale.value);
  return current?.name ?? locale.value;
});

const currentTheme = computed(
  () =>
    themeOptions.value.find((item) => item.value === colorMode.preference) ??
    themeOptions.value[0],
);

async function chooseLanguage(code: string, closeOuter: () => void) {
  if (code !== locale.value) {
    await setLocale(code);
  }
  closeOuter();
}

function chooseTheme(value: string, closeOuter: () => void) {
  colorMode.preference = value;
  closeOuter();
}
</script>

<template>
  <HeaderDropdown :label="t('nav.prefs')" icon-only>
    <template #trigger>
      <svg
        class="gear-icon"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.86 14.5a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.3.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.03-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"
        />
      </svg>
    </template>

    <template #default="{ close }">
      <div class="prefs-stack">
        <div class="section" role="group" :aria-label="t('nav.language')">
          <p class="section-label">{{ t("nav.language") }}</p>
          <HeaderDropdown
            nested
            :label="t('nav.language')"
            :trigger-text="currentLanguage"
          >
            <template #default="{ close: closeLang }">
              <button
                v-for="item in languageOptions"
                :key="item.code"
                type="button"
                class="option"
                role="option"
                :aria-selected="item.code === locale"
                :data-active="item.code === locale ? 'true' : 'false'"
                @click="
                  chooseLanguage(item.code, () => {
                    closeLang();
                    close();
                  })
                "
              >
                {{ item.name }}
              </button>
            </template>
          </HeaderDropdown>
        </div>

        <div class="section" role="group" :aria-label="t('theme.label')">
          <p class="section-label">{{ t("theme.label") }}</p>
          <HeaderDropdown
            nested
            :label="t('theme.label')"
            :trigger-text="currentTheme.label"
          >
            <template #default="{ close: closeTheme }">
              <button
                v-for="item in themeOptions"
                :key="item.value"
                type="button"
                class="option"
                role="option"
                :aria-selected="item.value === colorMode.preference"
                :data-active="item.value === colorMode.preference ? 'true' : 'false'"
                @click="
                  chooseTheme(item.value, () => {
                    closeTheme();
                    close();
                  })
                "
              >
                {{ item.label }}
              </button>
            </template>
          </HeaderDropdown>
        </div>
      </div>
    </template>
  </HeaderDropdown>
</template>

<style scoped>
.gear-icon {
  display: block;
}

.prefs-stack {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 12rem;
}

.section + .section {
  padding-top: 0.35rem;
  border-top: 1px solid var(--color-border);
}

.section-label {
  margin: 0;
  padding: 0.25rem 0.35rem 0.2rem;
  color: var(--color-muted);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

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
