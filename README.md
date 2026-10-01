# JobSwipe

Сервис поиска работы для студентов и выпускников: свайпаешь вакансии, получаешь **Match**, когда интерес взаимный, и начинаешь общение.

Один и тот же frontend работает **в трёх режимах**:

1. обычный сайт в браузере;
2. PWA на iPhone (иконка на домашнем экране);
3. Telegram Mini App (открывается внутри бота).

Стек: React · TypeScript · Vite · Tailwind CSS · React Router · Lucide Icons · Framer Motion.
Backend пока **не нужен** — данные демонстрационные и хранятся в `localStorage`.

---

## Быстрый старт

Нужен Node.js 18+.

```bash
npm install        # установить зависимости
npm run dev        # запустить для разработки → http://localhost:5173
npm run build      # собрать для публикации (папка dist/)
npm run preview    # посмотреть собранную версию локально
```

Откройте сайт → «Начать» → «Я ищу работу» (**Demo Student**) или «Я ищу сотрудников» (**Demo Employer**).
Регистрация не нужна: сразу доступны профиль, вакансии, Likes, Matches и переписка.

### Что попробовать

| Действие | Как |
|---|---|
| Свайпнуть вакансию | потяните карточку пальцем/мышью, нажмите ❌ / ❤️ или стрелки ← → на клавиатуре |
| Получить Match | поставьте Like вакансии из ленты — у некоторых компаний уже есть взаимный Like (покажется «It’s a Match!») |
| Чат | вкладка «Чаты» или кнопка «Открыть чат»; собеседник отвечает автоматически, сообщения сохраняются |
| Фильтры | кнопка «Фильтры» на главном экране |
| Профиль | вкладка «Профиль» → «Редактировать профиль» |
| Поделиться вакансией | иконка «Поделиться» на странице вакансии |
| Сменить роль / сбросить данные | Профиль → ⚙️ Настройки |

После перезагрузки страницы всё состояние сохраняется (localStorage).

---

## Структура проекта

```
src/
├── components/        UI-компоненты (SwipeDeck, карточки, MatchOverlay, навигация, формы)
├── pages/             Экраны: /welcome /onboarding /home /matches /messages /chat/:id
│                      /profile /edit-profile /job/:id /company/:id /filters /settings
│                      (+ /candidate/:id и /new-job для работодателя)
├── hooks/             useTheme, useAppMode, useViewportHeight
├── context/           AppContext — состояние приложения + сохранение в localStorage
├── services/          storage.ts · matching.ts (calculateCompatibility, фильтры) · mockApi.ts
├── integrations/
│   └── telegram/      telegram.ts · types.ts · useTelegram.ts  ← ВСЁ про Telegram только здесь
├── data/              mock-данные: компании, вакансии, кандидаты, демо-профили
└── utils/             форматирование, share
```

Слои: **UI → хуки/контекст → services → integrations**. UI-компоненты никогда не обращаются к `window.Telegram` напрямую.

### Куда подключать backend позже

* `src/services/mockApi.ts` — заменить функции на запросы к `VITE_API_URL`;
* `src/services/matching.ts` → `calculateCompatibility()` — заменить на реальный алгоритм;
* `src/context/AppContext.tsx` — вместо localStorage использовать API;
* чат — заменить mock-ответы в `ChatPage` на WebSocket.

---

## PWA: установка на iPhone

1. Опубликуйте приложение по **HTTPS** (см. «Публикация» ниже) — на `localhost` iPhone его не увидит.
2. Откройте адрес в **Safari** на iPhone.
3. Нажмите кнопку «Поделиться» (квадрат со стрелкой) → **«На экран “Домой”»** → «Добавить».
4. Запустите JobSwipe с домашнего экрана: приложение откроется без адресной строки, на весь экран.

Уже готово в коде: `manifest.json`, service worker (`public/sw.js`, офлайн-оболочка), иконки (`public/icons`), `display: standalone`, theme/background color, `viewport-fit=cover` и отступы safe-area для «чёлки» и нижней полосы.

