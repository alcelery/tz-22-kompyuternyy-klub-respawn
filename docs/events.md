# Таблица событий Google Analytics 4 (GA4)

В данном документе описаны все события, которые собираются на сайте «РЕСПАУН». 
В соответствии с ТЗ (раздел 4.2), 6 событий собираются автоматически с помощью расширенной статистики (Enhanced Measurement), а остальные 14 запрограммированы вручную в файле `js/analytics.js` и других скриптах.

---

## 1. Автоматические события (Enhanced Measurement)
*Настраиваются в интерфейсе GA4. Код на сайте для них не требуется.*

| № | Событие | Где отправляется | Параметры и примеры значений |
|---|---|---|---|
| 1 | `page_view` | Автоматически при открытии страницы | `page_location`: `https://respawn-club.ru/`, `page_title`: `Главная` |
| 2 | `scroll` | Автоматически при прокрутке до 90% | `percent_scrolled`: `90` |
| 3 | `click` | Автоматически при переходе на внешний сайт | `link_url`: `https://t.me/respawn_club`, `outbound`: `true` |
| 4 | `file_download` | Автоматически при скачивании PDF | `file_name`: `rules.pdf`, `file_extension`: `pdf` |
| 5 | `form_start` | Автоматически при первом взаимодействии с формой | `form_id`: `bookingForm` |
| 6 | `form_submit` | Автоматически при отправке формы | `form_id`: `bookingForm` |

---

## 2. Запрограммированные события (Custom Events)
*Все вызовы `gtag('event', ...)` находятся в файле `js/analytics.js`.*

| № | Событие | Тип | Файл и строка | Параметры и примеры значений |
|---|---|---|---|---|
| 7 | **`generate_lead`** | Ключевое | `js/thanks.js`, стр. ~69 | `lead_type`: `booking` (или `tournament`), `lead_zone`: `vip`, `value`: `1500`, `currency`: `RUB` |
| 8 | `cta_click` | Соб. | `js/analytics.js`, стр. ~35 (универсальный обработчик) | `button_name`: `hero_book`, `page_section`: `hero` |
| 9 | `zone_view` | Соб. | `js/analytics.js`, стр. ~79 (слушатель карточек) | `zone`: `standard` |
| 10 | `booking_calc` | Соб. | `js/calculator.js`, стр. ~69 | `zone`: `vip`, `seats`: `2`, `hours`: `3`, `time_band`: `weekday_day`, `total_price`: `1050` |
| 11 | `package_select` | Соб. | `prices.html` (HTML-атрибут) + `analytics.js` | `package_name`: `3_hours_vip` |
| 12 | `game_search` | Соб. | `js/analytics.js`, стр. ~116 | `search_term`: `dota`, `results_count`: `3` |
| 13 | `tournament_view` | Соб. | `js/analytics.js`, стр. ~146 | `tournament_id`: `winter_cup_2026` |
| 14 | `reaction_test_complete` | Соб. | `js/reaction-game.js`, стр. ~159 | `reaction_ms`: `245` |
| 15 | **`contact_click`** | Ключевое | `js/analytics.js` (через `data-event`) | `contact_type`: `phone` |
| 16 | **`messenger_click`** | Ключевое | `js/analytics.js` (через `data-event`) | `messenger`: `telegram` (или `whatsapp`) |
| 17 | `social_click` | Соб. | `js/analytics.js` (через `data-event`) | `network`: `vk`, `page_section`: `footer` |
| 18 | `form_error` | Соб. | `js/forms.js`, стр. ~72 | `field_name`: `phone`, `error_type`: `invalid_format` |
| 19 | `promo_copy` | По выбору | `js/analytics.js` (через `data-event`) | `promo_code`: `REACT20` |
| 20 | `video_play` | По выбору | `js/analytics.js`, стр. ~155 | `video_title`: `Атмосфера клуба` |

---

## 3. Пользовательские параметры (Custom Definitions)
*Зарегистрированы в GA4 (Admin → Custom definitions → Event scope).*

| Параметр | Событие | Вопрос отчёта, который закрывает | Пример |
|---|---|---|---|
| `button_name` | `cta_click` | Какая кнопка заявки сработала | `hero_book` |
| `page_section` | `cta_click`, `social_click` | В каком блоке страницы был клик | `footer` |
| `zone` | `zone_view`, `booking_calc` | Какие зоны выбирают | `vip` |
| `time_band` | `booking_calc` | Дневные будни, вечер или ночь | `weekday_day` |
| `search_term` | `game_search` | Какие игры ищут | `cs2` |
| `lead_type` | `generate_lead` | Бронь места или регистрация на турнир | `tournament` |
| `messenger` | `messenger_click` | Какой мессенджер выбирают | `telegram` |

---

## 4. Ключевые события (Key Events)
*Отмечены в GA4 (Admin → Key events).*
*   `generate_lead`
*   `contact_click`
*   `messenger_click`

---

## 5. Пример отправки события из кода

Пример функции из `js/analytics.js`, которая перехватывает клики по элементам с атрибутом `data-event`:

```javascript
document.body.addEventListener('click', (e) => {
  const target = e.target.closest('[data-event]');
  if (!target) return;

  const eventName = target.getAttribute('data-event');
  
  // Собираем все data-атрибуты в параметры
  const params = {};
  for (const attr of target.attributes) {
    if (attr.name.startsWith('data-') && attr.name !== 'data-event') {
      const paramName = attr.name.replace('data-', '').replace(/-/g, '_');
      params[paramName] = attr.value;
    }
  }

  // Отправляем в GA4
  gtag('event', eventName, params);
});