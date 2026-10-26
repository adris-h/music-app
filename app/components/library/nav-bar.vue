<script setup lang="ts">
</script>

<template>
  <div class="w-1/4 h-full border-r border-r-nav-primary">
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
    <div class="w-full h-full flex flex-col items-center justify-start gap-4 py-10 px-6">
       <!-- <div class="w-full rounded-md bg-primary h-14"  ></div>-->
      <div class="flex flex-col items-start justify-start gap-4 w-full">
        <NuxtLink to="/library" class="link text-default text-nav-primary" exactActiveClass="active text-nav-selected">Saved Albums</NuxtLink>
        <NuxtLink to="/library/best-releases" class="link text-default text-nav-primary" exactActiveClass="active text-nav-selected">Next Page</NuxtLink>
      </div>
    </div>

  </div>
</template>



