<template>
  <n-space vertical>
    <n-form-item :label="t('settings.paperSize')">
      <n-select
        :value="paper.size"
        :options="paperSizeOptions"
        @update:value="(v) => update('size', v as PaperPresetId)"
      />
    </n-form-item>
    <n-form-item :label="t('settings.paperMargin')">
      <n-slider
        :value="paper.margin"
        :min="0"
        :max="2"
        :step="0.05"
        @update:value="(v) => update('margin', v)"
      />
    </n-form-item>
    <n-form-item :label="t('settings.paperColor')">
      <n-color-picker
        :value="paper.paperColor"
        @update:value="(v) => update('paperColor', v)"
      />
    </n-form-item>
  </n-space>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { NFormItem, NSpace, NSelect, NSlider, NColorPicker } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useVModel } from '@vueuse/core'
import type { PaperConfig, PaperPresetId } from '@/utils/paper/paper'
import { paperSizes } from '@/utils/paper/paper'

const { t } = useI18n()

const props = defineProps<{
  paper: PaperConfig
}>()
const emit = defineEmits<{
  (e: 'update:paper', value: PaperConfig): void
}>()
const paper = useVModel(props, 'paper', emit)

const paperSizeOptions = computed(() =>
  (Object.keys(paperSizes) as Array<keyof typeof paperSizes>).map((id) => ({
    label: paperSizes[id].name,
    value: id
  }))
)

function update<K extends keyof PaperConfig>(key: K, value: PaperConfig[K]) {
  paper.value = { ...paper.value, [key]: value }
}
</script>
