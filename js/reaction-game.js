document.addEventListener('DOMContentLoaded', () => {
  const testArea = document.getElementById('testArea');
  const testTitle = document.getElementById('testTitle');
  const testDesc = document.getElementById('testDesc');
  const startBtn = document.getElementById('startTestBtn');
  const attemptCounter = document.getElementById('attemptCounter');
  const lastResultDisplay = document.getElementById('lastResultDisplay');
  const resultsBody = document.getElementById('resultsBody');
  const averageResult = document.getElementById('averageResult');

  let attempts = 0;
  const maxAttempts = 5;
  let results = [];
  let timeoutId = null;
  let startTime = 0;
  let isWaiting = false;
  let isGreen = false;

  // Начало попытки
  startBtn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    
    if (attempts >= maxAttempts) {
      resetGame();
      return;
    }
    startAttempt();
  });

  // Клик по игровому полю
  testArea.addEventListener('click', () => {
    if (!isWaiting && !isGreen) return;

    if (isWaiting) {
      clearTimeout(timeoutId);
      isWaiting = false;
      testArea.style.backgroundColor = '#e53935';
      testTitle.textContent = 'Слишком рано!';
      testDesc.textContent = 'Дождитесь зеленого цвета.';
      startBtn.style.display = 'inline-flex';
      startBtn.textContent = 'Попробовать снова';
      return;
    }

    if (isGreen) {
      const reactionTime = Date.now() - startTime;
      isGreen = false;
      isWaiting = false;
      attempts++;
      
      results.push(reactionTime);
      updateTable(attempts, reactionTime);
      
      testArea.style.backgroundColor = 'var(--surface-color)';
      testTitle.textContent = `${reactionTime} мс`;
      testDesc.textContent = 'Отличная реакция!';
      attemptCounter.textContent = attempts;
      lastResultDisplay.textContent = `Последний: ${reactionTime} мс`;

      if (attempts >= maxAttempts) {
        finishGame();
      } else {
        startBtn.textContent = 'Следующая попытка';
        startBtn.style.display = 'inline-flex';
      }
    }
  });

  function startAttempt() {
    startBtn.style.display = 'none';
    
    testArea.style.backgroundColor = 'var(--surface-color)';
    testTitle.textContent = 'Приготовьтесь...';
    testDesc.textContent = 'Ждите зеленого цвета';
    lastResultDisplay.textContent = '';
    
    isWaiting = false; 
    isGreen = false;

    setTimeout(() => {
      testArea.style.backgroundColor = '#e53935'; 
      isWaiting = true;

      const delay = Math.floor(Math.random() * 3500) + 1500;

      timeoutId = setTimeout(() => {
        isWaiting = false;
        isGreen = true;
        testArea.style.backgroundColor = '#00e676'; 
        testTitle.textContent = 'ЖМИ!';
        testDesc.textContent = '';
        startTime = Date.now();
      }, delay);
    }, 100); 
  }

  function updateTable(attemptNum, time) {
    const row = resultsBody.querySelector(`tr:nth-child(${attemptNum})`);
    if (row) {
      row.cells[1].textContent = time;
      if (time < 250) {
        row.cells[1].style.color = 'var(--accent-color)';
        row.cells[1].style.fontWeight = 'bold';
      }
    }
  }

  function finishGame() {
    const sum = results.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / results.length);
    averageResult.textContent = `${avg} мс`;
    averageResult.style.color = 'var(--accent-color)';
    averageResult.style.fontWeight = 'bold';

    testTitle.textContent = 'Тест завершен!';
    testDesc.textContent = `Твоя средняя реакция: ${avg} мс. Промокод ждет тебя ниже!`;
    startBtn.textContent = 'Пройти заново';
    startBtn.style.display = 'inline-flex';

    // === ОТПРАВКА СОБЫТИЯ В GA4 ===
    if (typeof window.sendReactionComplete === 'function') {
      window.sendReactionComplete(avg);
    }
  }

  function resetGame() {
    attempts = 0;
    results = [];
    attemptCounter.textContent = '0';
    lastResultDisplay.textContent = '';
    averageResult.textContent = '— мс';
    averageResult.style.color = 'inherit';
    
    const rows = resultsBody.querySelectorAll('tr');
    rows.forEach(row => {
      row.cells[1].textContent = '—';
      row.cells[1].style.color = 'inherit';
      row.cells[1].style.fontWeight = 'normal';
    });

    testArea.style.backgroundColor = 'var(--surface-color)';
    testTitle.textContent = 'Готов проверить реакцию?';
    testDesc.textContent = 'Нажмите кнопку ниже, чтобы начать.';
    startBtn.textContent = 'Начать тест';
    startBtn.style.display = 'inline-flex';
  }

  // Копирование промокода
  const copyBtn = document.getElementById('copyPromoBtn');
  const promoCodeText = document.getElementById('promoCode');
  const copiedMsg = document.getElementById('promoCopiedMsg');

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const code = promoCodeText.textContent;
      navigator.clipboard.writeText(code).then(() => {
        copiedMsg.style.display = 'block';
        setTimeout(() => {
          copiedMsg.style.display = 'none';
        }, 3000);
      });
    });
  }
});