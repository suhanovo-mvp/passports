# Руководство для участников проекта

Спасибо за интерес к проекту! Мы приветствуем любой вклад в развитие системы создания технологических паспортов.

## 📋 Содержание

1. [Кодекс поведения](#кодекс-поведения)
2. [Как внести вклад](#как-внести-вклад)
3. [Процесс разработки](#процесс-разработки)
4. [Стандарты кода](#стандарты-кода)
5. [Тестирование](#тестирование)
6. [Документация](#документация)

## 🤝 Кодекс поведения

Мы придерживаемся принципов открытости, уважения и профессионализма. Ожидаем того же от всех участников проекта.

## 🚀 Как внести вклад

### Сообщение об ошибках

1. Проверьте, не была ли уже создана подобная issue
2. Используйте шаблон для создания issue
3. Предоставьте максимум информации:
   - Версия приложения
   - Шаги для воспроизведения
   - Ожидаемое и фактическое поведение
   - Скриншоты (если применимо)

### Предложение новых функций

1. Создайте issue с меткой "enhancement"
2. Опишите проблему, которую решает функция
3. Предложите возможную реализацию
4. Дождитесь обсуждения перед началом разработки

### Pull Requests

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Внесите изменения
4. Напишите или обновите тесты
5. Убедитесь, что все тесты проходят
6. Commit изменений (`git commit -m 'Add amazing feature'`)
7. Push в branch (`git push origin feature/amazing-feature`)
8. Создайте Pull Request

## 🔄 Процесс разработки

### Настройка окружения

```bash
# Клонирование репозитория
git clone https://github.com/your-username/tech-passport-system.git
cd tech-passport-system

# Установка зависимостей
pnpm install

# Настройка базы данных
pnpm db:push

# Запуск dev-сервера
pnpm dev
```

### Структура веток

- `main` - стабильная версия для production
- `develop` - основная ветка разработки
- `feature/*` - новые функции
- `bugfix/*` - исправления ошибок
- `hotfix/*` - срочные исправления для production

### Workflow

1. Создайте issue для обсуждения изменений
2. Создайте branch от `develop`
3. Внесите изменения с коммитами по мере работы
4. Создайте Pull Request в `develop`
5. Дождитесь code review
6. Внесите правки по комментариям
7. После одобрения изменения будут смержены

## 📝 Стандарты кода

### TypeScript

- Используйте строгую типизацию
- Избегайте `any`, используйте `unknown` если необходимо
- Документируйте сложные типы

```typescript
// ✅ Хорошо
interface Passport {
  id: number;
  serviceName: string;
  status: PassportStatus;
}

// ❌ Плохо
interface Passport {
  id: any;
  serviceName: any;
  status: any;
}
```

### React компоненты

- Используйте функциональные компоненты
- Применяйте hooks для состояния
- Разделяйте логику и представление

```typescript
// ✅ Хорошо
export default function PassportCard({ passport }: Props) {
  const { data, isLoading } = trpc.passports.get.useQuery({ id: passport.id });
  
  if (isLoading) return <Skeleton />;
  
  return <Card>...</Card>;
}

// ❌ Плохо
export default function PassportCard(props: any) {
  const data = props.data;
  return <div>...</div>;
}
```

### Стиль кода

- Используйте 2 пробела для отступов
- Точка с запятой обязательна
- Одинарные кавычки для строк
- Trailing comma в объектах и массивах

```typescript
// ✅ Хорошо
const config = {
  name: 'Tech Passport',
  version: '1.0',
};

// ❌ Плохо
const config = {
  name: "Tech Passport",
  version: "1.0"
}
```

### Именование

- **Файлы**: PascalCase для компонентов, camelCase для утилит
- **Компоненты**: PascalCase
- **Функции**: camelCase
- **Константы**: UPPER_SNAKE_CASE
- **Интерфейсы**: PascalCase с префиксом I (опционально)

```typescript
// Файлы
PassportCard.tsx
usePassport.ts
formatDate.ts

// Код
export default function PassportCard() {}
export function usePassport() {}
export const MAX_PASSPORTS = 100;
export interface PassportData {}
```

### Комментарии

- Пишите самодокументируемый код
- Комментируйте сложную логику
- Используйте JSDoc для функций

```typescript
/**
 * Создает новый технологический паспорт
 * @param data - данные паспорта
 * @returns созданный паспорт
 */
export async function createPassport(data: CreatePassportInput) {
  // Валидация данных
  validatePassportData(data);
  
  // Создание в БД
  return await db.insert(passports).values(data);
}
```

## 🧪 Тестирование

### Запуск тестов

```bash
# Все тесты
pnpm test

# Тесты с coverage
pnpm test:coverage

# Тесты в watch режиме
pnpm test:watch
```

### Написание тестов

Используйте Vitest для unit и integration тестов:

```typescript
import { describe, it, expect } from 'vitest';
import { createPassport } from './passports';

describe('createPassport', () => {
  it('should create a new passport', async () => {
    const data = {
      serviceName: 'Test Service',
      serviceCode: 'TEST-001',
    };
    
    const passport = await createPassport(data);
    
    expect(passport.serviceName).toBe(data.serviceName);
    expect(passport.status).toBe('draft');
  });
  
  it('should throw error for invalid data', async () => {
    const data = { serviceName: '' };
    
    await expect(createPassport(data)).rejects.toThrow();
  });
});
```

### Coverage требования

- Минимум 80% покрытие для новых функций
- 100% покрытие для критических путей
- Тесты для всех публичных API

## 📚 Документация

### Обновление документации

При добавлении новых функций обновите:
- README.md - если меняется основной функционал
- API.md - для новых API endpoints
- DEPLOYMENT.md - для изменений в развертывании

### Комментарии в коде

```typescript
// ✅ Хорошо - объясняет "почему"
// Используем setTimeout для debounce, чтобы избежать лишних запросов к API
setTimeout(() => fetchData(), 300);

// ❌ Плохо - объясняет "что" (очевидно из кода)
// Устанавливаем таймаут на 300мс
setTimeout(() => fetchData(), 300);
```

## 🔍 Code Review

### Что проверяем

- Соответствие стандартам кода
- Наличие тестов
- Обновление документации
- Отсутствие breaking changes
- Производительность
- Безопасность

### Как оставлять комментарии

- Будьте конструктивны
- Предлагайте решения
- Объясняйте причины
- Используйте префиксы:
  - `MUST:` - обязательно исправить
  - `SHOULD:` - желательно исправить
  - `COULD:` - можно рассмотреть
  - `QUESTION:` - вопрос для обсуждения

## 🎯 Приоритеты

### Высокий приоритет

- Исправление критических ошибок
- Проблемы безопасности
- Потеря данных
- Недоступность сервиса

### Средний приоритет

- Новые функции
- Улучшение производительности
- Рефакторинг
- Обновление зависимостей

### Низкий приоритет

- Косметические изменения
- Документация
- Оптимизация кода

## 📞 Связь

- **Issues** - для багов и предложений
- **Discussions** - для общих вопросов
- **Email** - для приватных вопросов

## 🙏 Благодарности

Спасибо всем, кто вносит вклад в проект!

## 📄 Лицензия

Внося вклад в проект, вы соглашаетесь с тем, что ваш код будет лицензирован под MIT License.

