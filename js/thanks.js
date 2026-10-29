document.addEventListener('DOMContentLoaded', () => {
  // Получаем параметры из URL
  const urlParams = new URLSearchParams(window.location.search);
  
  // Элементы для вывода
  const ticketNumber = document.getElementById('ticketNumber');
  const ticketZone = document.getElementById('ticketZone');
  const ticketTime = document.getElementById('ticketTime');

  // 1. Генерируем номер брони (например, RSP-4821)
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const bookingNum = `RSP-${randomNum}`;
  if (ticketNumber) ticketNumber.textContent = bookingNum;

  // 2. Получаем данные из URL
  const zone = urlParams.get('zone') || urlParams.get('zone_display');
  const date = urlParams.get('date');
  const time = urlParams.get('time');
  const type = urlParams.get('type'); // Для турниров

  // Перевод названий зон на русский
  const zoneNames = {
    'standard': 'Стандарт',
    'vip': 'VIP',
    'console': 'Консоли',
    'night': 'Ночной пакет'
  };

  // Подставляем зону
  if (ticketZone) {
    if (type === 'tournament') {
      ticketZone.textContent = 'Турнир «Зимний кубок» (CS2)';
    } else if (zone && zoneNames[zone]) {
      ticketZone.textContent = zoneNames[zone];
    } else if (zone) {
      ticketZone.textContent = zone; // Если пришло что-то нестандартное
    }
  }

  // Подставляем дату и время
  if (ticketTime) {
    if (date && time) {
      // Форматируем дату из YYYY-MM-DD в DD.MM.YYYY
      const dateParts = date.split('-');
      const formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
      ticketTime.textContent = `${formattedDate} в ${time}`;
    } else if (date) {
      ticketTime.textContent = date;
    } else {
      ticketTime.textContent = 'Сегодня (уточните время у администратора)';
    }
  }
  
  // ... в конце функции document.addEventListener('DOMContentLoaded', () => { ...

  const ticketPrice = document.getElementById('ticketPrice');
  const totalPrice = urlParams.get('total');

  if (ticketPrice && totalPrice) {
    ticketPrice.textContent = `${totalPrice} ₽`;
  }
});
