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

  function calculate() {
    const pricePerHour = parseInt(zoneSelect.options[zoneSelect.selectedIndex].dataset.price);
    const seats = parseInt(seatsInput.value) || 1;
    const hours = parseInt(hoursInput.value) || 1;
    const time = timeInput.value;
    
    if (!time) return;

    let total = pricePerHour * seats * hours;
    let isDiscount = false;

    const selectedDate = new Date(dateInput.value);
    const dayOfWeek = selectedDate.getDay(); 
    
    const [startHour, startMinute] = time.split(':').map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;
    const discountEnd = 14 * 60;
    const discountStart = 8 * 60;

    if (dayOfWeek >= 1 && dayOfWeek <= 5 && startTimeInMinutes >= discountStart && startTimeInMinutes < discountEnd) {
      total = total * 0.7;
      isDiscount = true;
    }

    total = Math.round(total);
    totalPriceEl.textContent = `${total} ₽`;
    btnTotalPriceEl.textContent = `${total}`;
    
    if (isDiscount) {
      discountMsg.style.display = 'block';
    } else {
      discountMsg.style.display = 'none';
    }
  }

  [zoneSelect, dateInput, timeInput, seatsInput, hoursInput].forEach(el => {
    el.addEventListener('input', calculate);
    el.addEventListener('change', calculate);
  });

  // === КНОПКА ПОД КАЛЬКУЛЯТОРОМ ===
  // Теперь ведет на thanks.html с параметрами
  submitBtn.addEventListener('click', () => {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Собираем данные
    const zone = zoneSelect.value;
    const date = dateInput.value;
    const time = timeInput.value;
    const seats = seatsInput.value;
    const hours = hoursInput.value;
    const total = btnTotalPriceEl.textContent;

    // Формируем URL для thanks.html
    const params = new URLSearchParams({
      zone: zone,
      date: date,
      time: time,
      seats: seats,
      hours: hours,
      total: total
    });

    window.location.href = `thanks.html?${params.toString()}`;
  });


  // === КНОПКИ "ВЫБРАТЬ" В ПАКЕТАХ ===
  const packageButtons = document.querySelectorAll('.btn-select-package');
  
  packageButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
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

      // Формируем URL для thanks.html с данными пакета
      const params = new URLSearchParams({
        zone: zoneValue,
        date: currentDate,
        time: currentTime,
        seats: 1, // Пакеты обычно на 1 человека
        hours: hoursValue,
        total: fixedPrice
      });

      // Перенаправляем сразу на страницу спасибо
      window.location.href = `thanks.html?${params.toString()}`;
    });
  });
});