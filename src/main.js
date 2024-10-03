import '@/assets/css/app.css';
import "@/assets/css/__variable.css";
import '@/assets/css/custom.css';
import "@/assets/css/custom_ckeditor.css";

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import 'remixicon/fonts/remixicon.css'
import { createI18n } from 'vue-i18n'
import CKEditor from '@ckeditor/ckeditor5-vue'
import en from '@/Languages/en.json';
import vi from '@/Languages/vi.json';

import App from './App.vue'
import router from './router'

const app = createApp(App)
const messages = {
  en,
  vi,
};
const i18n = createI18n({
  locale: 'vi',
  fallbackLocale: 'en',
  messages: messages
})
const pinia = createPinia()
app.use(pinia)
app.use(ElementPlus)
app.use(CKEditor)
app.use(i18n)
app.use(router)

app.mount('#app')
