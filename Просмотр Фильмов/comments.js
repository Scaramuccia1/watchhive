/**
 * WatchHive — Comments Module
 * Интеграция с Disqus
 */

(function() {
  'use strict';
  
  const { Config, State } = WatchHive;
  
  const Comments = {
    // Инициализация вкладок
    initTabs: function() {
      document.querySelectorAll('.comments-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          const tabName = tab.dataset.tab;
          
          // Переключение вкладок
          document.querySelectorAll('.comments-tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.comments-container').forEach(c => c.classList.remove('active'));
          
          tab.classList.add('active');
          document.getElementById(`tab-${tabName}`).classList.add('active');
          
          // Загрузка Disqus при активации вкладки комментариев
          if (tabName === 'comments' && State.currentMediaInfo) {
            this.loadDisqus(State.currentMediaInfo);
          }
        });
      });
    },
    
    // Загрузка Disqus
    loadDisqus: function(media) {
      const { DISQUS_SHORTNAME } = Config;
      const disqusContainer = document.getElementById('disqus-container');
      const disqusHint = document.getElementById('disqus-hint');
      const commentsCount = document.getElementById('comments-count');
      
      if (!disqusContainer) return;
      
      // Настройка конфигурации
      const disqusConfig = {
        identifier: `${media.type}_${media.id}`,
        url: window.location.href + `?${media.type}=${media.id}`,
        title: media.title,
        language: 'ru'
      };
      
      // SSO для авторизованных пользователей
      if (State.isAuthenticated()) {
        disqusConfig.sso = {
          name: Config.APP_NAME,
          button: 'Войти через ' + Config.APP_NAME,
          icon: ''
        };
      }
      
      // Глобальная конфигурация Disqus
      window.disqus_config = function() {
        this.page.identifier = disqusConfig.identifier;
        this.page.url = disqusConfig.url;
        this.page.title = disqusConfig.title;
        if (disqusConfig.sso) this.sso = disqusConfig.sso;
      };
      
      // Показ подсказки
      if (disqusHint) disqusHint.style.display = 'block';
      
      // Загрузка скрипта если ещё не загружен
      if (!window.DISQUS && !document.getElementById('disqus-thread-script')) {
        const script = document.createElement('script');
        script.id = 'disqus-thread-script';
        script.async = true;
        script.src = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`;
        document.body.appendChild(script);
      }
      
      // Перезагрузка если Disqus уже инициализирован
      if (window.DISQUS) {
        window.DISQUS.reset({
          reload: true,
          config: function() {
            this.page.identifier = disqusConfig.identifier;
            this.page.url = disqusConfig.url;
            this.page.title = disqusConfig.title;
          }
        });
      }
      
      // Попытка получить счётчик комментариев
      setTimeout(() => {
        const iframe = document.querySelector('#disqus-thread iframe');
        if (iframe && disqusHint) {
          disqusHint.style.display = 'none';
          // Здесь можно добавить запрос к API Disqus для получения количества
        }
      }, 2000);
    },
    
    // Сброс при закрытии модального окна
    cleanup: function() {
      if (window.DISQUS) {
        window.DISQUS.reset({ reload: false });
      }
      document.getElementById('disqus-thread')?.innerHTML = '';
    },
    
    // Инициализация
    init: function() {
      this.initTabs();
    }
  };
  
  // Экспорт
  window.WatchHive = window.WatchHive || {};
  WatchHive.Comments = Comments;
  
})();