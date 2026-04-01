/**
 * WatchHive — Search Module
 * Поиск контента через TMDB API
 */

(function() {
  'use strict';
  
  const { Config, Utils, State, Items, API } = WatchHive;
  
  const Search = {
    // Инициализация
    init: function() {
      this.setupEventListeners();
    },
    
    // Настройка обработчиков
    setupEventListeners: function() {
      const searchInput = document.getElementById('search-input');
      const searchBtn = document.getElementById('search-btn');
      const clearBtn = document.getElementById('clear-search');
      
      // Поиск по кнопке
      searchBtn?.addEventListener('click', () => {
        const query = searchInput?.value.trim();
        if (query) {
          this.performSearch(query);
          this.hideSuggestions();
        }
      });
      
      // Поиск по Enter
      searchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const query = searchInput.value.trim();
          if (query) {
            this.performSearch(query);
            this.hideSuggestions();
          }
        }
      });
      
      // Очистка
      clearBtn?.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          clearBtn.classList.remove('visible');
        }
        this.hideSuggestions();
        State.searchQuery = '';
      });
      
      // Ввод с debounce
      searchInput?.addEventListener('input', Utils.debounce((e) => {
        const query = e.target.value.trim();
        
        if (clearBtn) {
          clearBtn.classList.toggle('visible', query.length > 0);
        }
        
        if (query.length >= Config.MIN_SEARCH_LENGTH) {
          this.fetchSuggestions(query);
        } else {
          this.hideSuggestions();
        }
      }, Config.SEARCH_DEBOUNCE));
      
      // Скрытие при клике вне
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
          this.hideSuggestions();
        }
      });
    },
    
    // Получение подсказок
    async fetchSuggestions(query) {
      try {
        const url = `${Config.BASE_URL}/search/multi?api_key=${Config.API_KEY}&language=${Config.DEFAULT_LANGUAGE}&query=${encodeURIComponent(query)}&page=1&include_adult=false`;
        const data = await Utils.fetchJson(url);
        this.displaySuggestions(data.results?.slice(0, 5) || []);
      } catch (error) {
        console.error('Search suggestions error:', error);
      }
    },
    
    // Отображение подсказок
    displaySuggestions: function(results) {
      const container = document.getElementById('search-results');
      if (!container) return;
      
      if (results.length === 0) {
        container.innerHTML = '<div class="search-no-results">Ничего не найдено</div>';
        container.classList.add('show');
        return;
      }
      
      container.innerHTML = results.map(item => {
        if (!item.title && !item.name) return '';
        
        const title = item.title || item.name;
        const year = Utils.getYear(item.release_date || item.first_air_date);
        const type = item.media_type === 'movie' ? 'Фильм' : item.media_type === 'tv' ? 'Сериал' : '';
        const poster = Utils.getPosterUrl(item.poster_path, 'w92');
        
        return `
          <div class="search-result-item" data-id="${item.id}" data-type="${item.media_type}" data-title="${Utils.escapeHtml(title)}">
            <img src="${poster}" alt="${Utils.escapeHtml(title)}" onerror="this.src='https://via.placeholder.com/40x60?text=No+Image'">
            <div class="search-result-info">
              <div class="search-result-title">${Utils.escapeHtml(title)}</div>
              <div class="search-result-meta">${type}${year ? ' • ' + year : ''}</div>
            </div>
          </div>
        `;
      }).filter(Boolean).join('');
      
      // Обработчики кликов
      container.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const id = item.dataset.id;
          const type = item.dataset.type;
          const title = item.dataset.title;
          
          this.hideSuggestions();
          
          // Если конкретный элемент — сразу открываем
          if (id && type) {
            WatchHive.VideoPlayer?.openModal?.(id, type, title);
          } else {
            // Иначе выполняем поиск
            this.performSearch(title, id, type);
          }
        });
      });
      
      container.classList.add('show');
    },
    
    // Скрытие подсказок
    hideSuggestions: function() {
      const container = document.getElementById('search-results');
      container?.classList.remove('show');
    },
    
    // Выполнение поиска
    async performSearch(query, specificId = null, specificType = null) {
      State.searchQuery = query;
      
      // Переключение на страницу поиска
      WatchHive.Navigation?.showPage?.('search');
      
      Utils.toggleLoading('search', true);
      
      try {
        // Если указан конкретный ID — открываем сразу
        if (specificId && specificType) {
          WatchHive.VideoPlayer?.openModal?.(specificId, specificType, query);
          return;
        }
        
        // Обычный поиск
        const url = `${Config.BASE_URL}/search/multi?api_key=${Config.API_KEY}&language=${Config.DEFAULT_LANGUAGE}&query=${encodeURIComponent(query)}&page=1&include_adult=false`;
        const data = await Utils.fetchJson(url);
        
        const filtered = (data.results || []).filter(item => 
          item.media_type === 'movie' || item.media_type === 'tv'
        );
        
        if (filtered.length > 0) {
          Items.display(filtered, 'search');
          Utils.showNotification(`🔍 Найдено: ${filtered.length} результатов для "${query}"`, 'info');
        } else {
          Utils.showError('search', 'Ничего не найдено по вашему запросу');
        }
        
      } catch (error) {
        console.error('Search error:', error);
        Utils.showError('search', 'Ошибка при поиске');
      } finally {
        Utils.toggleLoading('search', false);
      }
    }
  };
  
  // Экспорт
  window.WatchHive = window.WatchHive || {};
  WatchHive.Search = Search;
  
})();