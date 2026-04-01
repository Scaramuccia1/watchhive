/**
 * WatchHive — Items Module
 * Создание и отображение карточек контента
 */

(function() {
  'use strict';
  
  const { Utils, State, Favorites, VideoPlayer } = WatchHive;
  
  const Items = {
    // Создание карточки
    createCard: function(id, type, title, rating, year, posterPath) {
      const isFav = State.isFavorite(id);
      
      const card = document.createElement('div');
      card.className = 'item-card';
      card.dataset.id = id;
      card.dataset.type = type;
      
      card.innerHTML = `
        <img src="${Utils.getPosterUrl(posterPath)}" 
             alt="${Utils.escapeHtml(title)}" 
             onerror="this.src='https://via.placeholder.com/200x300?text=Нет+изображения'">
        <div class="card-actions">
          <button class="action-btn favorite ${isFav ? 'active' : ''}" 
                  data-id="${id}" 
                  title="В избранное">
            <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
          </button>
          <button class="action-btn watch-btn" title="Смотреть">
            <i class="fas fa-play"></i>
          </button>
        </div>
        <div class="item-info">
          <h3 title="${Utils.escapeHtml(title)}">${Utils.escapeHtml(title)}</h3>
          <p>★ ${rating} • ${year}</p>
        </div>
      `;
      
      // Обработчики
      card.querySelector('.watch-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        VideoPlayer?.openModal?.(id, type, title, rating, year);
      });
      
      card.querySelector('.favorite').addEventListener('click', (e) => {
        e.stopPropagation();
        Favorites.toggle(id, type, title, posterPath);
      });
      
      card.addEventListener('click', () => {
        VideoPlayer?.openModal?.(id, type, title, rating, year);
      });
      
      return card;
    },
    
    // Отображение списка элементов
    display: function(items, page) {
      const container = document.getElementById(`items-container-${page}`);
      if (!container) return;
      
      if (!items?.length) {
        container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#888">Контент не найден</p>';
        return;
      }
      
      container.innerHTML = '';
      
      items.forEach(item => {
        const posterPath = item.poster_path;
        const title = item.title || item.name || 'Без названия';
        const rating = (item.vote_average ?? 0).toFixed(1);
        const year = Utils.getYear(item.release_date || item.first_air_date);
        const type = item.media_type || State.currentType;
        
        const card = this.createCard(item.id, type, title, rating, year, posterPath);
        container.appendChild(card);
      });
    }
  };
  
  // Экспорт
  window.WatchHive = window.WatchHive || {};
  WatchHive.Items = Items;
  
})();