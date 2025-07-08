import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia';
import router from './router';
import {
  Quasar,
  AppFullscreen,
  Dialog,
  Loading,
  Meta,
  Notify,
  Cookies
} from 'quasar';
import langCn from 'quasar/lang/zh-CN.js'

document.addEventListener('gesturestart', function (e) {
  e.preventDefault();
});

// Import icon libraries
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'
import '@quasar/extras/material-icons-round/material-icons-round.css'
import '@quasar/extras/material-icons-sharp/material-icons-sharp.css'
import '@quasar/extras/material-symbols-outlined/material-symbols-outlined.css'
import '@quasar/extras/material-symbols-rounded/material-symbols-rounded.css'
import '@quasar/extras/material-symbols-sharp/material-symbols-sharp.css'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'

import 'quasar/src/css/index.sass'

const pinia = createPinia();

createApp(App)
    .use(router)
    .use(pinia)
    .use(Quasar, {
        plugins: {
        AppFullscreen,
        Dialog,
        Loading,
        Meta,
        Notify,
        Cookies,
        },
        lang: langCn
    })
    .mount('#app')
