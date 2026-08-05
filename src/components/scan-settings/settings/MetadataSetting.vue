<template>
  <n-space vertical>
    <n-form-item :label="t('settings.metadataTitle')">
      <n-input :value="metadata.title" @update:value="(v) => update('title', v)" />
    </n-form-item>
    <n-form-item :label="t('settings.metadataAuthor')">
      <n-input :value="metadata.author" @update:value="(v) => update('author', v)" />
    </n-form-item>
    <n-form-item :label="t('settings.metadataSubject')">
      <n-input :value="metadata.subject" @update:value="(v) => update('subject', v)" />
    </n-form-item>
    <n-form-item :label="t('settings.metadataCreator')">
      <n-input :value="metadata.creator" @update:value="(v) => update('creator', v)" />
    </n-form-item>
    <n-form-item :label="t('settings.metadataProducer')">
      <n-input :value="metadata.producer" @update:value="(v) => update('producer', v)" />
    </n-form-item>
    <n-form-item :label="t('settings.metadataKeywords')">
      <n-input :value="metadata.keywords" @update:value="(v) => update('keywords', v)" />
    </n-form-item>
  </n-space>
</template>

<script lang="ts" setup>
import { NSpace, NFormItem, NInput } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useVModel } from '@vueuse/core'
import type { MetadataConfig } from '@/utils/pdf-metadata/metadata'

const { t } = useI18n()

const props = defineProps<{
  metadata: MetadataConfig
}>()
const emit = defineEmits<{
  (e: 'update:metadata', value: MetadataConfig): void
}>()
const metadata = useVModel(props, 'metadata', emit)

function update<K extends keyof MetadataConfig>(key: K, value: MetadataConfig[K]) {
  metadata.value = { ...metadata.value, [key]: value }
}
</script>
