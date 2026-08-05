<template>
  <n-dropdown
    :options="options"
    :value="currentCode"
    trigger="click"
    placement="bottom-end"
    class="lang-dropdown"
    @select="onSelect"
  >
    <n-button quaternary size="small" class="lang-trigger">
      <template #icon>
        <span class="lang-globe" aria-hidden="true">🌐</span>
      </template>
      <span class="lang-label">{{ currentLabel }}</span>
    </n-button>
  </n-dropdown>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NDropdown, NButton } from 'naive-ui'
import { SUPPORTED_LOCALES, persistLocale } from '@/locale/config'

const { locale } = useI18n()

const options = computed(() =>
  SUPPORTED_LOCALES.map((l) => ({
    label: l.label,
    key: l.code
  }))
)

const currentMeta = computed(
  () => SUPPORTED_LOCALES.find((l) => l.code === locale.value) ?? SUPPORTED_LOCALES[1]
)

const currentCode = computed(() => currentMeta.value.code)
const currentLabel = computed(() => currentMeta.value.label)

function onSelect(code: string) {
  locale.value = code
  persistLocale(code)
  if (typeof document !== 'undefined') document.documentElement.lang = code
}
</script>

<style scoped>
.lang-trigger {
  font-weight: 600;
  color: var(--n-text-color) !important;
  background: rgba(128, 128, 128, 0.22) !important;
  border: 1px solid rgba(128, 128, 128, 0.35) !important;
  border-radius: 999px !important;
  padding: 0 12px !important;
  height: 34px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18) !important;
  backdrop-filter: blur(6px);
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
}
.lang-trigger:hover {
  background: rgba(128, 128, 128, 0.35) !important;
  border-color: rgba(128, 128, 128, 0.55) !important;
  transform: translateY(-1px);
}
.lang-globe {
  font-size: 16px;
  line-height: 1;
  margin-right: 2px;
}
.lang-label {
  font-size: 14px;
}
</style>
