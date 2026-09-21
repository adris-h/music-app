import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  // enable Nuxt devtools
  devtools: { enabled: true },
  // global CSS
  css: ['~/assets/style/main.css'],
  // PostCSS plugins configuration (preferred over postcss.config.cjs in Nuxt)
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {}
    }
  },
  // avoid Vite re-bundling on runtime devtools usage
  vite: {
    optimizeDeps: {
      include: ['@vue/devtools-core', '@vue/devtools-kit']
    }
  },
  components: [
    {
      path: '~/components/',
      pathPrefix: true
    }
  ],
  modules: []
})