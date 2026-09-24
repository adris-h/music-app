<script setup lang="ts">
</script>

<template>
  <div class="w-1/3 h-full">
    <div class="w-full h-full flex flex-col items-center justify-start gap-4 py-10 px-6">
       <!-- <div class="w-full rounded-md bg-primary h-14"  ></div>-->
      <div class="flex flex-col items-start justify-start gap-4 w-full">
        <NuxtLink to="/library" class="link text-default text-nav-primary" exactActiveClass="active text-nav-selected">Recents</NuxtLink>
        <NuxtLink to="/library/best-releases" class="link text-default text-nav-primary" exactActiveClass="active text-nav-selected">Recent Releases</NuxtLink>
      </div>
    </div>

  </div>
</template>



