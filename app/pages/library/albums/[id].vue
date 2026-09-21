<script setup lang="ts">
definePageMeta({ layout: 'library' })
const route = useRoute()
const { data: album, error } = await useAlbum(() => route.params.id as string)
</script>

<template>
  <div class="w-full h-full px-8 pb-8 flex items-center justify-center">
    <div class="w-full h-full grid grid-cols-2 gap-4">
      <div v-if="album">
        <div class="flex flex-col w-md h-96 bg-template">
          <img v-if="album.cover_url" :src="album.cover_url" :alt="album.title" />
          <div v-else>No cover yet</div>
        </div>

        <h1>{{ album.title }}</h1>
        <p>{{ album.artist.name }} </p>
       <p>{{ album.release_date }}</p>
      </div>
      <p v-else-if="error">Album not found.</p>
    </div>
  </div>
</template>