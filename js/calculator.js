document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('priceCalculator');
  if (!form) return; // Защита, если скрипт подключен на другой странице

  const zoneSelect = document.getElementById('calcZone');
  const dateInput = document.getElementById('calcDate');
  const timeInput = document.getElementById('calcTime');
  const seatsInput = document.getElementById('calcSeats');
  const hoursInput = document.getElementById('calcHours');
  
  const totalPriceEl = document.getElementById('calcTotalPrice');
  const btnTotalPriceEl = document.getElementById('btnTotalPrice');
  const discountMsg = document.getElementById('calcDiscountMsg');
  const submitBtn = document.getElementById('calcSubmitBtn');
  const hiddenParams = document.getElementById('calcHiddenParams');

  // Установка минимальной даты (сегодня)
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
  dateInput.value = today; // По умолчанию сегодня

  function calculate() {
    const pricePerHour = parseInt(zoneSelect.options[zoneSelect.selectedIndex].dataset.price);
    const seats = parseInt(seatsInput.value) || 1;
    const hours = parseInt(hoursInput.value) || 1;
    const time = timeInput.value;
    
    if (!time) return; // Ждем, пока пользователь выберет время

    let total = pricePerHour * seats * hours;
    let isDiscount = false;

    // Логика скидки: Будни (Пн-Пт) с 08:00 до 14:00
    const selectedDate = new Date(dateInput.value);
    const dayOfWeek = selectedDate.getDay(); // 0 - Вс, 1 - Пн, ..., 6 - Сб
    
    // Парсим время начала
    const [startHour, startMinute] = time.split(':').map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;
    const discountEnd = 14 * 60; // 14:00 в минутах
    const discountStart = 8 * 60; // 08:00 в минутах

    // Если день будний (1-5) И время начала попадает в диапазон 08:00 - 14:00
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && startTimeInMinutes >= discountStart && startTimeInMinutes < discountEnd) {
      total = total * 0.7; // Применяем скидку 30%
      isDiscount = true;
    }

    // Округляем до целых
    total = Math.round(total);

    // Обновляем интерфейс
    totalPriceEl.textContent = `${total} ₽`;
    btnTotalPriceEl.textContent = `${total}`;
    
    if (isDiscount) {
      discountMsg.style.display = 'block';
    } else {
      discountMsg.style.display = 'none';
    }

    // Формируем строку параметров для передачи
    const params = new URLSearchParams({
      zone: zoneSelect.value,
      date: dateInput.value,
      time: timeInput.value,
      seats: seats,
      hours: hours,
      total: total
    });
    hiddenParams.value = params.toString();
  }

  // Слушаем изменения во всех полях
  [zoneSelect, dateInput, timeInput, seatsInput, hoursInput].forEach(el => {
    el.addEventListener('input', calculate);
    el.addEventListener('change', calculate);
  });

  // Обработка кнопки бронирования
  submitBtn.addEventListener('click', () => {
    // Проверяем валидность формы (на случай пустых полей)
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    // Переходим на страницу бронирования с параметрами
    window.location.href = `reaction.html?${hiddenParams.value}`;
  });
});