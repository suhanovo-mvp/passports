# API Документация

Система использует tRPC для типизированного API. Все эндпоинты доступны через `/api/trpc`.

## 🔐 Аутентификация

Система использует JWT токены для аутентификации. Токен передается через cookie `session`.

### Роли пользователей

- **user** - базовый доступ (просмотр паспортов)
- **curator** - создание и редактирование паспортов
- **admin** - полный доступ к системе

## 📡 API Роутеры

### Auth Router (`auth.*`)

#### `auth.me`
Получение информации о текущем пользователе.

**Тип:** Query  
**Доступ:** Public

**Ответ:**
```typescript
{
  id: string;
  name: string | null;
  email: string | null;
  role: "user" | "curator" | "admin";
  createdAt: Date;
  lastSignedIn: Date;
} | null
```

#### `auth.logout`
Выход из системы.

**Тип:** Mutation  
**Доступ:** Public

**Ответ:**
```typescript
{
  success: true
}
```

---

### Passports Router (`passports.*`)

#### `passports.list`
Получение списка всех паспортов.

**Тип:** Query  
**Доступ:** Protected

**Ответ:**
```typescript
Array<{
  id: number;
  serviceName: string;
  serviceCode: string | null;
  description: string | null;
  status: "draft" | "in_review" | "published" | "archived";
  version: string;
  createdAt: Date;
  updatedAt: Date;
}>
```

#### `passports.get`
Получение паспорта по ID.

**Тип:** Query  
**Доступ:** Protected

**Параметры:**
```typescript
{
  id: number;
}
```

