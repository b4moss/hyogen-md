import { docsNavAccordion } from "~/config/docsNav";

const STORAGE_KEY = "docs-nav-accordion";

type OpenMap = Record<string, boolean>;

function readStored(): OpenMap {
  if (!import.meta.client) {
    return {};
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const result: OpenMap = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === "boolean") {
        result[key] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

function writeStored(map: OpenMap) {
  if (!import.meta.client || !docsNavAccordion.persist) {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota / private mode failures
  }
}

export function useDocsNavAccordion() {
  const openMap = useState<OpenMap>("docs-nav-accordion-open", () => ({}));

  onMounted(() => {
    if (!docsNavAccordion.persist) {
      return;
    }
    openMap.value = readStored();
  });

  function isOpen(parentKey: string) {
    if (!docsNavAccordion.expandable) {
      return true;
    }
    if (docsNavAccordion.persist && parentKey in openMap.value) {
      return openMap.value[parentKey];
    }
    return docsNavAccordion.defaultOpen;
  }

  function setOpen(parentKey: string, next: boolean) {
    if (!docsNavAccordion.expandable) {
      return;
    }
    openMap.value = { ...openMap.value, [parentKey]: next };
    if (docsNavAccordion.persist) {
      writeStored(openMap.value);
    }
  }

  function toggle(parentKey: string) {
    setOpen(parentKey, !isOpen(parentKey));
  }

  return {
    expandable: docsNavAccordion.expandable,
    isOpen,
    setOpen,
    toggle,
  };
}
