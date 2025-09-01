// import './assets/main.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import MasonryWall from '@yeger/vue-masonry-wall'
import App from './App.vue'

let app = createApp(App)

app.use(MasonryWall)
app.use(createPinia());
app.mount('#app')

