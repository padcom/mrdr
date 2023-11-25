<template>
  <h2>{{ message }}</h2>
</template>

<script lang="ts" setup>
defineProps({
  message: { type: String, default: 'default hello message' },
})
</script>