**Ответ:**
```typescript
{
  id: number;
  serviceName: string;
  serviceCode: string | null;
  description: string | null;
  status: "draft" | "in_review" | "published" | "archived";
  version: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### `passports.create`
Создание нового паспорта.

**Тип:** Mutation  
**Доступ:** Curator/Admin

**Параметры:**
```typescript
{
  serviceName: string;
  serviceCode?: string;
  description?: string;
}
```

**Ответ:**
```typescript
{
  id: number;
  serviceName: string;
  serviceCode: string | null;
  description: string | null;
  status: "draft";
  version: "1.0";
  createdAt: Date;
  updatedAt: Date;
}
```

#### `passports.update`
Обновление паспорта.

**Тип:** Mutation  
**Доступ:** Curator/Admin

**Параметры:**
```typescript
{
  id: number;
  serviceName?: string;
  serviceCode?: string;
  description?: string;
  status?: "draft" | "in_review" | "published" | "archived";
}
```

#### `passports.delete`
Удаление паспорта.

**Тип:** Mutation  
**Доступ:** Admin

**Параметры:**
```typescript
{
  id: number;
}
```

---

### Sections Router (`sections.*`)

#### `sections.list`
Получение разделов паспорта.

**Тип:** Query  
**Доступ:** Protected

**Параметры:**
```typescript
{
  passportId: number;
}
```

**Ответ:**
```typescript
Array<{
  id: number;
  passportId: number;
  sectionNumber: number;
  sectionTitle: string;
  content: string | null;
  isCompleted: boolean;
}>
```

#### `sections.update`
Обновление раздела.

**Тип:** Mutation  
**Доступ:** Curator/Admin

**Параметры:**
```typescript
{
  id: number;
  content?: string;
  isCompleted?: boolean;
}
```

---

### Normative Acts Router (`normativeActs.*`)

#### `normativeActs.list`
Получение нормативных актов паспорта.

**Тип:** Query  
**Доступ:** Protected

**Параметры:**
```typescript
{
  passportId: number;
}
```

**Ответ:**
```typescript
Array<{
  id: number;
  passportId: number;
  actType: string;
  actNumber: string;
  actDate: Date;
  actName: string;
  relevantArticles: string | null;
}>
```

#### `normativeActs.create`
Добавление нормативного акта.

**Тип:** Mutation  
**Доступ:** Curator/Admin

**Параметры:**
```typescript
{
  passportId: number;
  actType: string;
  actNumber: string;
  actDate: Date;
  actName: string;
  relevantArticles?: string;
}
```

---

### BPMN Router (`bpmn.*`)

#### `bpmn.list`
Получение BPMN диаграмм паспорта.

**Тип:** Query  
**Доступ:** Protected

**Параметры:**
```typescript
{
  passportId: number;
}
```

**Ответ:**
```typescript
Array<{
  id: number;
  passportId: number;
  name: string;
  type: "as-is" | "to-be";
  bpmnXml: string;
}>
```

#### `bpmn.create`
Создание BPMN диаграммы.

**Тип:** Mutation  
**Доступ:** Curator/Admin

**Параметры:**
```typescript
{
  passportId: number;
  name: string;
  type: "as-is" | "to-be";
  bpmnXml: string;
}
```

---

### Criteria Router (`criteria.*`)

#### `criteria.list`
Получение критериев оценки.

**Тип:** Query  
**Доступ:** Protected

**Параметры:**
```typescript
{
  passportId: number;
}
```

**Ответ:**
```typescript
Array<{
  id: number;
  passportId: number;
  criterionName: string;
  description: string | null;
  dataSource: string | null;
  validationRule: string | null;
}>
```

#### `criteria.create`
Добавление критерия.

**Тип:** Mutation  
**Доступ:** Curator/Admin

**Параметры:**
```typescript
{
  passportId: number;
  criterionName: string;
  description?: string;
  dataSource?: string;
  validationRule?: string;
}
```

---

### Formulas Router (`formulas.*`)

#### `formulas.list`
Получение формул расчета.

**Тип:** Query  
**Доступ:** Protected

**Параметры:**
```typescript
{
  passportId: number;
}
```

**Ответ:**
```typescript
Array<{
  id: number;
  passportId: number;
  formulaName: string;
  formulaExpression: string;
  description: string | null;
}>
```

#### `formulas.create`
Добавление формулы.

**Тип:** Mutation  
**Доступ:** Curator/Admin

**Параметры:**
```typescript
{
  passportId: number;
  formulaName: string;
  formulaExpression: string;
  description?: string;
}
```

---

### Statuses Router (`statuses.*`)

#### `statuses.list`
Получение статусов жизненного цикла.

**Тип:** Query  
**Доступ:** Protected

**Параметры:**
```typescript
{
  passportId: number;
}
```

**Ответ:**
```typescript
Array<{
  id: number;
  passportId: number;
  statusCode: string;
  statusName: string;
  description: string | null;
  isInitial: boolean;
  isFinal: boolean;
}>
```

#### `statuses.create`
Добавление статуса.

**Тип:** Mutation  
**Доступ:** Curator/Admin

**Параметры:**
```typescript
{
  passportId: number;
  statusCode: string;
  statusName: string;
  description?: string;
  isInitial?: boolean;
  isFinal?: boolean;
}
```

---

### Notifications Router (`notifications.*`)

#### `notifications.list`
Получение шаблонов уведомлений.

**Тип:** Query  
**Доступ:** Protected

**Параметры:**
```typescript
{
  passportId: number;
}
```

**Ответ:**
```typescript
Array<{
  id: number;
  passportId: number;
  eventType: string;
  channel: "email" | "sms" | "push";
  templateSubject: string | null;
  templateBody: string;
}>
```

#### `notifications.create`
Создание шаблона уведомления.

**Тип:** Mutation  
**Доступ:** Curator/Admin

**Параметры:**
```typescript
{
  passportId: number;
  eventType: string;
  channel: "email" | "sms" | "push";
  templateSubject?: string;
  templateBody: string;
}
```

---

### SMEV Router (`smev.*`)

#### `smev.list`
Получение СМЭВ интеграций.

**Тип:** Query  
**Доступ:** Protected

**Параметры:**
```typescript
{
  passportId: number;
}
```

**Ответ:**
```typescript
Array<{
  id: number;
  passportId: number;
  serviceName: string;
  serviceCode: string;
  requestType: string;
  description: string | null;
}>
```

#### `smev.create`
Добавление СМЭВ интеграции.

**Тип:** Mutation  
**Доступ:** Curator/Admin

**Параметры:**
```typescript
{
  passportId: number;
  serviceName: string;
  serviceCode: string;
  requestType: string;
  description?: string;
}
```

---

### Comments Router (`comments.*`)

#### `comments.list`
Получение комментариев к паспорту.

**Тип:** Query  
**Доступ:** Protected

**Параметры:**
```typescript
{
  passportId: number;
}
```

**Ответ:**
```typescript
Array<{
  id: number;
  passportId: number;
  userId: string;
  commentText: string;
  createdAt: Date;
}>
```

#### `comments.create`
Добавление комментария.

**Тип:** Mutation  
**Доступ:** Protected

**Параметры:**
```typescript
{
  passportId: number;
  commentText: string;
}
```

---

### Users Router (`users.*`)

#### `users.list`
Получение списка пользователей.

**Тип:** Query  
**Доступ:** Admin

**Ответ:**
```typescript
Array<{
  id: string;
  name: string | null;
  email: string | null;
  role: "user" | "curator" | "admin";
  createdAt: Date;
  lastSignedIn: Date;
}>
```

#### `users.updateRole`
Изменение роли пользователя.

**Тип:** Mutation  
**Доступ:** Admin

**Параметры:**
```typescript
{
  userId: string;
  role: "user" | "curator" | "admin";
}
```

---

## 🔄 Примеры использования

### Frontend (React + tRPC)

```typescript
import { trpc } from "@/lib/trpc";

