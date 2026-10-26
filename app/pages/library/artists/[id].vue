<script setup lang="ts">
definePageMeta({ layout: 'library' })
const route = useRoute()
const { data: artist, error } = await useArtist(() => route.params.id as string)

import { useArtist } from '~/composables/useArtists'
const sections = [
  { type: 'Album', title: 'Albums' },
  { type: 'EP', title: 'EPs' },
  { type: 'Single', title: 'Singles' },
]
const groups = computed(() =>
    sections
        .map(s => ({
          ...s,
          items: (artist.value?.albums ?? []).filter(
              (a: any) => a.type === s.type && !a.secondary_types?.length,
          ),
        }))
        .filter(g => g.items.length > 0), // skip empty sections
)

const loadingMbid = ref<string | null>(null)
const openAlbum = async (album: { id: number | null, mbid: string }) => {
  if (loadingMbid.value) return // a save is already running

  if (album.id) return navigateTo(`/library/albums/${album.id}`)
  loadingMbid.value = album.mbid

  try {
    const saved = await $fetch<{ id: number }>('/api/albums', {
      method: 'POST',
      body: { mbid: album.mbid },
    })

    await navigateTo(`/library/albums/${saved.id}`)
  } catch (err) {
    console.error('Could not save album:', err)
  } finally {
    loadingMbid.value = null
  }
}
</script>

<template>
  <div class="w-full h-full px-8 pb-8 flex items-center justify-center font-primary">
    <div class="w-full h-full">
      <div v-if="artist" class="w-full flex flex-col gap-10">
        <h1 class="text-2xl font-bold">{{ artist.name }}</h1>
        <h2 class="text-lg">{{ artist.aliases?.[0]?.sortname }}</h2>
        <div class="flex flex-col w-70 aspect-square bg-cover mb-10" :style="{ backgroundImage: artist.image_url ? `url(${artist.image_url})` : '' }"></div>

        <section v-for="group in groups" :key="group.type" class=" w-full">
          <h2 class="text-xl font-bold mb-4">{{ group.title }}</h2>

          <div class="grid grid-cols-6 gap-4 w-full">
            <div
                v-for="album in group.items"
                :key="album.mbid"
                class="w-full cursor-pointer"
                @click="openAlbum(album)"
            >
              <div
                  class="w-full aspect-square flex items-center justify-center bg-cover bg-center"
                  :class="{ 'opacity-50': loadingMbid === album.mbid }"
                  :style="{ backgroundImage: album.cover_url ? `url(${album.cover_url})` : '' }"
              >
                <span v-if="loadingMbid === album.mbid">Saving...</span>
              </div>
              <div class="flex flex-col">
                <span class="hover:underline text-lg">{{ album.title }}</span>
                <p class="text-[.8rem]">{{ album.release_date?.split('-')[0] }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>