<script setup lang="ts">
definePageMeta({ layout: 'library' })
const route = useRoute()
const { data: album, error } = await useAlbum(() => route.params.id as string)
</script>

<template>
  <div class="w-full h-full px-8 pb-8 flex items-center justify-center">
    <div class="w-full h-full flex gap-4">
      <div v-if="album" class="flex gap-10 h-1/2 items-center justify-start">
        <div class=" h-70 aspect-square bg-cover" :style="{ backgroundImage: album.cover_url ? `url(${album.cover_url})` : '' }"></div>
        <div class="flex flex-col justify-center">
          <NuxtLink
              v-if="album.artist?.mbid"
              @click.stop
              :to="`../artists/${album.artist.id}`"
              class="hover:underline text-lg"
          >
            {{ album.artist.name }}
          </NuxtLink>
          <h1 class="text-2xl font-bold">{{ album.title }}</h1>
          <p class="text-[.8rem]">{{ album.release_date.split('-')[0] }}</p>
        </div>
      </div>
      <p class="text-4" v-else-if="error">Album not found.</p>
    </div>
  </div>
</template>