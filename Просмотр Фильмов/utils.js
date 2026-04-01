/**
 * WatchHive — Utility Functions
 * Вспомогательные функции
 */

(function() {
  'use strict';
  
  const Utils = {
    // Форматирование времени
    formatTime: function(seconds) {
      if (isNaN(seconds) || !seconds) return '0:00';
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    },
    
    // Debounce для поиска
    debounce: function(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
    
    // Показ уведомления
    showNotification: function(message, type = 'success', duration = 3000) {
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      
      const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
      };
      
      notification.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i> ${message}
      `;
      
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), duration);
    },
    
    // Случайный цвет для аватара
    getRandomColor: function() {
      const colors = ['#648cdc', '#8e2de2', '#28a745', '#dc3545', '#17a2b8', '#ffc107'];
      return colors[Math.floor(Math.random() * colors.length)];
    },
    
    // Форматирование поста
    getPosterUrl: function(path, size = 'w500') {
      if (!path) return 'https://via.placeholder.com/200x300?text=Нет+изображения';
      return `${WatchHive.Config.IMAGE_BASE}/${size}${path}`;
    },
    
    // Получение года из даты
    getYear: function(dateString) {
      if (!dateString) return '???';
      const year = new Date(dateString).getFullYear();
      return isNaN(year) ? '???' : year;
    },
    
    // Безопасный текст
    escapeHtml: function(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },
    
    // Загрузка с обработкой ошибок
    fetchJson: async function(url, options = {}) {
      try {
        const response = await fetch(url, {
          headers: { 'Content-Type': 'application/json', ...options.headers },
          ...options
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Fetch error [${url}]:`, error);
        throw error;
      }
    },
    
    // Показать/скрыть загрузку
    toggleLoading: function(page, show) {
      const loadingEl = document.getElementById(`loading-${page}`);
      const errorEl = document.getElementById(`error-${page}`);
      
      if (loadingEl) loadingEl.classList.toggle('show', show);
      if (errorEl && show) errorEl.classList.remove('show');
    },
    
    // Показать ошибку
    showError: function(page, message) {
      const errorEl = document.getElementById(`error-${page}`);
      const loadingEl = document.getElementById(`loading-${page}`);
      
      if (errorEl) {
        errorEl.textContent = `⚠️ ${message}`;
        errorEl.classList.add('show');
      }
      if (loadingEl) loadingEl.classList.remove('show');
    }
  };
  
  // Экспорт
  window.WatchHive = window.WatchHive || {};
  WatchHive.Utils = Utils;
  
})();