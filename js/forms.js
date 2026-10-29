document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('bookingForm');
  if (!bookingForm) return;

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

  // === ОБРАБОТКА ОТПРАВКИ И АНАЛИТИКА ===
  bookingForm.addEventListener('submit', (e) => {
    const phoneInput = document.getElementById('bookPhone');
    const phoneValue = phoneInput.value.replace(/\D/g, '');

    // Ошибка: телефон короче 11 цифр
    if (phoneValue.length < 11) {
      e.preventDefault(); // Останавливаем отправку
      
      // 1. Отправляем form_error
      if (typeof window.sendFormError === 'function') {
        window.sendFormError('phone', 'invalid_format');
      }

      // Визуальная подсветка
      phoneInput.style.borderColor = 'red';
      phoneInput.focus();
      alert('Пожалуйста, введите корректный номер телефона.');
      return;
    }

    // Ошибок нет — отправляем generate_lead
    if (typeof window.sendGenerateLead === 'function') {
      const zone = document.getElementById('bookZone').value;
      const total = document.getElementById('paramTotal').value || 0;
      
      // Передаем тип 'booking', зону и сумму
      window.sendGenerateLead('booking', zone, total);
    }

    // Форма уходит на thanks.html своим ходом (по action="thanks.html")
  });
});