/**
 * WatchHive — Main Application
 * Точка входа и инициализация
 */

(function() {
  'use strict';
  
  const { State, Utils, Auth, Favorites, Search, Navigation, Genres, API, Comments, VideoPlayer } = WatchHive;
  
  const App = {
    // Инициализация приложения
    init: async function() {
      console.log('🚀 WatchHive initializing...');
      
      // 1. Инициализация состояния
      State.init();
      
      // 2. Инициализация модулей
      Auth.init();
      Favorites.init();
      Search.init();
      Navigation.init();
      Genres.init();
      Comments.init();
      
      // 3. Загрузка начальных данных
      try {
        await API.fetchPopular(State.popularType);
      } catch (error) {
        console.error('Initial load error:', error);
        Utils.showError('popular', 'Не удалось загрузить контент');
      }
      
      console.log('✅ WatchHive ready!');
    }
  };
  
  // Запуск при загрузке DOM
  document.addEventListener('DOMContentLoaded', () => {
    App.init();
  });
  
  // Экспорт для отладки
  window.WatchHive = window.WatchHive || {};
  WatchHive.App = App;
  
})();