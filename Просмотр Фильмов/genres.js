/**
 * WatchHive — Genres Module
 * Фильтрация по жанрам
 */

(function() {
  'use strict';
  
  const { Config, Utils, State, API, Items } = WatchHive;
  
  const Genres = {
    // Загрузка жанров для типа
    load: async function(type) {
      const endpoint = type === 'movie' ? 'movie' : 'tv';
      const url = `${Config.BASE_URL}/genre/${endpoint}/list?api_key=${Config.API_KEY}&language=${Config.DEFAULT_LANGUAGE}`;
      
      try {
        const data = await Utils.fetchJson(url);
        
        if (data.genres) {
          State.genresList[type] = data.genres.reduce((acc, g) => {
            acc[g.id] = g.name;
            return acc;
          }, {});
          
          this.renderButtons(type);
        }
      } catch (error) {
        console.error('Ошибка загрузки жанров:', error);
      }
    },
    
    // Рендер кнопок жанров
    renderButtons: function(type) {
      const container = document.getElementById('genres-container');
      if (!container) return;
      
      const genres = State.genresList[type];
      
      if (!genres || Object.keys(genres).length === 0) {
        container.innerHTML = '<span style="color:#666;font-size:0.85rem">Жанры не найдены</span>';
        return;
      }
      
      container.innerHTML = Object.entries(genres).map(([id, name]) => {
        const isSelected = State.selectedGenres.includes(parseInt(id));
        return `
          <button class="genre-btn ${isSelected ? 'selected' : ''}" data-genre-id="${id}">
            ${Utils.escapeHtml(name)}
          </button>
        `;
      }).join('');
      
      // Обработчики
      container.querySelectorAll('.genre-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const genreId = parseInt(btn.dataset.genreId);
          const index = State.selectedGenres.indexOf(genreId);
          
          if (index === -1) {
            State.selectedGenres.push(genreId);
          } else {
            State.selectedGenres.splice(index, 1);
          }
          
          this.updateButtons();
          this.updateActiveFilters();
          this.fetchByGenres();
        });
      });
      
      this.updateCount();
      this.updateClearButton();
    },
    
    // Обновление состояния кнопок
    updateButtons: function() {
      document.querySelectorAll('.genre-btn').forEach(btn => {
        const genreId = parseInt(btn.dataset.genreId);
        btn.classList.toggle('selected', State.selectedGenres.includes(genreId));
      });
      this.updateCount();
      this.updateClearButton();
    },
    
    // Обновление счётчика выбранных
    updateCount: function() {
      const countEl = document.getElementById('genre-count');
      if (!countEl) return;
      
      if (State.selectedGenres.length > 0) {
        countEl.textContent = `${State.selectedGenres.length} выбр.`;
        countEl.style.display = 'inline';
      } else {
        countEl.style.display = 'none';
      }
    },
    
    // Обновление кнопки сброса
    updateClearButton: function() {
      const clearBtn = document.getElementById('clear-genres-btn');
      if (!clearBtn) return;
      
      clearBtn.classList.toggle('visible', State.selectedGenres.length > 0);
    },
    
    // Обновление активных фильтров (тегов)
    updateActiveFilters: function() {
      const container = document.getElementById('active-filters');
      if (!container) return;
      
      container.innerHTML = '';
      
      if (State.selectedGenres.length === 0) return;
      
      State.selectedGenres.forEach(genreId => {
        const genreName = State.genresList[State.currentType]?.[genreId];
        if (!genreName) return;
        
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.innerHTML = `
          ${Utils.escapeHtml(genreName)} 
          <span class="remove-filter" data-id="${genreId}">
            <i class="fas fa-times"></i>
          </span>
        `;
        
        tag.querySelector('.remove-filter').addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = State.selectedGenres.indexOf(genreId);
          if (idx > -1) {
            State.selectedGenres.splice(idx, 1);
            this.updateButtons();
            this.updateActiveFilters();
            this.fetchByGenres();
          }
        });
        
        container.appendChild(tag);
      });
    },
    
    // Поиск по выбранным жанрам
    async fetchByGenres() {
      if (State.selectedGenres.length === 0) {
        Items.fetchAll();
        return;
      }
      
      const genreParam = State.selectedGenres.join(',');
      let url;
      
      if (State.currentType === 'korean') {
        url = `${Config.BASE_URL}/discover/tv?api_key=${Config.API_KEY}&language=${Config.DEFAULT_LANGUAGE}&with_genres=${genreParam}&with_original_language=ko`;
      } else {
        url = `${Config.BASE_URL}/discover/${State.currentType}?api_key=${Config.API_KEY}&language=${Config.DEFAULT_LANGUAGE}&with_genres=${genreParam}`;
      }
      
      Utils.toggleLoading('all', true);
      
      try {
        const data = await Utils.fetchJson(url);
        
        if (data.results?.length > 0) {
          Items.display(data.results, 'all');
          Utils.showNotification(`🎬 Найдено: ${data.results.length} по жанрам`, 'info');
        } else {
          Utils.showError('all', 'Контент по выбранным жанрам не найден');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        Utils.showError('all', error.message);
      } finally {
        Utils.toggleLoading('all', false);
      }
    },
    
    // Сброс фильтров
    clear: function() {
      State.selectedGenres = [];
      this.updateButtons();
      this.updateActiveFilters();
      Items.fetchAll();
      Utils.showNotification('🔄 Фильтры жанров сброшены', 'info');
    },
    
    // Инициализация
    init: function() {
      document.getElementById('clear-genres-btn')?.addEventListener('click', () => {
        this.clear();
      });
    }
  };
  
  // Экспорт
  window.WatchHive = window.WatchHive || {};
  WatchHive.Genres = Genres;
  
})();