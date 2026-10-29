document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('bookingForm');
  if (!bookingForm) return;

  // Получаем параметры из URL
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

  // === ОТПРАВКА ФОРМЫ И СОБЫТИЕ generate_lead ===
  bookingForm.addEventListener('submit', (e) => {
    // Поскольку форма отправляется методом GET на thanks.html, 
    // мы перехватываем отправку, шлем событие и переходим.
    // (Если в будущем будете делать отправку через fetch, логика та же).
    
    const zone = document.getElementById('bookZone').value;
    const total = document.getElementById('paramTotal').value || 0;

    // Отправляем событие generate_lead
    if (typeof window.sendGenerateLead === 'function') {
      window.sendGenerateLead('booking', zone, total);
    }

    // Даем аналитике долю секунды, чтобы отправить запрос, и переходим
    // (Обычно gtag успевает отправить событие через beacon transport)
  });
});