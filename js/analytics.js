document.addEventListener('DOMContentLoaded', () => {
  
  // =========================================================================
  // 1. ПЕРЕХВАТ И СОХРАНЕНИЕ UTM-МЕТОК
  // =========================================================================
  const urlParams = new URLSearchParams(window.location.search);
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  
  utmKeys.forEach(key => {
    if (urlParams.has(key)) {
      sessionStorage.setItem(key, urlParams.get(key));
    }
  });

  // Функция для получения меток (для использования в других скриптах)
  window.getUtmParams = function() {
    const params = {};
    utmKeys.forEach(key => {
      const val = urlParams.get(key) || sessionStorage.getItem(key);
      if (val) params[key] = val;
    });
    return params;
  };

  // Вспомогательная функция для безопасной отправки события
  function sendEvent(eventName, params = {}) {
    if (typeof gtag === 'function') {
      const cleanParams = {};
      for (const key in params) {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          cleanParams[key] = String(params[key]).substring(0, 100);
        }
      }
      
      // Автоматически добавляем UTM-метки
      const utms = window.getUtmParams();
      Object.assign(cleanParams, utms);

      gtag('event', eventName, cleanParams);
      console.log(`[GA4] Отправлено событие: ${eventName}`, cleanParams);
    } else {
      console.warn(`[GA4] gtag не найден. Событие ${eventName} не отправлено.`);
    }
  }

  // =========================================================================
  // 2. ОБРАБОТЧИКИ (без изменений)
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

  window.sendGenerateLead = function(leadType, leadZone, value) {
    sendEvent('generate_lead', {
      lead_type: leadType,
      lead_zone: leadZone,
      value: value,
      currency: 'RUB'
    });
  };

  window.sendBookingCalc = function(zone, seats, hours, timeBand, totalPrice) {
    sendEvent('booking_calc', {
      zone: zone,
      seats: seats,
      hours: hours,
      time_band: timeBand,
      total_price: totalPrice
    });
  };

  window.sendFormError = function(fieldName, errorType) {
    sendEvent('form_error', {
      field_name: fieldName,
      error_type: errorType
    });
  };

  window.sendReactionComplete = function(reactionMs) {
    sendEvent('reaction_test_complete', { reaction_ms: reactionMs });
  };

  document.querySelectorAll('.zone-card, .zone-detail-card').forEach(card => {
    card.addEventListener('click', function(e) {
      if (e.target.closest('.btn')) return; 
      const zoneId = this.id || this.getAttribute('href')?.split('#')[1] || 'unknown';
      sendEvent('zone_view', { zone: zoneId });
    });
  });

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

  document.querySelectorAll('a[href*="tournament.html"]').forEach(link => {
    link.addEventListener('click', () => {
      sendEvent('tournament_view', { tournament_id: 'winter_cup_2026' });
    });
  });

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

});