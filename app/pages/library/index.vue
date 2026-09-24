<script setup lang="ts">
  definePageMeta({ layout: 'library' })
  const count = 4

  const { data: albums } = await useAlbums()
</script>

<template>
  <div class="w-full h-full px-8 pb-8 flex justify-start pt-8">
    <div class="flex flex-wrap justify-start items-start gap-4 max-w-full">
      <div
        v-for="album in albums"
        :key="album.id"
        class="w-50"
      >
        <NuxtLink :to="`library/albums/${album.id}`" class="flex w-full flex-col">
          <div 
            class="w-full aspect-square flex items-center justify-center  mb-5 bg-cover bg-center"
            :style="{ backgroundImage: album.cover_url ? `url(${album.cover_url})` : '' }"
          ></div>
          <div class="flex items-center justify-between w-full">
            <div class="flex flex-col">
              <NuxtLink @click.stop class="text-2xl font-bold font-h1">{{ album.title }}</NuxtLink>
              <NuxtLink
                  v-if="album.artist?.mbid"
                  @click.stop
                  :to="`library/artists/${album.artist.id}`"
                  class="text-lg link"
              >
                {{ album.artist.name }}
              </NuxtLink>

              <p class="text-[.8rem]">{{ album.release_date.split('-')[0] }}</p>

            </div>
          </div>

        </NuxtLink>
      </div>

    </div>
  </div>
</template>