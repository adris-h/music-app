<script setup lang="ts">
definePageMeta({ layout: 'library' })
const route = useRoute()
const { data: artist, error } = await useArtist(() => route.params.id as string)
</script>

<template>
  <div class="w-full h-full px-8 pb-8 flex items-center justify-center">
    <div class="w-full h-full grid grid-cols-2 gap-4">
      <div v-if="artist">
        <h1 class="text-2xl font-bold" >{{ artist.name }}</h1>
        <div class="flex flex-col w-70 aspect-square bg-cover mb-10" :style="{ backgroundImage: artist.image_url ? `url(${artist.image_url})` : '' }"></div>

        <div class="flex ">
          <div v-for="album in artist.albums" :key="album.id" class="w-50">
            <NuxtLink :to="`../albums/${album.id}`" class="flex w-full flex-col">
              <div
                class="w-full aspect-square flex items-center justify-center bg-cover bg-center"
                :style="{ backgroundImage: album.cover_url ? `url(${album.cover_url})` : '' }"
              ></div>
              <div class="flex items-center justify-between w-full">
                <div class="flex flex-col">
                  <NuxtLink @click.stop class="hover:underline text-lg" > {{ album.title }} </NuxtLink>
                  <p class="text-[.8rem]">{{ album.release_date.split('-')[0] }}</p>
                </div>
              </div>
            </NuxtLink>
        </div>
        </div>

      </div>
    </div>
  </div>
</template>