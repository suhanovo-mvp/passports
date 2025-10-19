# Руководство по развертыванию

Данное руководство описывает процесс развертывания системы создания технологических паспортов в различных окружениях.

## 📋 Содержание

1. [Локальное развертывание](#локальное-развертывание)
2. [Развертывание с Docker](#развертывание-с-docker)
3. [Развертывание в облаке](#развертывание-в-облаке)
4. [Настройка базы данных](#настройка-базы-данных)
5. [Настройка безопасности](#настройка-безопасности)
6. [Мониторинг и логирование](#мониторинг-и-логирование)

## 🏠 Локальное развертывание

### Требования

- Node.js 20+
- pnpm 10+
- MySQL 8.0+ или TiDB
- Redis 7+ (опционально)

### Шаги установки

1. **Клонирование репозитория**
```bash
git clone https://github.com/your-username/tech-passport-system.git
cd tech-passport-system
```

2. **Установка зависимостей**
```bash
pnpm install
```

3. **Настройка переменных окружения**
```bash
cp .env.example .env
# Отредактируйте .env файл
```

4. **Настройка базы данных**
```bash
# Создайте базу данных MySQL
mysql -u root -p
CREATE DATABASE tech_passport CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'tech_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON tech_passport.* TO 'tech_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Примените миграции
pnpm db:push
```

5. **Запуск приложения**
```bash
# Режим разработки
pnpm dev

# Production режим
pnpm build
pnpm start
```

## 🐳 Развертывание с Docker

### Вариант 1: Docker Compose (рекомендуется)

1. **Подготовка окружения**
```bash
# Клонируйте репозиторий
git clone https://github.com/your-username/tech-passport-system.git
cd tech-passport-system

# Создайте .env файл
cat > .env << EOF
DB_ROOT_PASSWORD=secure_root_password
DB_NAME=tech_passport
DB_USER=tech_user
DB_PASSWORD=secure_password
JWT_SECRET=$(openssl rand -base64 32)
EOF
```

2. **Запуск сервисов**
```bash
# Запуск в фоновом режиме
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Проверка статуса
docker-compose ps
```

3. **Инициализация базы данных**
```bash
# База данных инициализируется автоматически
# Проверьте логи для подтверждения
docker-compose logs app
```

4. **Доступ к приложению**
```
http://localhost:3000
```

### Вариант 2: Отдельный Docker контейнер

1. **Сборка образа**
```bash
docker build -t tech-passport-system:latest .
```

2. **Запуск контейнера**
```bash
docker run -d \
  --name tech-passport \
  -p 3000:3000 \
  -e DATABASE_URL=mysql://user:password@host:3306/database \
  -e JWT_SECRET=your-secret-key \
  tech-passport-system:latest
```

## ☁️ Развертывание в облаке

### AWS (Amazon Web Services)

#### Использование ECS (Elastic Container Service)

1. **Создание ECR репозитория**
```bash
aws ecr create-repository --repository-name tech-passport-system
```

2. **Сборка и push образа**
```bash
# Аутентификация в ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Сборка образа
docker build -t tech-passport-system .

# Тегирование
docker tag tech-passport-system:latest \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/tech-passport-system:latest

# Push в ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/tech-passport-system:latest
```

3. **Создание ECS задачи и сервиса**
- Используйте AWS Console или Terraform для создания ECS кластера
- Настройте RDS для MySQL
- Настройте ElastiCache для Redis
- Создайте Load Balancer для распределения нагрузки

#### Использование EC2

1. **Запуск EC2 инстанса**
```bash
# Ubuntu 22.04 LTS, t3.medium или больше
```

2. **Установка Docker**
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
```

3. **Клонирование и запуск**
```bash
git clone https://github.com/your-username/tech-passport-system.git
cd tech-passport-system
sudo docker-compose up -d
```

### Google Cloud Platform

#### Использование Cloud Run

1. **Сборка и push в GCR**
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/tech-passport-system
```

2. **Развертывание в Cloud Run**
```bash
gcloud run deploy tech-passport-system \
  --image gcr.io/PROJECT_ID/tech-passport-system \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=mysql://...,JWT_SECRET=...
```

### Azure

#### Использование Azure Container Instances

1. **Создание Container Registry**
```bash
az acr create --resource-group myResourceGroup \
  --name techpassportregistry --sku Basic
```

2. **Push образа**
```bash
az acr build --registry techpassportregistry \
  --image tech-passport-system:latest .
```

3. **Развертывание**
```bash
az container create --resource-group myResourceGroup \
  --name tech-passport \
  --image techpassportregistry.azurecr.io/tech-passport-system:latest \
  --dns-name-label tech-passport \
  --ports 3000
```

## 🗄️ Настройка базы данных

### MySQL

1. **Создание базы данных**
```sql
CREATE DATABASE tech_passport 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;
```

2. **Создание пользователя**
```sql
CREATE USER 'tech_user'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON tech_passport.* TO 'tech_user'@'%';
FLUSH PRIVILEGES;
```

3. **Настройка для production**
```sql
-- Увеличение лимитов
SET GLOBAL max_connections = 500;
SET GLOBAL innodb_buffer_pool_size = 2G;
```

### TiDB (рекомендуется для масштабирования)

TiDB полностью совместим с MySQL и не требует дополнительной настройки.

```bash
# Строка подключения
DATABASE_URL=mysql://user:password@tidb-host:4000/tech_passport
```

## 🔒 Настройка безопасности

### 1. JWT Secret

Генерация безопасного ключа:
```bash
openssl rand -base64 32
```

### 2. HTTPS

Используйте Let's Encrypt для бесплатных SSL сертификатов:

```bash
# Установка certbot
sudo apt install certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d yourdomain.com
```

### 3. Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 4. Ограничение доступа к БД

```sql
-- Разрешить подключения только с определенных IP
CREATE USER 'tech_user'@'10.0.0.%' IDENTIFIED BY 'password';
```

### 5. Регулярные обновления

```bash
# Автоматические обновления безопасности
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📊 Мониторинг и логирование

### Docker Compose логи

```bash
# Просмотр логов всех сервисов
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f app

# Последние 100 строк
docker-compose logs --tail=100 app
```

### Health Checks

Приложение предоставляет health check endpoint:
```bash
curl http://localhost:3000/health
```

### Мониторинг ресурсов

```bash
# Docker stats
docker stats

# Системные ресурсы
htop
```

### Настройка внешнего мониторинга

Рекомендуемые инструменты:
- **Prometheus + Grafana** - метрики и дашборды
- **ELK Stack** - централизованное логирование
- **Sentry** - отслеживание ошибок
- **Uptime Robot** - мониторинг доступности

## 🔄 Обновление приложения

### С Docker Compose

```bash
# Остановка сервисов
docker-compose down

# Получение обновлений
git pull

# Пересборка и запуск
docker-compose up -d --build

# Применение миграций (если требуется)
docker-compose exec app pnpm db:push
```

### Без простоя (Blue-Green Deployment)

1. Запустите новую версию на другом порту
2. Переключите Load Balancer на новую версию
3. Остановите старую версию

## 🔧 Устранение неполадок

### Проблемы с подключением к БД

```bash
# Проверка доступности MySQL
docker-compose exec db mysql -u tech_user -p tech_passport

# Проверка переменных окружения
docker-compose exec app env | grep DATABASE
```

### Проблемы с производительностью

```bash
# Проверка использования ресурсов
docker stats

# Увеличение ресурсов для контейнера
# Отредактируйте docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

### Очистка логов

```bash
# Очистка Docker логов
docker system prune -a --volumes
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `docker-compose logs -f`
2. Проверьте health checks: `curl http://localhost:3000/health`
3. Создайте issue в GitHub репозитории

## 📚 Дополнительные ресурсы

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

