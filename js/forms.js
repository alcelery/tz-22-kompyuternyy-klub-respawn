document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('bookingForm');
  if (!bookingForm) return;

  // ВСТАВЬ СЮДА СВОЮ ССЫЛКУ ОТ APPS SCRIPT:
  const SCRIPT_URL = 'https://script.google.com/macros/s/ТВОЙ_ДЛИННЫЙ_КОД/exec';

  const urlParams = new URLSearchParams(window.location.search);

  // Подстановка параметров из URL (как было)
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

  // === ОТПРАВКА ФОРМЫ В GOOGLE ТАБЛИЦУ (ИСПРАВЛЕНО) ===
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Останавливаем стандартный переход

    const phoneInput = document.getElementById('bookPhone');
    const phoneValue = phoneInput.value.replace(/\D/g, '');

    // Проверка телефона
    if (phoneValue.length < 11) {
      if (typeof window.sendFormError === 'function') {
        window.sendFormError('phone', 'invalid_format');
      }
      phoneInput.style.borderColor = 'red';
      phoneInput.focus();
      setTimeout(() => { phoneInput.style.borderColor = ''; }, 3000);
      return;
    }

    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;

    // Генерируем request_id (упрощенный UUID)
    const reqId = 'REQ-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }).toUpperCase();

    // Собираем данные вручную (НЕ через FormData, чтобы Apps Script понял)
    const formData = new FormData(bookingForm);
    const data = new URLSearchParams(formData); // <--- ВОТ ГЛАВНОЕ ИСПРАВЛЕНИЕ

    // Добавляем обязательные поля для Apps Script
    data.append('request_id', reqId);
    data.append('lead_type', 'booking');
    
    // Добавляем UTM-метки
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
    utmKeys.forEach(key => {
      const val = sessionStorage.getItem(key);
      if (val) data.append(key, val);
    });

    // Отправляем
    fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Важно для Apps Script
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded' // <--- ВАЖНО
      },
      body: data
    })
    .then(() => {
      // Режим no-cors не дает прочитать ответ, поэтому просто считаем, что всё ок
      if (typeof window.sendGenerateLead === 'function') {
        const zone = document.getElementById('bookZone').value;
        const total = document.getElementById('paramTotal').value || 0;
        window.sendGenerateLead('booking', zone, total);
      }
      
      const params = new URLSearchParams();
      params.append('zone', document.getElementById('bookZone').value);
      params.append('date', document.getElementById('bookDate').value);
      params.append('time', document.getElementById('bookTime').value);
      params.append('total', document.getElementById('paramTotal').value || '0');
      
      window.location.href = `thanks.html?${params.toString()}`;
    })
    .catch(error => {
      console.error('Ошибка сети:', error);
      alert('Ошибка соединения. Проверьте интернет.');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
  });
});