/**
 * WatchHive — Configuration
 * Глобальные константы и настройки
 */

const CONFIG = {
  // TMDB API
  API_KEY: 'be7d23de539307aafd91e16bc4ce5c8f',
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE: 'https://image.tmdb.org/t/p',
  
  // OAuth (⚠️ ЗАМЕНИТЕ НА СВОИ ЗНАЧЕНИЯ)
  GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  VK_APP_ID: 12345678,
  
  // Disqus (⚠️ ЗАМЕНИТЕ НА ВАШ SHORTNAME)
  DISQUS_SHORTNAME: 'watchhive',
  
  // Приложение
  APP_NAME: 'WatchHive',
  DEFAULT_LANGUAGE: 'ru-RU',
  
  // Кеширование
  CACHE_TTL: 15 * 60 * 1000, // 15 минут
  
  // Пагинация
  ITEMS_PER_PAGE: 20,
  
  // Поиск
  SEARCH_DEBOUNCE: 300,
  MIN_SEARCH_LENGTH: 2
};

// Экспорт для использования в других модулях
window.WatchHive = window.WatchHive || {};
WatchHive.Config = CONFIG;