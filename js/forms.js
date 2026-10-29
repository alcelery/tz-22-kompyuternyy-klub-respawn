document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('bookingForm');
  if (!bookingForm) {
    console.warn('[Forms] Форма bookingForm не найдена на странице');
    return;
  }

  console.log('[Forms] Форма найдена, скрипт работает');

  const urlParams = new URLSearchParams(window.location.search);

  // Подстановка параметров из URL
  if (urlParams.has('zone')) {
    const zone = urlParams.get('zone');
    const date = urlParams.get('date');
    const time = urlParams.get('time');
    const seats = urlParams.get('seats');
    const hours = urlParams.get('hours');
    const total = urlParams.get('total');

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

    if (total) {
      const totalDisplay = document.getElementById('bookingTotalDisplay');
      const totalPrice = document.getElementById('bookingTotalPrice');
      const hiddenTotal = document.getElementById('paramTotal');
      
      if (totalDisplay && totalPrice) {
        totalPrice.textContent = `${total} ₽`;
        totalDisplay.style.display = 'flex';
      }
      if (hiddenTotal) hiddenTotal.value = total;
    }
  } else {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('bookDate');
    if (dateInput) {
      dateInput.min = today;
      dateInput.value = today;
    }
  }

  // === ПЕРЕХВАТ ОТПРАВКИ ФОРМЫ ===
  bookingForm.addEventListener('submit', (e) => {
    console.log('[Forms] Событие submit перехвачено');
    
    // Предотвращаем стандартную отправку, чтобы проверить данные
    e.preventDefault();

    const phoneInput = document.getElementById('bookPhone');
    const phoneValue = phoneInput.value.replace(/\D/g, ''); // Оставляем только цифры

    // 1. Проверка на ошибку (телефон < 11 цифр)
    if (phoneValue.length < 11) {
      console.warn('[Forms] Ошибка валидации: короткий телефон');
      
      // Отправляем form_error
      if (typeof window.sendFormError === 'function') {
        window.sendFormError('phone', 'invalid_format');
        console.log('[Forms] Событие form_error отправлено');
      } else {
        console.error('[Forms] Функция sendFormError не найдена!');
      }

      // Визуально подсвечиваем
      phoneInput.style.borderColor = 'red';
      phoneInput.focus();
      
      // Убираем красную рамку через 3 секунды
      setTimeout(() => { phoneInput.style.borderColor = ''; }, 3000);
      return;
    }

    // 2. Если ошибок нет — отправляем generate_lead
    console.log('[Forms] Валидация пройдена, отправляем generate_lead');
    
    if (typeof window.sendGenerateLead === 'function') {
      const zone = document.getElementById('bookZone').value;
      const total = document.getElementById('paramTotal').value || 0;
      
      // Отправляем событие
      window.sendGenerateLead('booking', zone, total);
      console.log('[Forms] Событие generate_lead отправлено');
    } else {
      console.error('[Forms] Функция sendGenerateLead не найдена!');
    }

    // 3. Отправляем форму вручную с задержкой, чтобы GA4 успел отправить запрос
    setTimeout(() => {
      bookingForm.submit();
    }, 300);
  });
});