<script setup lang="ts">
const route = useRoute();
definePageMeta({ layout: 'library' })
</script>

<template>
  <div>
    <h1>{{ route.name }}</h1>
  </div>
</template>