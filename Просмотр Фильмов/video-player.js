/**
 * WatchHive — Video Player Module
 * Управление видеоплеером и модальным окном
 */

(function() {
  'use strict';
  
  const { Config, Utils, State, API, Comments } = WatchHive;
  
  const VideoPlayer = {
    // Открытие модального окна
    openModal: async function(id, type, title, rating = '0.0', year = '') {
      const modal = document.getElementById('video-modal');
      const player = document.getElementById('video-player');
      
      if (!modal || !player) return;
      
      // Сброс вкладок на "Описание"
      document.querySelectorAll('.comments-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.comments-container').forEach(c => c.classList.remove('active'));
      document.querySelector('.comments-tab[data-tab="description"]')?.classList.add('active');
      document.getElementById('tab-description')?.classList.add('active');
      document.getElementById('comments-count')?.style.setProperty('display', 'none');
      
      // Сброс Disqus
      Comments.cleanup();
      
      try {
        // Параллельная загрузка данных и видео
        const [infoData, videoData] = await Promise.all([
          API.fetchDetails(id, type),
          API.fetchVideos(id, type)
        ]);
        
        // Сохранение информации
        State.currentMediaInfo = { id, type, title, rating, year, data: infoData };
        
        // Заполнение UI
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-rating').innerHTML = `★ ${rating}`;
        document.getElementById('modal-year').textContent = `📅 ${year}`;
        
        const poster = Utils.getPosterUrl(infoData.poster_path);
        const posterEl = document.getElementById('modal-poster');
        posterEl.src = poster;
        posterEl.onerror = () => posterEl.src = 'https://via.placeholder.com/200x300?text=Нет+изображения';
        
        const overview = infoData.overview || 'Описание недоступно.';
        document.getElementById('modal-description').textContent = 
          overview.length > 150 ? overview.slice(0, 150) + '...' : overview;
        document.getElementById('modal-description-full').textContent = overview;
        
        document.getElementById('modal-duration').textContent = 
          type === 'movie' 
            ? `⏱ ${infoData.runtime || '?'} мин` 
            : `📺 ${infoData.number_of_seasons || '?'} сез.`;
        
        document.getElementById('modal-genres').textContent = 
          `🎭 ${infoData.genres?.map(g => g.name).join(', ') || 'Не указаны'}`;
        
        // Видео (заглушка — TMDB не предоставляет прямые ссылки)
        player.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        player.load();
        
        Utils.showNotification(`🎬 "${title}" готов к просмотру`, 'success');
        
      } catch (error) {
        console.error('Ошибка загрузки:', error);
        Utils.showNotification('❌ Ошибка загрузки', 'error');
        
        // Fallback UI
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-description').textContent = 'Информация временно недоступна.';
        document.getElementById('modal-description-full').textContent = 'Информация временно недоступна.';
        player.src = '';
      }
      
      // Показ модального окна
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
      
      // Инициализация
      this.initControls();
      Comments.init();
    },
    
    // Закрытие модального окна
    closeModal: function() {
      const modal = document.getElementById('video-modal');
      const player = document.getElementById('video-player');
      
      if (!modal) return;
      
      modal.style.display = 'none';
      document.body.style.overflow = '';
      
      if (player) {
        player.pause();
        player.src = '';
      }
      
      Comments.cleanup();
      State.currentMediaInfo = null;
    },
    
    // Инициализация элементов управления
    initControls: function() {
      const player = document.getElementById('video-player');
      if (!player) return;
      
      State.videoPlayer = player;
      
      // Play/Pause
      const playPauseBtn = document.getElementById('play-pause');
      const togglePlay = () => {
        if (player.paused || player.ended) {
          player.play().catch(() => Utils.showNotification('⚠️ Кликните по видео для запуска', 'error'));
        } else {
          player.pause();
        }
      };
      
      playPauseBtn?.addEventListener('click', togglePlay);
      player.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
      
      // Обновление иконки
      player.addEventListener('play', () => {
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
      });
      player.addEventListener('pause', () => {
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
      });
      
      // Прогресс
      const progressBar = document.getElementById('progress-bar');
      const progressContainer = document.getElementById('progress-container');
      const timeDisplay = document.getElementById('time-display');
      
      player.addEventListener('timeupdate', () => {
        if (player.duration && !isNaN(player.duration)) {
          const pct = (player.currentTime / player.duration) * 100;
          if (progressBar) progressBar.style.width = `${pct}%`;
          if (timeDisplay) {
            timeDisplay.textContent = `${Utils.formatTime(player.currentTime)} / ${Utils.formatTime(player.duration)}`;
          }
        }
      });
      
      progressContainer?.addEventListener('click', (e) => {
        if (player.duration) {
          const rect = progressContainer.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          player.currentTime = pct * player.duration;
        }
      });
      
      // Громкость
      const volumeBtn = document.getElementById('volume-btn');
      const volumeSlider = document.getElementById('volume-slider');
      
      const updateVolumeIcon = () => {
        if (!volumeBtn) return;
        const icon = player.muted || player.volume === 0 ? 'volume-mute' :
                     player.volume < 0.5 ? 'volume-down' : 'volume-up';
        volumeBtn.innerHTML = `<i class="fas fa-${icon}"></i>`;
      };
      
      volumeBtn?.addEventListener('click', () => {
        player.muted = !player.muted;
        updateVolumeIcon();
      });
      
      volumeSlider?.addEventListener('input', () => {
        player.volume = volumeSlider.value;
        player.muted = false;
        updateVolumeIcon();
      });
      
      // Инициализация
      if (volumeSlider) volumeSlider.value = player.volume;
      updateVolumeIcon();
      
      // Полноэкранный режим
      document.getElementById('fullscreen-btn')?.addEventListener('click', () => {
        const container = document.querySelector('.video-player-container');
        if (!container) return;
        
        if (!document.fullscreenElement) {
          container.requestFullscreen?.() || 
          container.mozRequestFullScreen?.() ||
          container.webkitRequestFullscreen?.() || 
          container.msRequestFullscreen?.();
        } else {
          document.exitFullscreen?.() || 
          document.mozCancelFullScreen?.() ||
          document.webkitExitFullscreen?.() || 
          document.msExitFullscreen?.();
        }
      });
      
      // Закрытие
      const closeBtn = document.querySelector('#video-modal .close-modal');
      closeBtn?.addEventListener('click', () => this.closeModal());
      
      document.getElementById('video-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'video-modal') this.closeModal();
      });
      
      // ESC
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.style.display === 'block') {
          if (document.fullscreenElement) {
            document.exitFullscreen?.();
          } else {
            this.closeModal();
          }
        }
      });
    }
  };
  
  // Экспорт
  window.WatchHive = window.WatchHive || {};
  WatchHive.VideoPlayer = VideoPlayer;
  
})();