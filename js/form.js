document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('bookingForm');
  if (!bookingForm) return;

  // Получаем параметры из URL (например, ?zone=vip&date=2025-05-20&time=10:00&seats=2&hours=3&total=1470)
  const urlParams = new URLSearchParams(window.location.search);

  // Проверяем, есть ли параметры
  if (urlParams.has('zone')) {
    const zone = urlParams.get('zone');
    const date = urlParams.get('date');
    const time = urlParams.get('time');
    const seats = urlParams.get('seats');
    const hours = urlParams.get('hours');
    const total = urlParams.get('total');

    // Подставляем значения в форму
    const zoneSelect = document.getElementById('bookZone');
    if (zoneSelect && zone) zoneSelect.value = zone;

    const dateInput = document.getElementById('bookDate');
    if (dateInput && date) dateInput.value = date;

    const timeInput = document.getElementById('bookTime');
    if (timeInput && time) timeInput.value = time;

    const seatsInput = document.getElementById('bookSeats');
    if (seatsInput && seats) seatsInput.value = seats;

    const hoursInput = document.getElementById('bookHours');
    if (hoursInput && hours) hoursInput.value = hours;

    // Показываем итоговую цену, если она есть
    if (total) {
      const totalDisplay = document.getElementById('bookingTotalDisplay');
      const totalPrice = document.getElementById('bookingTotalPrice');
      const hiddenTotal = document.getElementById('paramTotal');
      
      if (totalDisplay && totalPrice) {
        totalPrice.textContent = `${total} ₽`;
        totalDisplay.style.display = 'flex'; // Показываем блок
      }
      
      // Записываем в скрытое поле для отправки на сервер/в thanks.html
      if (hiddenTotal) hiddenTotal.value = total;
    }
  } else {
    // Если параметров нет (зашли напрямую), ставим сегодняшнюю дату
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('bookDate');
    if (dateInput) {
      dateInput.min = today;
      dateInput.value = today;
    }
  }

  // === ОБРАБОТКА ОТПРАВКИ И ВАЛИДАЦИЯ (для form_error) ===
  bookingForm.addEventListener('submit', (e) => {
    const phoneInput = document.getElementById('bookPhone');
    const phoneValue = phoneInput.value.replace(/\D/g, ''); // Оставляем только цифры

    // Если телефон короче 11 цифр — это ошибка
    if (phoneValue.length < 11) {
      e.preventDefault(); // Останавливаем отправку формы
      
      // Вызываем событие form_error для GA4
      if (typeof window.sendFormError === 'function') {
        window.sendFormError('phone', 'invalid_format');
      }

      // Визуально подсвечиваем поле и выводим ошибку (по ТЗ)
      phoneInput.style.borderColor = 'red';
      phoneInput.focus();
      
      // Если хочешь, можно добавить alert или вывод текста под полем. 
      // Пока просто подсветим рамку и остановим отправку.
      alert('Пожалуйста, введите корректный номер телефона (11 цифр).');
      return;
    }

    // Если ошибок нет — форма уходит на thanks.html (по умолчанию)
    // Событие generate_lead мы отправим из thanks.js, так как мы не используем fetch
  });
});