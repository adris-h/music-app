<script>
import albums from "~~/server/data/albums.json";
onMounted(() => {
  albums.forEach((album) => {
    const img = new Image();
    img.src = album.cover_url;
  });
});

</script>
<template>
  <link rel="stylesheet" href="https://use.typekit.net/wll8fsr.css">
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
