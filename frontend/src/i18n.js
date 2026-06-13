import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zh from './locales/zh.json'

const savedLang = localStorage.getItem('lang') || navigator.language?.startsWith('zh') ? 'zh' : 'en'

const i18n = createI18n({
  legacy: false,
  locale: savedLang,
  fallbackLocale: 'en',
  messages: { en, zh }
})

export function setLanguage(lang) {
  i18n.global.locale.value = lang
  localStorage.setItem('lang', lang)
  document.querySelector('html').setAttribute('lang', lang)
}

export default i18n
