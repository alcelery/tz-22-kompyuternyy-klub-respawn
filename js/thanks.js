document.addEventListener('DOMContentLoaded', () => {
  // Получаем параметры из URL
  const urlParams = new URLSearchParams(window.location.search);
  
  // Элементы для вывода
  const ticketNumber = document.getElementById('ticketNumber');
  const ticketZone = document.getElementById('ticketZone');
  const ticketTime = document.getElementById('ticketTime');
  const ticketPrice = document.getElementById('ticketPrice');

  // 1. Генерируем номер брони (например, RSP-4821)
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const bookingNum = `RSP-${randomNum}`;
  if (ticketNumber) ticketNumber.textContent = bookingNum;

  // 2. Получаем данные из URL
  const zone = urlParams.get('zone') || urlParams.get('zone_display');
  const date = urlParams.get('date');
  const time = urlParams.get('time');
  const type = urlParams.get('type'); // booking, package, tournament
  const total = urlParams.get('total');

  // Перевод названий зон на русский
  const zoneNames = {
    'standard': 'Стандарт',
    'vip': 'VIP',
    'console': 'Консоли',
    'ps5': 'PlayStation 5',
    'bootcamp': 'Bootcamp',
    'night': 'Ночной пакет'
  };

  // Подставляем зону
  if (ticketZone) {
    if (type === 'tournament') {
      ticketZone.textContent = 'Турнир «Зимний кубок» (CS2)';
    } else if (zone && zoneNames[zone]) {
      ticketZone.textContent = zoneNames[zone];
    } else if (zone) {
      ticketZone.textContent = zone;
    }
  }

  // Подставляем дату и время
  if (ticketTime) {
    if (date && time) {
      const dateParts = date.split('-');
      const formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
      ticketTime.textContent = `${formattedDate} в ${time}`;
    } else if (date) {
      ticketTime.textContent = date;
    } else {
      ticketTime.textContent = 'Сегодня (уточните время у администратора)';
    }
  }

  // Подставляем цену
  if (ticketPrice && total) {
    ticketPrice.textContent = `${total} ₽`;
  }

    // === ОТПРАВКА СОБЫТИЯ generate_lead ===
  if (zone || type) {
    let leadType = 'booking';
    if (type === 'tournament') {
      leadType = 'tournament';
    }

    const leadZone = zone || 'unknown';
    const leadTotal = total || 0;

    // Функция, которая будет пытаться отправить событие
    const trySendLead = () => {
      if (typeof window.sendGenerateLead === 'function') {
        window.sendGenerateLead(leadType, leadZone, leadTotal);
        console.log(`[Thanks] generate_lead УСПЕШНО отправлен (Тип: ${leadType}, Зона: ${leadZone}, Сумма: ${leadTotal})`);
        return true; // Успех
      }
      return false; // Еще не загрузилось
    };

    // Если функция уже есть, отправляем сразу
    if (!trySendLead()) {
      // Если нет — делаем 5 попыток с интервалом в 200мс
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (trySendLead() || attempts >= 5) {
          clearInterval(interval);
          if (attempts >= 5) {
            console.error('[Thanks] Не удалось найти sendGenerateLead после 5 попыток. Проверь analytics.js');
          }
        }
      }, 200);
    }
  } else {
    console.log('[Thanks] Страница открыта напрямую, событие не отправлено.');
  }
});