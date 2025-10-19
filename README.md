# Система создания технологических паспортов

Веб-приложение для создания и управления технологическими паспортами процессов оказания мер социальной поддержки.

## 📋 Описание

Система предназначена для формализации и документирования процессов предоставления государственных услуг социальной поддержки. Технологический паспорт включает:

- **Общие сведения** о услуге
- **BPMN-диаграммы** бизнес-процессов
- **Нормативную базу** с привязкой к законодательству
- **Матрицу критериев** оценки права на получение услуги
- **Формулы расчета** размера выплат
- **Статусные модели** жизненного цикла заявлений
- **Шаблоны уведомлений** для коммуникации с заявителями
- **Интеграции СМЭВ** для межведомственного взаимодействия

## 🏗️ Архитектура

### Технологический стек

**Frontend:**
- React 19 + TypeScript
- Tailwind CSS 4
- shadcn/ui компоненты
- tRPC для типизированного API
- Wouter для роутинга

**Backend:**
- Node.js 20 + Express
- TypeScript
- tRPC для API
- Drizzle ORM
- MySQL/TiDB база данных

**DevOps:**
- Docker + Docker Compose
- Nginx для production

### Структура базы данных

Система использует реляционную БД с 15 основными таблицами:
- `users` - пользователи системы
- `passports` - технологические паспорта
- `passport_versions` - версионирование паспортов
- `sections` - разделы паспортов
- `normative_acts` - нормативные акты
- `bpmn_diagrams` - BPMN схемы
- `criteria_matrix` - критерии оценки
- `payment_formulas` - формулы расчета
- `status_models` - статусные модели
- `status_transitions` - переходы статусов
- `notification_templates` - шаблоны уведомлений
- `smev_integrations` - СМЭВ интеграции
- `comments` - комментарии
- `audit_log` - журнал аудита

## 🚀 Быстрый старт

### Требования

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 20+ (для локальной разработки)
- pnpm 10+ (для локальной разработки)

### Запуск с Docker Compose

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/tech-passport-system.git
cd tech-passport-system
```

2. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

3. Отредактируйте `.env` и установите необходимые переменные:
```env
DATABASE_URL=mysql://tech_user:tech_password@db:3306/tech_passport
JWT_SECRET=your-secure-secret-key
```

4. Запустите приложение:
```bash
docker-compose up -d
```

5. Откройте браузер: http://localhost:3000

### Запуск для разработки

1. Установите зависимости:
```bash
pnpm install
```

2. Настройте базу данных:
```bash
pnpm db:push
```

3. Запустите dev-сервер:
```bash
pnpm dev
```

4. Откройте браузер: http://localhost:3000

## 📦 Docker

### Сборка образа

```bash
docker build -t tech-passport-system .
```

### Запуск контейнера

```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL=mysql://user:password@host:3306/database \
  -e JWT_SECRET=your-secret \
  --name tech-passport \
  tech-passport-system
```

### Docker Compose

Файл `docker-compose.yml` включает:
- **app** - основное приложение (Node.js)
- **db** - MySQL база данных
- **redis** - Redis для кэширования и сессий

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Остановка с удалением данных
docker-compose down -v
```

## 🔧 Конфигурация

### Переменные окружения

| Переменная | Описание | Обязательная |
|------------|----------|--------------|
| `DATABASE_URL` | URL подключения к MySQL | Да |
| `JWT_SECRET` | Секретный ключ для JWT токенов | Да |
| `REDIS_URL` | URL подключения к Redis | Нет |
| `PORT` | Порт приложения (по умолчанию 3000) | Нет |
| `NODE_ENV` | Окружение (development/production) | Нет |

### Роли пользователей

- **user** - базовый доступ для просмотра паспортов
- **curator** - создание и редактирование паспортов
- **admin** - полный доступ к системе

## 📚 API

Система использует tRPC для типизированного API. Основные роутеры:

- `auth` - аутентификация и авторизация
- `passports` - управление паспортами
- `sections` - работа с разделами
- `normativeActs` - нормативная база
- `bpmn` - BPMN диаграммы
- `criteria` - матрица критериев
- `formulas` - формулы расчета
- `statuses` - статусные модели
- `notifications` - шаблоны уведомлений
- `smev` - СМЭВ интеграции
- `comments` - комментарии

## 🛠️ Разработка

### Структура проекта

```
tech-passport-system/
├── client/              # Frontend (React)
│   ├── src/
│   │   ├── components/  # UI компоненты
│   │   ├── pages/       # Страницы
│   │   ├── lib/         # Утилиты
│   │   └── hooks/       # React hooks
├── server/              # Backend (Node.js)
│   ├── routers.ts       # tRPC роутеры
│   ├── db.ts            # Функции БД
│   └── _core/           # Ядро сервера
├── drizzle/             # Схема БД и миграции
│   └── schema.ts
├── shared/              # Общий код
├── docker-compose.yml   # Docker Compose конфигурация
└── Dockerfile           # Docker образ
```

### Команды разработки

```bash
# Установка зависимостей
pnpm install

# Запуск dev-сервера
pnpm dev

# Сборка для production
pnpm build

# Применение миграций БД
pnpm db:push

# Генерация миграций
pnpm db:generate

# Линтинг
pnpm lint

# Форматирование кода
pnpm format
```

### Добавление новых функций

1. Обновите схему БД в `drizzle/schema.ts`
2. Примените миграции: `pnpm db:push`
3. Добавьте функции БД в `server/db.ts`
4. Создайте tRPC процедуры в `server/routers.ts`
5. Реализуйте UI в `client/src/`

## 🔒 Безопасность

- JWT токены для аутентификации
- Хеширование паролей с bcrypt
- HTTPS для production
- CORS настройки
- Rate limiting для API
- Валидация всех входных данных
- Защита от SQL-инъекций через ORM
- Защита от XSS через санитизацию
- Аудит всех действий пользователей

## 📄 Лицензия

MIT License

## 👥 Авторы

Разработано для ГКУ "Социальное казначейство города Москвы"

## 🤝 Вклад в проект

Приветствуются pull requests. Для крупных изменений сначала откройте issue для обсуждения.

## 📞 Поддержка

Для вопросов и предложений создавайте issues в GitHub репозитории.

## 🗺️ Roadmap

- [ ] Визуальный редактор BPMN диаграмм
- [ ] Экспорт паспортов в PDF/Word
- [ ] Импорт из Excel/CSV
- [ ] Интеграция с внешними системами
- [ ] Расширенная аналитика
- [ ] Мобильное приложение
- [ ] API для внешних интеграций
- [ ] Система уведомлений в реальном времени

## 📊 Статус проекта

Проект находится в активной разработке. Базовый функционал реализован и готов к использованию.

