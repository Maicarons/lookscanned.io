<template>
  <n-config-provider :theme="theme" :locale="naiveLocale">
    <n-global-style />
    <n-message-provider>
      <div class="language-switcher-shell">
        <LanguageSwitcher />
      </div>
      <main class="view"><RouterView :key="route.fullPath" /></main>
      <ServieWorkerReloadPrompt />
    </n-message-provider>
  </n-config-provider>
</template>

<script lang="ts" setup>
import { useOsTheme, darkTheme, NConfigProvider, NGlobalStyle, NMessageProvider } from 'naive-ui'
import { RouterView } from 'vue-router'
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import i18n, { naiveLocaleMap } from '@/locale'
import ServieWorkerReloadPrompt from '@/components/Misc/ServiceWorkerReloadPrompt.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const route = useRoute()

const osThemeRef = useOsTheme()
const theme = computed(() => (osThemeRef.value === 'dark' ? darkTheme : null))

// 跟随当前 i18n 语言同步 naive-ui 组件语言包
const naiveLocale = computed(() => naiveLocaleMap[i18n.global.locale.value] ?? naiveLocaleMap.en)

// 同步 <html lang>，便于可访问性与 SEO
watch(
  () => i18n.global.locale.value,
  (val) => {
    if (typeof document !== 'undefined') document.documentElement.lang = val
  },
  { immediate: true }
)
</script>

<style>
.language-switcher-shell {
  position: fixed;
  top: 14px;
  right: 16px;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  pointer-events: none; /* 让下方内容可点击，按钮本身恢复 pointer-events */
}
.language-switcher-shell > * {
  pointer-events: auto;
}
</style>
