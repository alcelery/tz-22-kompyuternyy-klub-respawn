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
    let timeBand = 'day';

    const selectedDate = new Date(dateInput.value);
    const dayOfWeek = selectedDate.getDay();
    
    const [startHour, startMinute] = time.split(':').map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;
    const discountEnd = 14 * 60;
    const discountStart = 8 * 60;

    if (startHour >= 23 || startHour < 8) {
      timeBand = 'night';
    } else if (dayOfWeek === 0 || dayOfWeek === 6) {
      timeBand = 'weekend';
    } else if (startTimeInMinutes >= discountStart && startTimeInMinutes < discountEnd) {
      timeBand = 'weekday_day';
    } else {
      timeBand = 'weekday_evening';
    }

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

    if (typeof window.sendBookingCalc === 'function') {
      window.sendBookingCalc(zoneSelect.value, seats, hours, timeBand, total);
    }
  }

  [zoneSelect, dateInput, timeInput, seatsInput, hoursInput].forEach(el => {
    el.addEventListener('input', calculate);
    el.addEventListener('change', calculate);
  });

  // Кнопка ПОД КАЛЬКУЛЯТОРОМ (ведет на contacts.html)
  submitBtn.addEventListener('click', () => {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const params = new URLSearchParams({
      type: 'booking',
      zone: zoneSelect.value,
      date: dateInput.value,
      time: timeInput.value,
      seats: seatsInput.value,
      hours: hoursInput.value,
      total: btnTotalPriceEl.textContent
    });

    // ВАЖНО: ведем на contacts.html вместо thanks.html
    window.location.href = `contacts.html?${params.toString()}`;
  });


  // === КНОПКИ "ВЫБРАТЬ" В ПАКЕТАХ ===
  const packageButtons = document.querySelectorAll('.btn-select-package');
  
  packageButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const zoneValue = btn.dataset.zone;
      const hoursValue = btn.dataset.hours;
      const fixedPrice = btn.dataset.price;

      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;

      const params = new URLSearchParams({
        type: 'package',
        zone: zoneValue,
        date: currentDate,
        time: currentTime,
        seats: 1,
        hours: hoursValue,
        total: fixedPrice
      });

      // ВАЖНО: ведем на contacts.html вместо thanks.html
      window.location.href = `contacts.html?${params.toString()}`;
    });
  });
});