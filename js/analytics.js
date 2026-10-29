document.addEventListener('DOMContentLoaded', () => {
  
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
    // Ищем ближайший родительский элемент с атрибутом data-event
    const target = e.target.closest('[data-event]');
    if (!target) return;

    const eventName = target.getAttribute('data-event');
    
    // Собираем все data-атрибуты элемента в объект параметров
    // Например: data-button-name="hero" станет button_name: "hero"
    const params = {};
    for (const attr of target.attributes) {
      if (attr.name.startsWith('data-') && attr.name !== 'data-event') {
        // Превращаем data-button-name в button_name (snake_case)
        const paramName = attr.name.replace('data-', '').replace(/-/g, '_');
        params[paramName] = attr.value;
      }
    }

    // Отправляем событие
    sendEvent(eventName, params);
  });

  // =========================================================================
  // СПЕЦИАЛЬНЫЕ СОБЫТИЯ
  // =========================================================================

  // Событие 7: generate_lead (Ключевое)
  // Отправляется ТОЛЬКО после успешного ответа сервера (ok: true)
  // Вызывается из формы (forms.js), поэтому мы экспортируем функцию наружу
  window.sendGenerateLead = function(leadType, leadZone, value) {
    sendEvent('generate_lead', {
      lead_type: leadType, // booking или tournament
      lead_zone: leadZone, // standard, vip, bootcamp, ps5
      value: value,        // Сумма
      currency: 'RUB'
    });
  };

  // Событие 9: zone_view (Клик по карточке зоны)
  // Навешиваем на карточки зон отдельно (чтобы не срабатывало на каждый клик)
  document.querySelectorAll('.zone-card, .zone-detail-card').forEach(card => {
    card.addEventListener('click', function(e) {
      // Если кликнули по кнопке "Забронировать" внутри карточки, не шлем zone_view (там сработает cta_click)
      if (e.target.closest('.btn')) return; 
      
      const zoneId = this.id || this.getAttribute('href')?.split('#')[1] || 'unknown';
      sendEvent('zone_view', { zone: zoneId });
    });
  });

  // Событие 10: booking_calc (Расчет в калькуляторе)
  // Вызываем из calculator.js при каждом изменении полей
  window.sendBookingCalc = function(zone, seats, hours, timeBand, totalPrice) {
    sendEvent('booking_calc', {
      zone: zone,
      seats: seats,
      hours: hours,
      time_band: timeBand, // weekday_day, weekday_evening, weekend, night
      total_price: totalPrice
    });
  };

  // Событие 12: game_search (Поиск игры)
  // ТЗ требует отправлять через 1 секунду после ввода
  let searchTimeout;
  const searchInput = document.getElementById('gameSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const term = e.target.value.trim();
        if (term.length > 0) {
          const resultsCount = document.querySelectorAll('.game-card[style*="display: flex"], .game-card:not([style*="display: none"])').length;
          sendEvent('game_search', {
            search_term: term,
            results_count: resultsCount
          });
        }
      }, 1000); // Задержка 1 секунда
    });
  }

  // Событие 14: reaction_test_complete (Пятая попытка теста)
  // Вызываем из reaction-game.js после 5-й попытки
  window.sendReactionComplete = function(reactionMs) {
    sendEvent('reaction_test_complete', {
      reaction_ms: reactionMs
    });
  };

  // Событие 18: form_error (Ошибка формы)
  // Вызываем из forms.js при ошибке валидации
  window.sendFormError = function(fieldName, errorType) {
    sendEvent('form_error', {
      field_name: fieldName,
      error_type: errorType
    });
  };

    // =========================================================================
  // СОБЫТИЕ 13: tournament_view (Просмотр турнира)
  // =========================================================================
  const tournamentLinks = document.querySelectorAll('a[href*="tournament.html"]');
  tournamentLinks.forEach(link => {
    link.addEventListener('click', () => {
      sendEvent('tournament_view', {
        tournament_id: 'winter_cup_2026' // ID турнира
      });
    });
  });

  // =========================================================================
  // СОБЫТИЕ 20: video_play (Запуск видео)
  // =========================================================================
  const clubVideo = document.getElementById('clubVideo');
  if (clubVideo) {
    let videoStarted = false; // Флаг, чтобы не отправлять событие при паузе/возобновлении
    clubVideo.addEventListener('play', () => {
      if (!videoStarted) {
        sendEvent('video_play', {
          video_title: 'Атмосфера клуба' // Название видео
        });
        videoStarted = true;
      }
    });
  }

});