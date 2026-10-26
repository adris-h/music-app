<script setup lang="ts">
const route = useRoute();

const isInLibrary = computed(() => route.path.startsWith('/library'))

const query = ref('')
const debouncedQuery = refDebounced(query, 300)
const { data: results, pending } = useSearch(debouncedQuery)

function openResults() {
  const text = debouncedQuery.value.trim()
  if (!text) return

  navigateTo({ path: '/library/results', query: { q: text } })
  query.value = ''
}

const openAlbum = async (mbid: string) => {
  const album = await $fetch('/api/albums', {
    method: 'POST',
    body: { mbid },
  })
  await navigateTo(`/library/albums/${album.id}`)
  query.value = ''
}


const openArtist = async (mbid: string) => {
  const artist = await $fetch<any>('/api/artists', {
    method: 'POST',
    body: { mbid },
  })
  await navigateTo(`/library/artists/${artist.id}`)
  query.value = ''
}


// Each section has a title and its own list of albums.
// Sections with no items are removed, so no empty titles show up.
const sections = computed(() => {
  const albums = results.value.albums
  return [
    { title: 'Albums', items: albums.filter(a => a.type === 'Album') },
    { title: 'EPs', items: albums.filter(a => a.type === 'EP') },
    { title: 'Singles', items: albums.filter(a => a.type === 'Single') },
  ].filter(section => section.items.length > 0)
})

const artists = computed(() => results.value.artists)
const isSearching = computed(() => debouncedQuery.value.trim() !== '' && pending.value)
const showResults = computed(() =>
    debouncedQuery.value.trim() !== '' &&
    (results.value.albums.length > 0 || results.value.artists.length > 0)
)
</script>

<template>
  <nav class="flex justify-between items-end gap-40 w-full px-8 py-2 h-16 text-white">
    <div class="w-full h-full flex items-center relative">
      <input type="text" v-model="query" @keyup.enter="openResults()" placeholder="Search..." class="w-full border-[.5px] border-nav-primary outline-0 focus:border-white duration-300 px-2 font-primary">
      <!-- Loading -->
      <div v-if="isSearching" class="results absolute top-10 left-0 w-full h-fit border-nav-primary bg-background flex items-center justify-center py-4">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
          <span class="text-sm text-white/70">Searching...</span>
        </div>
      </div>

      <!-- Results -->
      <div v-else-if="showResults" class="results absolute top-10 left-0 w-full h-fit border border-nav-primary bg-background font-primary overflow-y-">

        <!-- Artists -->
        <div v-if="artists.length">
          <h2 class="px-2 py-1 text-xs uppercase text-white/50 border-b border-nav-primary">Artists</h2>

          <div v-for="a in artists" :key="a.mbid" @click="openArtist(a.mbid)" class="flex flex-col px-2 py-2 border-b border-nav-primary">
            <span class="text-md">{{ a.name }}</span>
            <span class="text-xs text-white/70"><template v-if="a.country"> · {{ a.country }}</template></span>
          </div>
        </div>
        <!-- Albums, EPs, Singles: one block, repeated for each section -->
        <div v-for="section in sections" :key="section.title">
          <h2 class="px-2 py-1 text-xs uppercase text-white/50 border-b border-nav-primary">{{ section.title }}</h2>

          <div v-for="r in section.items" :key="r.mbid" @click="openAlbum(r.mbid)" class="flex gap-4 px-2 py-2 cursor-pointer hover:bg-white/5 border-b border-nav-primary">
            <span v-if="r.cover_url" class="w-10 h-10 mr-2 inline-block">
              <img :src="r.cover_url" :alt="r.title" class="w-10 h-10 object-cover rounded">
            </span>
            <span class="flex flex-col">
              <span class="text-md">{{ r.title }}</span>
              <span class="text-sm">{{ r.artist }}</span>
            </span>
          </div>
        </div>


      </div>
    </div>

    <div class="hidden md:flex items-center">
      <NuxtLink to="/" class="link" exactActiveClass="active"> Account </NuxtLink>
      <NuxtLink to="/library" class="link" :class="{'active': isInLibrary}"> Library </NuxtLink>
    </div>

    <div class="md:hidden">
      <button type="button" command="--toggle" commandfor="mobile-menu" class="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white">
        <span class="absolute -inset-0.5"></span>
        <span class="sr-only">Open main menu</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" class="size-6 in-aria-expanded:hidden">
          <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" class="size-6 not-in-aria-expanded:hidden">
          <path d="M6 18 18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </nav>
</template>