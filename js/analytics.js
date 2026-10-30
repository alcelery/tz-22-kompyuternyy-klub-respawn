document.addEventListener('DOMContentLoaded', () => {
  
  // =========================================================================
  // 1. ПЕРЕХВАТ И СОХРАНЕНИЕ UTM-МЕТОК
  // =========================================================================
  const urlParams = new URLSearchParams(window.location.search);
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  
  // Если в URL есть метки, сохраняем их в sessionStorage
  utmKeys.forEach(key => {
    if (urlParams.has(key)) {
      sessionStorage.setItem(key, urlParams.get(key));
    }
  });

  // Функция для получения метки (сначала смотрим в URL, потом в хранилище)
  function getUtmParam(key) {
    return urlParams.get(key) || sessionStorage.getItem(key) || '';
  }

  // Вспомогательная функция для безопасной отправки события
  function sendEvent(eventName, params = {}) {
    if (typeof gtag === 'function') {
      // Очищаем параметры от undefined/null, чтобы не отправлять мусор
      const cleanParams = {};
      for (const key in params) {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          cleanParams[key] = String(params[key]).substring(0, 100); // Ограничение в 100 символов
        }
      }
      
      // Автоматически добавляем UTM-метки к каждому событию в GA4
      const utmSource = getUtmParam('utm_source');
      if (utmSource) {
        cleanParams.utm_source = utmSource;
        cleanParams.utm_medium = getUtmParam('utm_medium');
        cleanParams.utm_campaign = getUtmParam('utm_campaign');
        cleanParams.utm_content = getUtmParam('utm_content');
      }

      gtag('event', eventName, cleanParams);
      console.log(`[GA4] Отправлено событие: ${eventName}`, cleanParams); // Для отладки в консоли
    } else {
      console.warn(`[GA4] gtag не найден. Событие ${eventName} не отправлено.`);
    }
  }

  // =========================================================================
  // УНИВЕРСАЛЬНЫЙ ОБРАБОТЧИК КЛИКОВ (События 8, 10, 11, 13, 15, 16, 17, 19)
  // =========================================================================
  document.body.addEventListener('click', (e) => {
    const target = e.target.closest('[data-event]');
    if (!target) return;

    const eventName = target.getAttribute('data-event');
    const params = {};
    for (const attr of target.attributes) {
      if (attr.name.startsWith('data-') && attr.name !== 'data-event') {
        const paramName = attr.name.replace('data-', '').replace(/-/g, '_');
        params[paramName] = attr.value;
      }
    }
    sendEvent(eventName, params);
  });

  // =========================================================================
  // СПЕЦИАЛЬНЫЕ СОБЫТИЯ
  // =========================================================================

  // Событие 7: generate_lead (Ключевое)
  window.sendGenerateLead = function(leadType, leadZone, value) {
    sendEvent('generate_lead', {
      lead_type: leadType,
      lead_zone: leadZone,
      value: value,
      currency: 'RUB'
    });
  };

  // Событие 9: zone_view
  document.querySelectorAll('.zone-card, .zone-detail-card').forEach(card => {
    card.addEventListener('click', function(e) {
      if (e.target.closest('.btn')) return; 
      const zoneId = this.id || this.getAttribute('href')?.split('#')[1] || 'unknown';
      sendEvent('zone_view', { zone: zoneId });
    });
  });

  // Событие 10: booking_calc
  window.sendBookingCalc = function(zone, seats, hours, timeBand, totalPrice) {
    sendEvent('booking_calc', {
      zone: zone,
      seats: seats,
      hours: hours,
      time_band: timeBand,
      total_price: totalPrice
    });
  };

  // Событие 12: game_search
  let searchTimeout;
  const searchInput = document.getElementById('gameSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const term = e.target.value.trim();
        if (term.length > 0) {
          const resultsCount = document.querySelectorAll('.game-card[style*="display: flex"], .game-card:not([style*="display: none"])').length;
          sendEvent('game_search', { search_term: term, results_count: resultsCount });
        }
      }, 1000);
    });
  }

  // Событие 14: reaction_test_complete
  window.sendReactionComplete = function(reactionMs) {
    sendEvent('reaction_test_complete', { reaction_ms: reactionMs });
  };

  // Событие 18: form_error
  window.sendFormError = function(fieldName, errorType) {
    sendEvent('form_error', { field_name: fieldName, error_type: errorType });
  };

  // Событие 13: tournament_view
  document.querySelectorAll('a[href*="tournament.html"]').forEach(link => {
    link.addEventListener('click', () => {
      sendEvent('tournament_view', { tournament_id: 'winter_cup_2026' });
    });
  });

  // Событие 20: video_play
  const clubVideo = document.getElementById('clubVideo');
  if (clubVideo) {
    let videoStarted = false;
    clubVideo.addEventListener('play', () => {
      if (!videoStarted) {
        sendEvent('video_play', { video_title: 'Атмосфера клуба' });
        videoStarted = true;
      }
    });
  }

  // =========================================================================
  // 3. ДОБАВЛЕНИЕ UTM-МЕТОК ВО ВСЕ ФОРМЫ
  // =========================================================================
  document.querySelectorAll('form').forEach(form => {
    utmKeys.forEach(key => {
      const value = getUtmParam(key);
      if (value) {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = key;
        hiddenInput.value = value;
        form.appendChild(hiddenInput);
      }
    });
  });

});