/**
 * WatchHive — Navigation Module
 * Переключение страниц и навигация
 */

(function() {
  'use strict';
  
  const { State, Utils, API, Genres, Items, Favorites } = WatchHive;
  
  const Navigation = {
    // Инициализация
    init: function() {
      this.setupNavButtons();
      this.setupTypeButtons();
    },
    
    // Показ страницы
    showPage: function(pageName) {
      // Скрытие всех страниц
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      
      // Показ нужной
      const target = document.getElementById(`${pageName}-page`);
      if (target) {
        target.classList.add('active');
        State.currentPage = pageName;
      }
      
      // Обновление активной кнопки навигации
      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === pageName);
      });
      
      // Управление видимостью фильтров
      const typeSection = document.getElementById('type-section');
      const genreSection = document.getElementById('genre-section');
      
      if (pageName === 'all') {
        typeSection.style.display = 'flex';
        genreSection.style.display = 'flex';
        Genres.load(State.currentType).then(() => Items.fetchAll());
      } else if (pageName === 'favorites') {
        typeSection.style.display = 'none';
        genreSection.style.display = 'none';
        Favorites.render();
      } else {
        typeSection.style.display = 'none';
        genreSection.style.display = 'none';
        API.fetchPopular(State.popularType);
      }
    },
    
    // Обработчики кнопок навигации
    setupNavButtons: function() {
      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.showPage(btn.dataset.page);
        });
      });
    },
    
    // Обработчики кнопок типа контента
    setupTypeButtons: function() {
      document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          
          // Обновление UI
          document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          
          // Обновление состояния
          State.currentType = btn.dataset.type;
          State.selectedGenres = [];
          
          // Обновление фильтров и загрузка
          Genres.updateButtons();
          Genres.updateActiveFilters();
          Genres.updateClearButton();
          
          Utils.toggleLoading('all', true);
          Genres.load(State.currentType).then(() => Items.fetchAll());
        });
      });
    }
  };
  
  // Экспорт
  window.WatchHive = window.WatchHive || {};
  WatchHive.Navigation = Navigation;
  
})();