#!/bin/bash

# Скрипт для тестирования Docker сборки
# Использование: ./scripts/test-docker.sh

set -e

echo "🐳 Тестирование Docker сборки..."

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker и попробуйте снова."
    exit 1
fi

# Проверка наличия docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo "⚠️  docker-compose не установлен. Некоторые тесты будут пропущены."
fi

# Сборка образа
echo "📦 Сборка Docker образа..."
docker build -t tech-passport-system:test .

# Проверка размера образа
echo "📊 Размер образа:"
docker images tech-passport-system:test --format "{{.Size}}"

# Запуск контейнера для тестирования
echo "🚀 Запуск тестового контейнера..."
docker run -d \
  --name tech-passport-test \
  -p 3001:3000 \
  -e DATABASE_URL=mysql://test:test@localhost:3306/test \
  -e JWT_SECRET=test-secret \
  tech-passport-system:test

# Ожидание запуска
echo "⏳ Ожидание запуска приложения..."
sleep 10

# Проверка health check
echo "🏥 Проверка health check..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Health check пройден"
else
    echo "❌ Health check не пройден"
    docker logs tech-passport-test
fi

# Очистка
echo "🧹 Очистка..."
docker stop tech-passport-test
docker rm tech-passport-test

echo "✅ Тестирование завершено!"

