<script setup lang="ts">
  definePageMeta({ layout: 'library' })
  const count = 4

  const { data: albums } = await useAlbums()
</script>

<template>
  <div class="w-full h-full px-8 pb-8 flex justify-center pt-8">
    <div class="flex flex-wrap justify-start items-start gap-4 max-w-full">
      <div
        v-for="album in albums"
        :key="album.id"
        class="w-50"
      >

        <NuxtLink :to="`library/albums/${album.id}`" class="flex w-full flex-col">
          <div 
            class="w-full aspect-square flex items-center justify-center  mb-5 bg-cover bg-center"
            :style="{ backgroundImage: album.coverUrl ? `url(${album.coverUrl})` : '' }"
          ></div>
          <div class="flex items-center justify-between w-full">
            <div class="flex flex-col">
              <NuxtLink @click.stop class="hover:underline text-base" > {{ album.title }} </NuxtLink>
              <NuxtLink @click.stop :to="`https://musicbrainz.org/artist/${album.artist.mbid}`" class="hover:underline text-sm"> {{ album.artist.name }} </NuxtLink>
             <p>{{ album.releaseDate }}</p>
            </div>
          </div>

        </NuxtLink>
      </div>

    </div>
  </div>
</template>