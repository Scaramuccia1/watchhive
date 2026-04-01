/**
 * WatchHive — Application State
 * Управление состоянием приложения
 */

(function() {
  'use strict';
  
  const State = {
    // Навигация
    currentPage: 'popular',
    currentType: 'movie',
    popularType: 'movie',
    
    // Фильтры
    selectedGenres: [],
    genresList: {},
    
    // Поиск
    searchQuery: '',
    searchTimeout: null,
    
    // Видео
    videoPlayer: null,
    currentMediaInfo: null,
    
    // Авторизация
    currentUser: null,
    authProvider: null,
    
    // Избранное
    favorites: [],
    
    // UI состояния
    isLoading: {
      popular: false,
      all: false,
      favorites: false,
      search: false
    }
  };
  
  // Инициализация состояния из localStorage
  State.init = function() {
    // Загрузка пользователя
    const savedUser = localStorage.getItem('watchhive_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      State.currentUser = user;
      State.authProvider = user.provider;
    }
    
    // Загрузка избранного
    const savedFavs = localStorage.getItem('watchhive_favorites');
    State.favorites = savedFavs ? JSON.parse(savedFavs) : [];
    
    console.log('📦 State initialized');
  };
  
  // Сохранение избранного
  State.saveFavorites = function() {
    localStorage.setItem('watchhive_favorites', JSON.stringify(State.favorites));
  };
  
  // Сохранение пользователя
  State.saveUser = function(user, provider) {
    State.currentUser = user;
    State.authProvider = provider;
    localStorage.setItem('watchhive_user', JSON.stringify({ ...user, provider }));
  };
  
  // Очистка авторизации
  State.clearAuth = function() {
    State.currentUser = null;
    State.authProvider = null;
    localStorage.removeItem('watchhive_user');
  };
  
  // Проверка авторизации
  State.isAuthenticated = function() {
    return !!State.currentUser;
  };
  
  // Проверка: в избранном ли элемент
  State.isFavorite = function(itemId) {
    return State.favorites.some(f => f.id === itemId);
  };
  
  // Добавление/удаление из избранного
  State.toggleFavorite = function(item) {
    const index = State.favorites.findIndex(f => f.id === item.id);
    if (index === -1) {
      State.favorites.push(item);
      return true; // добавлено
    } else {
      State.favorites.splice(index, 1);
      return false; // удалено
    }
  };
  
  // Установка загрузки
  State.setLoading = function(page, loading) {
    State.isLoading[page] = loading;
  };
  
  State.isLoadingPage = function(page) {
    return State.isLoading[page] || false;
  };
  
  // Экспорт
  window.WatchHive = window.WatchHive || {};
  WatchHive.State = State;
  
})();