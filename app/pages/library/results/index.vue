<script setup lang="ts">
  import {trimText} from "~/composables/useTrimText.ts";

  definePageMeta({ layout: 'library' })
  const route = useRoute();

  const query = computed(() => String(route.query.q ?? ''));
  const { data, pending } = useSearch(query, 'search-results');

  const sections = computed(() => {
    const albums = data.value.albums
    return [
      { title: 'Albums', items: albums.filter(a => a.type === 'Album') },
      { title: 'EPs', items: albums.filter(a => a.type === 'EP') },
      { title: 'Singles', items: albums.filter(a => a.type === 'Single') },
    ].filter(section => section.items.length > 0)
  })

  const openAlbum = async (mbid: string) => {
    const album = await $fetch<any>('/api/albums', {
      method: 'POST',
      body: { mbid },
    })
    await navigateTo(`/library/albums/${album.id}`)
  }
  const openArtistOfAlbum = async (album: any) => {
    // Saved album: it already knows its artist's id
    if (album.artist_id) {
      await navigateTo(`/library/artists/${album.artist_id}`)
      return
    }

    // Not saved: saving the album also creates its artist,
    // and the response tells us the new artist_id
    const saved = await $fetch<any>('/api/albums', {
      method: 'POST',
      body: { mbid: album.mbid },
    })
    await navigateTo(`/library/artists/${saved.artist_id}`)
  }






</script>

<template>
  <div class="w-full h-full px-8 pb-8 flex items-center justify-center">
    <div class="w-full h-full flex flex-col gap-10 p-10">
      <p v-if="pending">Searching…</p>
      <p v-else-if="!data?.albums.length && !data?.artists.length">No results found.</p>
      <div v-else class="flex flex-col gap-4">
        <div v-if="data?.albums.length" class="">
          <div v-for="section in sections" :key="section.title" class="w-full">
            <h2 class="px-2 py-1 text-xs uppercase ">{{ section.title }}</h2>
            <div class=" grid grid-cols-4 gap-2">
              <div v-for="r in section.items" :key="r.mbid" class="flex flex-col gap-4 px-2 py-2">

                <!-- Cover: click opens the album -->
                <span
                    v-if="r.cover_url"
                    @click="openAlbum(r.mbid)"
                    :style="{ backgroundImage: `url(${r.cover_url})` }"
                    class="w-full aspect-square bg-cover bg-center cursor-pointer"
                ></span>

                <span class="flex flex-col">
                <!-- Title: click opens the album -->
                <button type="button" @click="openAlbum(r.mbid)"
                        class="text-xl flex gap-2 font-bold font-primary text-left">
                  {{ trimText(r.title, 10) }}
                  <span class="text-[.8rem] text-nav-primary">{{ r.release_date.split('-')[0] }}</span>
                </button>

                              <!-- Artist: click opens the artist -->
                <button v-if="r.artist" type="button" @click="openArtistOfAlbum(r)"
                        class="text-md mb-2 link text-left">
                  {{ r.artist }}
                </button>
              </span>
              </div>
            </div>

          </div>

        </div>
        <div v-if="data?.artists.length" class="flex flex-col gap-2">
          <h2 class="text-xl font-bold">Artists</h2>
          <ul class="flex flex-col gap-1">
            <li v-for="artist in data.artists" :key="artist.id" class="flex items-center gap-4">
              <NuxtLink :to="`/library/artists/${artist.id}`" class="link">{{ artist.name }}</NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>