/**
 * WatchHive — API Module
 * Запросы к TMDB API
 */

(function() {
  'use strict';
  
  const { Config, Utils, State, Items } = WatchHive;
  
  const API = {
    // Получение популярного контента
    fetchPopular: async function(type) {
      let url;
      
      if (type === 'korean') {
        url = `${Config.BASE_URL}/discover/tv?api_key=${Config.API_KEY}&language=${Config.DEFAULT_LANGUAGE}&with_original_language=ko&sort_by=popularity.desc`;
      } else {
        url = `${Config.BASE_URL}/${type}/popular?api_key=${Config.API_KEY}&language=${Config.DEFAULT_LANGUAGE}`;
      }
      
      Utils.toggleLoading('popular', true);
      
      try {
        const data = await Utils.fetchJson(url);
        
        if (data.results?.length > 0) {
          Items.display(data.results.slice(0, 16), 'popular');
        } else {
          Utils.showError('popular', 'Контент не найден');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        Utils.showError('popular', error.message);
      } finally {
        Utils.toggleLoading('popular', false);
      }
    },
    
    // Получение всех контентов (с фильтрами)
    fetchAll: async function() {
      let url;
      
      if (State.currentType === 'korean') {
        url = `${Config.BASE_URL}/discover/tv?api_key=${Config.API_KEY}&language=${Config.DEFAULT_LANGUAGE}&with_original_language=ko&sort_by=popularity.desc`;
      } else {
        url = `${Config.BASE_URL}/${State.currentType}/popular?api_key=${Config.API_KEY}&language=${Config.DEFAULT_LANGUAGE}`;
      }
      
      Utils.toggleLoading('all', true);
      
      try {
        const data = await Utils.fetchJson(url);
        
        if (data.results?.length > 0) {
          Items.display(data.results, 'all');
        } else {
          Utils.showError('all', 'Контент не найден');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        Utils.showError('all', error.message);
      } finally {
        Utils.toggleLoading('all', false);
      }
    },
    
    // Получение деталей медиа
    fetchDetails: async function(id, type) {
      const url = `${Config.BASE_URL}/${type}/${id}?api_key=${Config.API_KEY}&language=${Config.DEFAULT_LANGUAGE}`;
      return await Utils.fetchJson(url);
    },
    
    // Получение видео/трейлеров
    fetchVideos: async function(id, type) {
      const url = `${Config.BASE_URL}/${type}/${id}/videos?api_key=${Config.API_KEY}&language=${Config.DEFAULT_LANGUAGE}`;
      return await Utils.fetchJson(url);
    }
  };
  
  // Экспорт
  window.WatchHive = window.WatchHive || {};
  WatchHive.API = API;
  
})();