/**
 * WatchHive — Authentication Module
 * Авторизация: Google, VK, Demo
 */

(function() {
  'use strict';
  
  const Auth = {
    // Обновление UI авторизации
    updateUI: function() {
      const authButtons = document.getElementById('auth-buttons');
      const userProfile = document.getElementById('user-profile');
      const { currentUser, authProvider } = WatchHive.State;
      
      if (currentUser) {
        authButtons.style.display = 'none';
        userProfile.style.display = 'block';
        
        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('user-provider').textContent = 
          authProvider === 'google' ? 'Google' :
          authProvider === 'vk' ? 'ВКонтакте' : 'Демо-режим';
        
        const avatarEl = document.getElementById('user-avatar');
        if (currentUser.avatar) {
          avatarEl.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}">`;
        } else {
          avatarEl.innerHTML = `<i class="fas fa-user"></i>`;
          avatarEl.style.background = `linear-gradient(135deg, ${WatchHive.Utils.getRandomColor()}, ${WatchHive.Utils.getRandomColor()})`;
          avatarEl.textContent = currentUser.name.charAt(0).toUpperCase();
        }
        
        WatchHive.Favorites?.updateCount?.();
      } else {
        authButtons.style.display = 'flex';
        userProfile.style.display = 'none';
        WatchHive.Favorites?.updateCount?.();
      }
    },
    
    // Вход
    login: function(user, provider) {
      WatchHive.State.saveUser(user, provider);
      this.updateUI();
      WatchHive.Utils.showNotification(`🎉 Добро пожаловать, ${user.name}!`, 'success');
    },
    
    // Выход
    logout: function() {
      if (!confirm('Выйти из аккаунта?')) return;
      
      WatchHive.State.clearAuth();
      this.updateUI();
      WatchHive.Utils.showNotification('Вы вышли из аккаунта', 'info');
    },
    
    // ===== GOOGLE AUTH =====
    initGoogle: function() {
      if (typeof google === 'undefined') {
        console.warn('Google SDK not loaded');
        return;
      }
      
      const { GOOGLE_CLIENT_ID } = WatchHive.Config;
      if (GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.startsWith('YOUR_')) {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: this.handleGoogleCredential.bind(this),
          auto_select: false
        });
      }
    },
    
    handleGoogleCredential: function(response) {
      try {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        this.login({
          name: payload.name || payload.email?.split('@')[0] || 'Пользователь',
          email: payload.email,
          avatar: payload.picture
        }, 'google');
      } catch (e) {
        console.error('Google auth error:', e);
        WatchHive.Utils.showNotification('❌ Ошибка авторизации Google', 'error');
      }
    },
    
    // ===== VK AUTH =====
    initVK: function() {
      if (typeof VK === 'undefined') {
        console.warn('VK SDK not loaded');
        return;
      }
      
      const { VK_APP_ID } = WatchHive.Config;
      if (VK_APP_ID && VK_APP_ID !== 12345678) {
        VK.init({ apiId: VK_APP_ID, onlyWidgets: false });
      }
    },
    
    vkAuthCallback: function(response) {
      if (response.session) {
        VK.Api.call('users.get', { fields: 'photo_100' }, (r) => {
          if (r.response?.[0]) {
            const user = r.response[0];
            Auth.login({
              name: `${user.first_name} ${user.last_name}`.trim() || 'Пользователь',
              avatar: user.photo_100
            }, 'vk');
          }
        });
      } else if (response.error) {
        console.error('VK auth error:', response.error);
        WatchHive.Utils.showNotification('❌ Ошибка авторизации ВКонтакте', 'error');
      }
    },
    
    // ===== DEMO AUTH =====
    setupDemo: function() {
      const demoBtn = document.getElementById('demo-login');
      const demoLoginBtn = document.getElementById('demo-login-btn');
      const closeAuth = document.getElementById('close-auth');
      const modal = document.getElementById('auth-modal');
      const usernameInput = document.getElementById('demo-username');
      
      demoBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'block';
        usernameInput?.focus();
      });
      
      demoLoginBtn?.addEventListener('click', () => {
        const name = usernameInput?.value.trim();
        if (name) {
          this.login({ name, email: null, avatar: null }, 'demo');
          modal.style.display = 'none';
          if (usernameInput) usernameInput.value = '';
        } else {
          WatchHive.Utils.showNotification('Введите имя', 'error');
        }
      });
      
      closeAuth?.addEventListener('click', () => {
        modal.style.display = 'none';
      });
      
      window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
      });
    },
    
    // ===== INIT =====
    init: function() {
      this.updateUI();
      this.initGoogle();
      this.initVK();
      this.setupDemo();
      
      // Обработчики кнопок
      document.getElementById('google-signin')?.addEventListener('click', (e) => {
        e.preventDefault();
        const { GOOGLE_CLIENT_ID } = WatchHive.Config;
        if (GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.startsWith('YOUR_')) {
          google.accounts.id.prompt?.();
        } else {
          WatchHive.Utils.showNotification('⚠️ Настройте GOOGLE_CLIENT_ID в коде', 'error');
          // Fallback для демо
          this.login({ name: 'Google User', email: 'user@gmail.com', avatar: null }, 'google');
        }
      });
      
      document.getElementById('vk-signin')?.addEventListener('click', (e) => {
        e.preventDefault();
        const { VK_APP_ID } = WatchHive.Config;
        if (VK_APP_ID && VK_APP_ID !== 12345678) {
          VK.Auth.login?.(this.vkAuthCallback.bind(this), 'email');
        } else {
          WatchHive.Utils.showNotification('⚠️ Настройте VK_APP_ID в коде', 'error');
          // Fallback для демо
          this.login({ name: 'VK User', avatar: null }, 'vk');
        }
      });
      
      document.getElementById('logout-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }
  };
  
  // Экспорт
  window.WatchHive = window.WatchHive || {};
  WatchHive.Auth = Auth;
  
})();