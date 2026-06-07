import { createApp } from 'vue'
import { Quasar, Notify, Loading, Dialog, LocalStorage } from 'quasar'
import { createPinia } from 'pinia'
import quasarLang from 'quasar/lang/pt-BR'
import '@quasar/extras/mdi-v7/mdi-v7.css'
import '@quasar/extras/roboto-font/roboto-font.css'
import 'quasar/src/css/index.sass'
import './css/app.scss'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar, {
  plugins: { Notify, Loading, Dialog, LocalStorage },
  lang: quasarLang,
  config: {
    dark: 'auto',
    brand: {
      primary: '#1565C0',
      secondary: '#26A69A',
      accent: '#9C27B0',
      positive: '#21BA45',
      negative: '#C10015',
      warning: '#F2C037',
      info: '#31CCEC'
    },
    notify: { position: 'top-right', timeout: 3000, progress: true }
  }
})

app.mount('#app')
