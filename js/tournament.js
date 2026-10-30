document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('registerModal');
  const openBtn = document.getElementById('openRegisterModal');
  const closeBtn = document.getElementById('closeRegisterModal');

  if (!modal || !openBtn) return;

  // Открыть модальное окно
  openBtn.addEventListener('click', () => {
    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  });

  // Закрыть по кнопке
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('is-active');
    document.body.style.overflow = '';
  });

  // Закрыть по клику вне окна (на оверлей)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('is-active');
      document.body.style.overflow = '';
    }
  });

  // Закрыть по нажатию клавиши Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
      modal.classList.remove('is-active');
      document.body.style.overflow = '';
    }
  });

  // === ОТПРАВКА ФОРМЫ ТУРНИРА В GOOGLE ТАБЛИЦУ ===
  const tournamentForm = document.querySelector('.modal-form');
  
  if (tournamentForm) {
    tournamentForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Останавливаем стандартный переход

      const submitBtn = tournamentForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Отправка...';
      submitBtn.disabled = true;

      const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQvo-QUbqv-ksTQgPxTQG6-JrtBk5XtzeLlxQEiV5hR-2hi9RNX_dyth5hA5mFAd_M/exec';

      // Генерируем request_id
      const reqId = 'REQ-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }).toUpperCase();

      const data = new URLSearchParams();

      // Вручную собираем данные, подменяя названия полей под требования скрипта
      data.append('request_id', reqId);
      data.append('lead_type', 'tournament');
      data.append('name', document.getElementById('captainName').value.trim());
      data.append('phone', document.getElementById('captainPhone').value.trim());
      data.append('zone', 'standard'); // Заглушка для турнира
      data.append('seats', '5'); // Команда из 5 человек
      data.append('slot', '19.12.2026 12:00'); // Дата финала

      // UTM-метки
      const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
      utmKeys.forEach(key => {
        const val = sessionStorage.getItem(key);
        if (val) data.append(key, val);
      });

      fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: data
      })
      .then(response => response.json())
      .then(resData => {
        console.log('Ответ от Apps Script (турнир):', resData);
        if (resData.ok) {
          window.location.href = `thanks.html?type=tournament&tournament=Зимний_кубок`;
        } else {
          alert('Ошибка при регистрации: ' + resData.error);
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      })
      .catch(error => {
        console.error('Ошибка сети:', error);
        alert('Ошибка соединения.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      });
    });
  }
});