<template>
  <n-space vertical>
    <n-form-item :label="t('settings.stampEnabled')">
      <n-switch :value="stamp.enabled" @update:value="(v) => update('enabled', v)" />
    </n-form-item>

    <template v-if="stamp.enabled">
      <n-form-item :label="t('settings.stampImage')">
        <n-button @click="pick">{{ t('settings.watermarkChooseImage') }}</n-button>
        <span v-if="stamp.imageDataUrl" style="margin-left: 8px; font-size: 12px">
          {{ t('settings.stampImageSelected') }}
        </span>
      </n-form-item>
      <n-form-item :label="t('settings.stampX')">
        <n-slider :value="stamp.x" :min="0" :max="1" :step="0.01" @update:value="(v) => update('x', v)" />
      </n-form-item>
      <n-form-item :label="t('settings.stampY')">
        <n-slider :value="stamp.y" :min="0" :max="1" :step="0.01" @update:value="(v) => update('y', v)" />
      </n-form-item>
      <n-form-item :label="t('settings.stampSize')">
        <n-slider
          :value="stamp.size"
          :min="0.05"
          :max="1"
          :step="0.01"
          @update:value="(v) => update('size', v)"
        />
      </n-form-item>
      <n-form-item :label="t('settings.stampRotation')">
        <n-slider
          :value="stamp.rotation"
          :min="-180"
          :max="180"
          :step="1"
          @update:value="(v) => update('rotation', v)"
        />
      </n-form-item>
      <n-form-item :label="t('settings.stampOpacity')">
        <n-slider
          :value="stamp.opacity"
          :min="0"
          :max="1"
          :step="0.01"
          @update:value="(v) => update('opacity', v)"
        />
      </n-form-item>
      <n-form-item :label="t('settings.stampPages')">
        <n-select
          :value="stamp.pages"
          :options="pageOptions"
          @update:value="(v) => update('pages', v as StampPages)"
        />
      </n-form-item>
      <n-form-item v-if="stamp.pages === 'custom'" :label="t('settings.stampCustomPages')">
        <n-input :value="customPagesText" @update:value="onCustomPages" :placeholder="'1,3,5'" />
      </n-form-item>
    </template>
  </n-space>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { NSpace, NFormItem, NSelect, NSlider, NSwitch, NInput, NButton } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useVModel } from '@vueuse/core'
import type { StampConfig, StampPages } from '@/utils/stamp/stamp'
import { pickImageDataUrl } from '@/utils/file/data-url'

const { t } = useI18n()

const props = defineProps<{
  stamp: StampConfig
}>()
const emit = defineEmits<{
  (e: 'update:stamp', value: StampConfig): void
}>()
const stamp = useVModel(props, 'stamp', emit)

const pageOptions = computed(() => [
  { label: t('settings.stampAll'), value: 'all' },
  { label: t('settings.stampFirst'), value: 'first' },
  { label: t('settings.stampLast'), value: 'last' },
  { label: t('settings.stampCustom'), value: 'custom' }
])

const customPagesText = computed(() => stamp.value.customPages.join(','))

function update<K extends keyof StampConfig>(key: K, value: StampConfig[K]) {
  stamp.value = { ...stamp.value, [key]: value }
}

function onCustomPages(text: string) {
  const nums = text
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0)
  update('customPages', nums)
}

async function pick() {
  const url = await pickImageDataUrl()
  if (url) update('imageDataUrl', url)
}
</script>
