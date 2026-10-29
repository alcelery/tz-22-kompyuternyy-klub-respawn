document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('registerModal');
  const openBtn = document.getElementById('openRegisterModal');
  const closeBtn = document.getElementById('closeRegisterModal');

  if (!modal || !openBtn) return;

  // Открыть модальное окно
  openBtn.addEventListener('click', () => {
    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
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
});