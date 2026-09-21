<template>
  <div class="flex flex-row items-center justify-center w-full h-full text-white p-0">
    <LibraryNavBar />
    <div class="w-full h-full flex flex-col items-center justify-center ">
      <NavBar />
      <main class="content w-full h-full overflow-scroll">
        <slot />
      </main>
    </div>
  </div>
</template>