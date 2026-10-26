<script setup lang="ts">
  definePageMeta({ layout: 'library' })
  import {trimText} from "~/composables/useTrimText.ts";

  const { data: albums, pending: albumPending } = await useAlbums()
  let isArtistLoading = computed(() => albumPending.value)

  console.log("album pending" + isArtistLoading.value)


  const mouseX = ref(0);
  const mouseY = ref(0);
  const offset = ref(0);

  function updateMouse(e: MouseEvent) {
    mouseX.value = e.clientX;
    mouseY.value = e.clientY;

  }

  const hoveringOverAlbum = ref(false);
  const hoveredAlbumId = ref(0);
  const albumTitleTrimmed = ref(true);

  onMounted(() => {
    window.addEventListener("mousemove", updateMouse);
    offset.value = 32;
  });

  onUnmounted(() => {
    window.removeEventListener("mousemove", updateMouse);
  });

</script>

<template>
  <div class="w-full h-full px-8 pb-8 flex justify-start pt-8">
    <div class="grid grid-cols-5 justify-start items-start gap-4 max-w-full">
      <div
        v-for="album in albums"
        :key="album.id"
        class="w-50"
      >
        <NuxtLink :to="`library/albums/${album.id}`" class="flex w-full flex-col">
          <div 
            class="w-full aspect-square flex items-center justify-center mb-5 bg-cover bg-center"
            :class="(isArtistLoading ? 'animate-pulse' : '')"
            :style="{ backgroundImage: album.cover_url ? `url(${album.cover_url})` : '' }"
          ></div>
          <div class="flex items-center justify-between w-full">
            <div class="flex flex-col">
              <NuxtLink @click.stop @mouseover="hoveredAlbumId = album.id" @mouseout="hoveredAlbumId = null" class="text-xl flex gap-2 font-bold font-h1 font-primary">{{ trimText(album.title, 12) }} <p class="text-[.8rem] text-nav-primary">{{ album.release_date.split('-')[0] }}</p></NuxtLink>
              <NuxtLink
                  v-if="album.artist?.mbid"
                  @click.stop
                  :to="`library/artists/${album.artist.id}`"
                  class="text-md mb-2 link"
              >
                {{ album.artist.name }}
              </NuxtLink>
              <span
                  v-if="hoveredAlbumId === album.id && albumTitleTrimmed"
                  :style="{ position: 'fixed', top: `${mouseY + offset}px`, left: `${mouseX + offset}px`}"
                  class="bg-white text-black px-2"
              >
                {{album.title}}
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>

    </div>
  </div>
</template>