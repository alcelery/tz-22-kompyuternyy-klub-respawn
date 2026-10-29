document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('gameSearch');
  const gamesGrid = document.getElementById('gamesGrid');
  const noResults = document.getElementById('noResults');
  
  if (!searchInput || !gamesGrid) return;

  // Получаем все карточки игр
  const gameCards = gamesGrid.querySelectorAll('.game-card');

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    let visibleCount = 0;

    gameCards.forEach(card => {
      // Берем текст из data-атрибута (там есть и русские, и английские названия)
      const title = card.dataset.title.toLowerCase();
      
      // Если запрос пустой или совпадает с названием
      if (query === '' || title.includes(query)) {
        card.style.display = 'flex'; // Показываем
        visibleCount++;
      } else {
        card.style.display = 'none'; // Скрываем
      }
    });

    // Показываем сообщение, если ничего не найдено
    if (visibleCount === 0 && query !== '') {
      noResults.style.display = 'block';
    } else {
      noResults.style.display = 'none';
    }
  });
});