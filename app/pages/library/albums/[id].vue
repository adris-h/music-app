<script setup lang="ts">
import {getColorHash} from "~/composables/getColorHash";

definePageMeta({ layout: 'library' })
const route = useRoute()
const { data: album, error: albumError } = await useAlbum(() => route.params.id as string)
const { data: tracks, pending, error } = await useAlbumTracks(() => album.value?.mbid)

import { ref, onMounted } from 'vue';

const colorHash = ref<Record<string, number>>({});

onMounted(async () => {
  colorHash.value = await getColorHash(album.value?.cover_url || '');
  console.log('Processed colors:', colorHash.value);
});

watch(tracks, (newTracks) => {
  if (album.value && newTracks) {
    album.value.tracks = newTracks
  }
})
</script>

<template>
  <div class="w-full h-full px-8 pb-8 flex items-center justify-center">
    <div class="w-full h-full flex flex-col gap-4">
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
      <p class="text-4" v-else-if="albumError">Album not found.</p>
      <p v-if="!album.mbid" class="text-sm opacity-60">No tracklist source linked yet.</p>
      <p v-else-if="pending">Loading tracks…</p>
      <p v-else-if="error">Couldn't load tracklist.</p>
      <p v-else-if="!tracks?.length">Tracklist not available.</p>
      <ol v-else>
        <li v-for="t in album.tracks" :key="t.position" class="flex justify-between h-8">
          <div class="flex items-center gap-4">
            <span class="w-4 text-center text-primary" >{{ t.position }}</span>
            <span>{{ t.title }}</span>
          </div>

          <span v-if="t.duration_ms">
          {{ Math.floor(t.duration_ms / 60000) }}:{{ String(Math.round((t.duration_ms % 60000) / 1000)).padStart(2, '0') }}
        </span>
        </li>
      </ol>

    </div>
  </div>
</template>