// Query
function PassportList() {
  const { data, isLoading } = trpc.passports.list.useQuery();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {data?.map(passport => (
        <div key={passport.id}>{passport.serviceName}</div>
      ))}
    </div>
  );
}

// Mutation
function CreatePassport() {
  const utils = trpc.useUtils();
  const createMutation = trpc.passports.create.useMutation({
    onSuccess: () => {
      utils.passports.list.invalidate();
    },
  });
  
  const handleSubmit = () => {
    createMutation.mutate({
      serviceName: "Новая услуга",
      serviceCode: "MSP-001",
    });
  };
  
  return <button onClick={handleSubmit}>Create</button>;
}
```

### Backend (Node.js)

```typescript
import { appRouter } from "./server/routers";
import { createContext } from "./server/_core/context";

// Вызов процедуры напрямую
const caller = appRouter.createCaller(await createContext(req, res));
const passports = await caller.passports.list();
```

## 🚨 Обработка ошибок

tRPC автоматически обрабатывает ошибки и возвращает типизированные коды:

- `UNAUTHORIZED` - не авторизован
- `FORBIDDEN` - нет доступа
- `NOT_FOUND` - ресурс не найден
- `BAD_REQUEST` - неверные параметры
- `INTERNAL_SERVER_ERROR` - ошибка сервера

```typescript
const { data, error } = trpc.passports.get.useQuery({ id: 1 });

if (error) {
  if (error.data?.code === "NOT_FOUND") {
    // Паспорт не найден
  }
}
```

## 📊 Rate Limiting

API использует rate limiting для защиты от злоупотреблений:
- 100 запросов в минуту для авторизованных пользователей
- 20 запросов в минуту для неавторизованных

## 🔒 Безопасность

- Все мутации требуют аутентификации
- Проверка ролей на уровне процедур
- Валидация входных данных с помощью Zod
- Защита от SQL-инъекций через Drizzle ORM
- CORS настроен для безопасности

## 📚 Дополнительная информация

- [tRPC Documentation](https://trpc.io/)
- [Zod Validation](https://zod.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)

