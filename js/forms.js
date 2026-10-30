document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('bookingForm');
  if (!bookingForm) {
    console.warn('[Forms] Форма bookingForm не найдена на странице');
    return;
  }

  console.log('[Forms] Форма найдена, скрипт работает');

  // === 1. ДОБАВЛЯЕМ СКРЫТЫЕ ПОЛЯ С UTM-МЕТКАМИ В ФОРМУ ===
  if (typeof window.getUtmParams === 'function') {
    const utms = window.getUtmParams();
    for (const key in utms) {
      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.name = key;
      hiddenInput.value = utms[key];
      bookingForm.appendChild(hiddenInput);
      console.log(`[Forms] Добавлено скрытое поле: ${key} = ${utms[key]}`);
    }
  }

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

  // === 2. ВАЛИДАЦИЯ И ОТПРАВКА (БЕЗ ПЕРЕХВАТА) ===
  bookingForm.addEventListener('submit', (e) => {
    const phoneInput = document.getElementById('bookPhone');
    const phoneValue = phoneInput.value.replace(/\D/g, '');

    // Проверка на ошибку (телефон < 11 цифр)
    if (phoneValue.length < 11) {
      e.preventDefault(); // Останавливаем отправку только при ошибке
      
      if (typeof window.sendFormError === 'function') {
        window.sendFormError('phone', 'invalid_format');
      }

      phoneInput.style.borderColor = 'red';
      phoneInput.focus();
      setTimeout(() => { phoneInput.style.borderColor = ''; }, 3000);
      return;
    }

    // Если ошибок нет, отправляем generate_lead
    if (typeof window.sendGenerateLead === 'function') {
      const zone = document.getElementById('bookZone').value;
      const total = document.getElementById('paramTotal').value || 0;
      window.sendGenerateLead('booking', zone, total);
      console.log('[Forms] Событие generate_lead отправлено');
    }
    
    // Форма отправится сама, так как мы НЕ вызываем e.preventDefault()
  });
});