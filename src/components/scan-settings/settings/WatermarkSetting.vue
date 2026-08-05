<template>
  <n-space vertical>
    <n-form-item :label="t('settings.watermarkEnabled')">
      <n-switch :value="watermark.enabled" @update:value="(v) => update('enabled', v)" />
    </n-form-item>

    <template v-if="watermark.enabled">
      <n-form-item :label="t('settings.watermarkType')">
        <n-select
          :value="watermark.type"
          :options="typeOptions"
          @update:value="(v) => update('type', v as WatermarkType)"
        />
      </n-form-item>

      <n-form-item v-if="watermark.type === 'text'" :label="t('settings.watermarkText')">
        <n-input :value="watermark.text" @update:value="(v) => update('text', v)" />
      </n-form-item>
      <n-form-item v-else :label="t('settings.watermarkImage')">
        <n-button @click="pick">{{ t('settings.watermarkChooseImage') }}</n-button>
        <span v-if="watermark.imageDataUrl" style="margin-left: 8px; font-size: 12px">
          {{ t('settings.stampImageSelected') }}
        </span>
      </n-form-item>

      <n-form-item :label="t('settings.watermarkColor')">
        <n-color-picker :value="watermark.color" @update:value="(v) => update('color', v)" />
      </n-form-item>
      <n-form-item :label="t('settings.watermarkOpacity')">
        <n-slider
          :value="watermark.opacity"
          :min="0"
          :max="1"
          :step="0.01"
          @update:value="(v) => update('opacity', v)"
        />
      </n-form-item>
      <n-form-item :label="t('settings.watermarkRotation')">
        <n-slider
          :value="watermark.rotation"
          :min="-180"
          :max="180"
          :step="1"
          @update:value="(v) => update('rotation', v)"
        />
      </n-form-item>
      <n-form-item :label="t('settings.watermarkFontSize')">
        <n-slider
          :value="watermark.fontSize"
          :min="8"
          :max="200"
          :step="1"
          @update:value="(v) => update('fontSize', v)"
        />
      </n-form-item>
      <n-form-item :label="t('settings.watermarkScale')">
        <n-slider
          :value="watermark.scale"
          :min="0.1"
          :max="5"
          :step="0.1"
          @update:value="(v) => update('scale', v)"
        />
      </n-form-item>
      <n-form-item :label="t('settings.watermarkPosition')">
        <n-select
          :value="watermark.positionMode"
          :options="positionOptions"
          @update:value="(v) => update('positionMode', v as WatermarkPositionMode)"
        />
      </n-form-item>

      <template v-if="watermark.positionMode === 'single'">
        <n-form-item :label="t('settings.watermarkX')">
          <n-slider
            :value="watermark.positionX"
            :min="0"
            :max="1"
            :step="0.01"
            @update:value="(v) => update('positionX', v)"
          />
        </n-form-item>
        <n-form-item :label="t('settings.watermarkY')">
          <n-slider
            :value="watermark.positionY"
            :min="0"
            :max="1"
            :step="0.01"
            @update:value="(v) => update('positionY', v)"
          />
        </n-form-item>
      </template>
      <template v-else>
        <n-form-item :label="t('settings.watermarkGapX')">
          <n-slider
            :value="watermark.tileGapX"
            :min="20"
            :max="500"
            :step="10"
            @update:value="(v) => update('tileGapX', v)"
          />
        </n-form-item>
        <n-form-item :label="t('settings.watermarkGapY')">
          <n-slider
            :value="watermark.tileGapY"
            :min="20"
            :max="500"
            :step="10"
            @update:value="(v) => update('tileGapY', v)"
          />
        </n-form-item>
      </template>
    </template>
  </n-space>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { NSpace, NFormItem, NSelect, NSlider, NColorPicker, NSwitch, NInput, NButton } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useVModel } from '@vueuse/core'
import type { WatermarkConfig, WatermarkType, WatermarkPositionMode } from '@/utils/watermark/watermark'
import { pickImageDataUrl } from '@/utils/file/data-url'

const { t } = useI18n()

const props = defineProps<{
  watermark: WatermarkConfig
}>()
const emit = defineEmits<{
  (e: 'update:watermark', value: WatermarkConfig): void
}>()
const watermark = useVModel(props, 'watermark', emit)

const typeOptions = computed(() => [
  { label: t('settings.watermarkText'), value: 'text' },
  { label: t('settings.watermarkImage'), value: 'image' }
])
const positionOptions = computed(() => [
  { label: t('settings.watermarkSingle'), value: 'single' },
  { label: t('settings.watermarkTiled'), value: 'tiled' }
])

function update<K extends keyof WatermarkConfig>(key: K, value: WatermarkConfig[K]) {
  watermark.value = { ...watermark.value, [key]: value }
}

async function pick() {
  const url = await pickImageDataUrl()
  if (url) update('imageDataUrl', url)
}
</script>
