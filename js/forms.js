document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('bookingForm');
  if (!bookingForm) return;

  // Твоя ссылка от Apps Script
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQvo-QUbqv-ksTQgPxTQG6-JrtBk5XtzeLlxQEiV5hR-2hi9RNX_dyth5hA5mFAd_M/exec';

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

  // === ОТПРАВКА ФОРМЫ В GOOGLE ТАБЛИЦУ ===
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

    // Скрываем старую ошибку, если она была
    let errorBox = document.getElementById('formErrorBox');
    if (errorBox) errorBox.style.display = 'none';

    // Генерируем request_id (упрощенный UUID)
    const reqId = 'REQ-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }).toUpperCase();

    // Собираем данные из формы (используем FormData)
    const formData = new FormData(bookingForm);
    const data = new URLSearchParams(formData); 

    // Добавляем обязательные поля
    data.append('request_id', reqId);
    data.append('lead_type', 'booking');
    
    // === ДОБАВЛЯЕМ SLOT (ДАТА + ВРЕМЯ) ===
    const dateVal = document.getElementById('bookDate').value;
    const timeVal = document.getElementById('bookTime').value;
    const finalTime = timeVal || '00:00'; // Если время не выбрано, ставим полночь
    if (dateVal) {
      data.append('slot', `${dateVal} ${finalTime}`);
    }

    // Добавляем UTM-метки
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
    utmKeys.forEach(key => {
      const val = sessionStorage.getItem(key);
      if (val) data.append(key, val);
    });

    // Отправляем
    fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: data
    })
    .then(response => response.json())
    .then(resData => {
      console.log('Ответ от Apps Script:', resData);

      if (resData.ok) {
        // ВСЁ УСПЕШНО
        if (typeof window.sendGenerateLead === 'function') {
          const zone = document.getElementById('bookZone').value;
          const total = document.getElementById('paramTotal').value || 0;
          window.sendGenerateLead('booking', zone, total);
        }
        
        const params = new URLSearchParams();
        params.append('zone', document.getElementById('bookZone').value);
        params.append('date', dateVal);
        params.append('time', timeVal);
        params.append('total', document.getElementById('paramTotal').value || '0');
        
        window.location.href = `thanks.html?${params.toString()}`;
      } else {
        // ОШИБКА СЕРВЕРА (БЕЗ ALERT)
        console.error("Ошибка сервера Apps Script:", resData);
        
        if (!errorBox) {
          errorBox = document.createElement('div');
          errorBox.id = 'formErrorBox';
          errorBox.style.color = '#ff4d4d';
          errorBox.style.marginTop = '10px';
          errorBox.style.fontSize = '14px';
          submitBtn.parentNode.insertBefore(errorBox, submitBtn);
        }
        errorBox.textContent = 'Произошла ошибка при отправке. Пожалуйста, проверьте данные.';
        errorBox.style.display = 'block';
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    })
    .catch(error => {
      // ОШИБКА СЕТИ
      console.error('Ошибка сети/CORS:', error);
      
      if (!errorBox) {
        errorBox = document.createElement('div');
        errorBox.id = 'formErrorBox';
        errorBox.style.color = '#ff4d4d';
        errorBox.style.marginTop = '10px';
        errorBox.style.fontSize = '14px';
        submitBtn.parentNode.insertBefore(errorBox, submitBtn);
      }
      errorBox.textContent = 'Ошибка соединения. Проверьте интернет и попробуйте снова.';
      errorBox.style.display = 'block';
      
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
  });
});