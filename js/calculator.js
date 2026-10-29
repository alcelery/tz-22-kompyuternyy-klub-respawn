document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('priceCalculator');
  if (!form) return;

  const zoneSelect = document.getElementById('calcZone');
  const dateInput = document.getElementById('calcDate');
  const timeInput = document.getElementById('calcTime');
  const seatsInput = document.getElementById('calcSeats');
  const hoursInput = document.getElementById('calcHours');
  
  const totalPriceEl = document.getElementById('calcTotalPrice');
  const btnTotalPriceEl = document.getElementById('btnTotalPrice');
  const discountMsg = document.getElementById('calcDiscountMsg');
  const submitBtn = document.getElementById('calcSubmitBtn');

  // Установка минимальной даты (сегодня)
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
  dateInput.value = today;

  // Функция пересчета калькулятора
  function calculate() {
    const pricePerHour = parseInt(zoneSelect.options[zoneSelect.selectedIndex].dataset.price);
    const seats = parseInt(seatsInput.value) || 1;
    const hours = parseInt(hoursInput.value) || 1;
    const time = timeInput.value;
    
    if (!time) return; // Если время не выбрано, не считаем

    let total = pricePerHour * seats * hours;
    let isDiscount = false;
    let timeBand = 'day'; // Для аналитики (по умолчанию)

    const selectedDate = new Date(dateInput.value);
    const dayOfWeek = selectedDate.getDay(); // 0 - Вс, 1 - Пн...
    
    // Парсим время
    const [startHour, startMinute] = time.split(':').map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;
    const discountEnd = 14 * 60; // 14:00
    const discountStart = 8 * 60; // 08:00

    // Определяем time_band для аналитики
    if (startHour >= 23 || startHour < 8) {
      timeBand = 'night';
    } else if (dayOfWeek === 0 || dayOfWeek === 6) {
      timeBand = 'weekend';
    } else if (startTimeInMinutes >= discountStart && startTimeInMinutes < discountEnd) {
      timeBand = 'weekday_day';
    } else {
      timeBand = 'weekday_evening';
    }

    // Скидка: будни (1-5) и время с 08:00 до 14:00
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && startTimeInMinutes >= discountStart && startTimeInMinutes < discountEnd) {
      total = total * 0.7; // -30%
      isDiscount = true;
    }

    total = Math.round(total);
    
    // Выводим результат
    totalPriceEl.textContent = `${total} ₽`;
    btnTotalPriceEl.textContent = `${total}`;
    
    if (isDiscount) {
      discountMsg.style.display = 'block';
    } else {
      discountMsg.style.display = 'none';
    }

    // === ОТПРАВКА СОБЫТИЯ В GA4 ===
    if (typeof window.sendBookingCalc === 'function') {
      window.sendBookingCalc(zoneSelect.value, seats, hours, timeBand, total);
    }
  }

  // Слушаем изменения в полях
  [zoneSelect, dateInput, timeInput, seatsInput, hoursInput].forEach(el => {
    el.addEventListener('input', calculate);
    el.addEventListener('change', calculate);
  });

  // Кнопка ПОД КАЛЬКУЛЯТОРОМ (ведет на thanks.html)
  submitBtn.addEventListener('click', () => {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const params = new URLSearchParams({
      zone: zoneSelect.value,
      date: dateInput.value,
      time: timeInput.value,
      seats: seatsInput.value,
      hours: hoursInput.value,
      total: btnTotalPriceEl.textContent
    });

    window.location.href = `thanks.html?${params.toString()}`;
  });


  // === КНОПКИ "ВЫБРАТЬ" В ПАКЕТАХ ===
  const packageButtons = document.querySelectorAll('.btn-select-package');
  
  packageButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Получаем данные из data-атрибутов кнопки
      const zoneValue = btn.dataset.zone;
      const hoursValue = btn.dataset.hours;
      const fixedPrice = btn.dataset.price;

      // Ставим текущую дату и время
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;

      // Собираем URL и сразу перекидываем на thanks.html
      const params = new URLSearchParams({
        zone: zoneValue,
        date: currentDate,
        time: currentTime,
        seats: 1, // Пакеты обычно на 1 место
        hours: hoursValue,
        total: fixedPrice
      });

      window.location.href = `thanks.html?${params.toString()}`;
    });
  });
});