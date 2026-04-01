/**
 * WatchHive — Favorites Module
 * Управление избранным контентом
 */

(function() {
  'use strict';
  
  const Favorites = {
    // Переключение избранного
    toggle: function(id, type, title, poster) {
      const { State, Utils, Auth } = WatchHive;
      
      if (!Auth.isAuthenticated()) {
        Utils.showNotification('⚠️ Войдите в аккаунт, чтобы добавлять в избранное', 'error');
        document.getElementById('auth-modal')?.classList.add('show');
        return;
      }
      
      const item = { id, type, title, poster };
      const wasAdded = State.toggleFavorite(item);
      State.saveFavorites();
      
      // Обновление UI кнопки
      const cardBtn = document.querySelector(`.action-btn.favorite[data-id="${id}"]`);
      if (cardBtn) {
        if (wasAdded) {
          cardBtn.classList.add('active');
          cardBtn.innerHTML = '<i class="fas fa-heart"></i>';
        } else {
          cardBtn.classList.remove('active');
          cardBtn.innerHTML = '<i class="far fa-heart"></i>';
        }
      }
      
      // Анимация удаления с карточки
      if (!wasAdded) {
        const card = document.querySelector(`.item-card[data-id="${id}"]`);
        if (card && State.currentPage === 'favorites') {
          card.style.transition = 'opacity 0.3s, transform 0.3s';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.9)';
          setTimeout(() => {
            card.remove();
            this.checkEmptyFavorites();
          }, 300);
        }
      }
      
      Utils.showNotification(
        wasAdded ? '✅ Добавлено в избранное' : '❌ Удалено из избранного',
        wasAdded ? 'success' : 'info'
      );
      
      this.updateCount();
    },
    
    // Проверка пустого состояния избранного
    checkEmptyFavorites: function() {
      const { State } = WatchHive;
      const container = document.getElementById('items-container-favorites');
      const emptyMsg = document.getElementById('empty-favorites');
      
      if (!container || !emptyMsg) return;
      
      if (State.favorites.length === 0) {
        emptyMsg.style.display = 'block';
      } else {
        emptyMsg.style.display = 'none';
      }
    },
    
    // Обновление счётчика
    updateCount: function() {
      const { State } = WatchHive;
      const badge = document.getElementById('fav-count');
      if (badge) badge.textContent = State.favorites.length;
    },
    
    // Рендер избранного
    render: function() {
      const { State, Items } = WatchHive;
      const container = document.getElementById('items-container-favorites');
      
      if (!container) return;
      
      this.checkEmptyFavorites();
      
      if (State.favorites.length === 0) return;
      
      container.innerHTML = '';
      State.favorites.forEach(item => {
        const card = Items.createCard(item.id, item.type, item.title, '0.0', '', item.poster);
        container.appendChild(card);
      });
    },
    
    // Инициализация
    init: function() {
      this.updateCount();
    }
  };
  
  // Экспорт
  window.WatchHive = window.WatchHive || {};
  WatchHive.Favorites = Favorites;
  
})();