---

## Публикация (static hosting)

Приложение — обычная статика, собственный сервер не нужен. Используется `HashRouter` (адреса вида `/#/home`), поэтому **не требуется никаких правил перенаправления** — работает на Vercel, Netlify, Cloudflare Pages, GitHub Pages и любом другом хостинге.

* **Vercel / Netlify / Cloudflare Pages:** подключите репозиторий, build command `npm run build`, output directory `dist`.
* **GitHub Pages:** залейте содержимое `dist/` в ветку `gh-pages` (пути относительные — `base: './'`).

После публикации у вас будет адрес вида `https://jobswipe.example.com` — это и есть **HTTPS URL** для Telegram.

---

## Как подключить Telegram Bot

> Токен бота **никогда** не кладите во frontend и в `.env` — он нужен только будущему backend.

1. **Создайте бота.** В Telegram откройте [@BotFather](https://t.me/BotFather) → `/newbot` → задайте имя и username (например, `jobswipe_demo_bot`). BotFather пришлёт токен — храните его в секрете.
2. **Задеплойте frontend** и получите HTTPS-адрес (см. выше).
3. **Создайте Mini App.** В BotFather: `/newapp` → выберите бота → название, описание, фото → **укажите URL вашего приложения** → придумайте короткое имя (например, `app`). Mini App будет доступен по `https://t.me/<бот>/<app>`.
4. **Кнопка меню бота** (по желанию): `/mybots` → ваш бот → *Bot Settings* → *Menu Button* → *Configure menu button* → введите тот же URL и текст кнопки, например «Открыть JobSwipe».
5. **Откройте из Telegram:** зайдите в чат с ботом и нажмите кнопку меню или откройте ссылку `https://t.me/<бот>/<app>`.

### Что уже готово в коде

* подключён официальный Telegram Web Apps SDK (`index.html`);
* определение запуска внутри Telegram (`isTelegramWebApp()`), при отсутствии Telegram приложение работает как обычный сайт;
* профиль берётся из Telegram: имя, `@username`, фото — вводить имя повторно не нужно;
* вне Telegram используется demo-пользователь `Demo User @demo_user`;
* тема Telegram (светлая/тёмная) через `--tg-theme-*` + собственная fallback-палитра;
* viewport и safe areas Telegram;
* **Main Button**: «Откликнуться» (вакансия), «Сохранить» (профиль, фильтры), «Открыть чат» (Match);
* **Back Button** Telegram вместо собственной стрелки (чтобы они не конфликтовали);
* haptic-отклик при свайпах и Match;
* «Поделиться вакансией»: диалог Telegram → Web Share API → копирование ссылки.

### Ссылки на вакансию (deep link, необязательно)

Чтобы «Поделиться» отправляла ссылку, открывающую Mini App сразу на нужной вакансии, создайте файл `.env`:

```
VITE_TELEGRAM_BOT_USERNAME=jobswipe_demo_bot
VITE_TELEGRAM_APP_NAME=app
```

Это публичные значения, не секреты. Ссылка будет вида `https://t.me/<бот>/<app>?startapp=job_<id>`.

### Безопасность

* Секреты (токен бота, ключи API, пароли БД) — **только на backend**.
* `initData` из Telegram **не сохраняется** на клиенте и не считается доверенным. Когда появится backend, отправляйте `getTelegramInitData()` на сервер и проверяйте подпись (HMAC-SHA256 по токену бота) — только после этого считайте пользователя настоящим.

---

## Переменные окружения

См. `.env.example`. Все `VITE_*` значения попадают в браузер, поэтому **секретов там быть не должно**.

## Дизайн-токены

Цвета лежат в CSS-переменных в `src/index.css` (`--c-accent: #635bff` и др.). Меняйте их в одном месте — цвета обновятся по всему приложению, в том числе в тёмной теме.

## Дальнейший план

MVP → Telegram Mini App → backend → база данных → реальная авторизация (через проверенный initData) → реальный matching → реальный чат → уведомления через бота.
