<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <router-view />
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { NConfigProvider, NMessageProvider, NDialogProvider, zhCN, dateZhCN } from 'naive-ui'

const themeOverrides = {
  common: {
    primaryColor: '#4a6fa5',
    primaryColorHover: '#5b82b8',
    primaryColorPressed: '#3c5c8a',
    primaryColorSuppl: '#4a6fa5',
    infoColor: '#4a6fa5',
    infoColorHover: '#5b82b8',
    successColor: '#3d7a4f',
    warningColor: '#c57814',
    errorColor: '#b53b3b',
    errorColorHover: '#c44a4a',
    borderRadius: '6px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif'
  },
  Button: {
    borderRadiusMedium: '6px'
  },
  Card: {
    borderRadius: '8px'
  },
  DataTable: {
    borderRadius: '8px',
    thColor: '#faf8f3',
    tdColor: '#ffffff'
  },
  Tag: {
    borderRadius: '4px'
  }
}
</script>
