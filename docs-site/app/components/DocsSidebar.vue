<script setup lang="ts">
type NavItem = {
  key: string;
  path: string;
  labelKey: string;
  parent?: string;
  label: string;
  to: string;
};

type NavGroup = {
  parent: NavItem;
  children: NavItem[];
};

const { items } = useDocsNav();
const { open, close } = useSidebar();
const { expandable, isOpen, toggle } = useDocsNavAccordion();
const route = useRoute();

watch(
  () => route.fullPath,
  () => {
    close();
  },
);

function isActive(item: { to: string }) {
  const current = route.path.replace(/\/+$/, "") || "/";
  const target = String(item.to).replace(/\/+$/, "") || "/";
  return current === target;
}

const groups = computed((): Array<NavItem | NavGroup> => {
  const list = items.value as NavItem[];
  const byKey = new Map(list.map((item) => [item.key, item]));
  const childrenByParent = new Map<string, NavItem[]>();
  const childKeys = new Set<string>();

  for (const item of list) {
    if (!item.parent) {
      continue;
    }
    const siblings = childrenByParent.get(item.parent) ?? [];
    siblings.push(item);
    childrenByParent.set(item.parent, siblings);
    childKeys.add(item.key);
  }

  const result: Array<NavItem | NavGroup> = [];
  for (const item of list) {
    if (childKeys.has(item.key)) {
      continue;
    }
    const children = childrenByParent.get(item.key);
    if (children?.length) {
      result.push({ parent: item, children });
      continue;
    }
    // Orphan child whose parent key is missing — render flat.
    if (item.parent && !byKey.has(item.parent)) {
      result.push(item);
      continue;
    }
    result.push(item);
  }
  return result;
});

function isGroup(entry: NavItem | NavGroup): entry is NavGroup {
  return "children" in entry;
}

function onToggle(parentKey: string, event: Event) {
  event.preventDefault();
  event.stopPropagation();
  toggle(parentKey);
}
</script>

<template>
  <aside class="sidebar" :class="{ open }" aria-label="Docs">
    <nav class="sidebar-nav">
      <template v-for="entry in groups" :key="isGroup(entry) ? entry.parent.key : entry.key">
        <template v-if="isGroup(entry)">
          <div class="sidebar-group" :data-open="isOpen(entry.parent.key) ? 'true' : 'false'">
            <div class="sidebar-parent">
              <NuxtLink
                :to="entry.parent.to"
                class="sidebar-link sidebar-link--parent"
                :class="{ 'router-link-exact-active': isActive(entry.parent) }"
                @click="close"
              >
                {{ entry.parent.label }}
              </NuxtLink>
              <button
                v-if="expandable"
                type="button"
                class="sidebar-toggle"
                :aria-expanded="isOpen(entry.parent.key)"
                :aria-controls="`nav-group-${entry.parent.key}`"
                :aria-label="entry.parent.label"
                @click="onToggle(entry.parent.key, $event)"
              >
                <span class="sidebar-chevron" aria-hidden="true" />
              </button>
            </div>
            <div
              v-show="!expandable || isOpen(entry.parent.key)"
              :id="`nav-group-${entry.parent.key}`"
              class="sidebar-children"
              role="group"
            >
              <NuxtLink
                v-for="child in entry.children"
                :key="child.key"
                :to="child.to"
                class="sidebar-link sidebar-link--child"
                :class="{ 'router-link-exact-active': isActive(child) }"
                @click="close"
              >
                {{ child.label }}
              </NuxtLink>
            </div>
          </div>
        </template>
        <NuxtLink
          v-else
          :to="entry.to"
          class="sidebar-link"
          :class="{ 'router-link-exact-active': isActive(entry) }"
          @click="close"
        >
          {{ entry.label }}
        </NuxtLink>
      </template>
    </nav>
  </aside>
  <button
    v-if="open"
    type="button"
    class="sidebar-backdrop"
    aria-label="Close menu"
    @click="close"
  />
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: var(--header-height);
  left: 0;
  bottom: 0;
  z-index: 20;
  width: var(--sidebar-width);
  padding: 1.25rem 1rem;
  background: color-mix(in srgb, var(--color-bg) 92%, var(--color-surface));
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
  transform: translateX(-100%);
  transition: transform 0.2s ease;
  /* Off-canvas menus can still intercept taps on iOS Safari unless disabled. */
  pointer-events: none;
  visibility: hidden;
}

.sidebar.open {
  transform: translateX(0);
  pointer-events: auto;
  visibility: visible;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.sidebar-group {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.sidebar-parent {
  display: flex;
  align-items: center;
  gap: 0.15rem;
}

.sidebar-link {
  display: block;
  padding: 0.45rem 0.7rem;
  border-radius: 0.35rem;
  color: var(--color-muted);
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 500;
}

.sidebar-link--parent {
  flex: 1;
  min-width: 0;
}

.sidebar-link:hover {
  color: var(--color-ink);
  background: var(--color-accent-soft);
}

.sidebar-link--child {
  padding-left: 1.35rem;
  font-size: 0.875rem;
  font-weight: 400;
}

.sidebar-link.router-link-exact-active {
  color: var(--color-accent);
  background: var(--color-accent-soft);
  font-weight: 600;
}

.sidebar-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.85rem;
  height: 1.85rem;
  border: 0;
  border-radius: 0.3rem;
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
  padding: 0;
}

.sidebar-toggle:hover {
  color: var(--color-ink);
  background: var(--color-accent-soft);
}

.sidebar-chevron {
  width: 0.4rem;
  height: 0.4rem;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: rotate(45deg);
  transition: transform 0.15s ease;
  opacity: 0.75;
}

.sidebar-group[data-open="true"] .sidebar-chevron {
  transform: translateY(1px) rotate(-135deg);
}

.sidebar-children {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.sidebar-backdrop {
  position: fixed;
  inset: var(--header-height) 0 0;
  z-index: 15;
  border: none;
  padding: 0;
  background: color-mix(in srgb, var(--color-ink) 35%, transparent);
  cursor: pointer;
}

@media (min-width: 900px) {
  .sidebar {
    position: sticky;
    top: var(--header-height);
    height: calc(100vh - var(--header-height));
    transform: none;
    flex-shrink: 0;
    pointer-events: auto;
    visibility: visible;
  }

  .sidebar-backdrop {
    display: none;
  }
}
</style>
