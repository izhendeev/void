# 🚀 Инструкция по деплою VOID³ на Base App

## ✅ Предварительные проверки

- [x] Все изображения созданы (icon.png, splash.png, hero.png, og-image.png, embed-image.png)
- [x] Манифест настроен
- [x] Билд проходит успешно (`npm run build`)
- [x] Соответствие Base Guidelines проверено

## 📦 Шаг 1: Подготовка Git репозитория

Если Git еще не инициализирован:

```bash
cd C:\Users\sense\base-miniapp
git init
git add .
git commit -m "Initial commit: VOID³ - Space Dodge Game"
git branch -M main
```

## 🌐 Шаг 2: Создание GitHub репозитория

1. Зайдите на [github.com](https://github.com) и создайте новый репозиторий (например: `void3-game`)
2. **НЕ** создавайте README, .gitignore или license (уже есть)

3. Подключите локальный репозиторий к GitHub:

```bash
git remote add origin https://github.com/YOUR_USERNAME/void3-game.git
git push -u origin main
```

## 🚢 Шаг 3: Деплой на Vercel

1. Зайдите на [vercel.com](https://vercel.com) и войдите через GitHub

2. Нажмите **"Add New Project"**

3. Импортируйте ваш GitHub репозиторий `void3-game`

4. Настройки проекта:
   - **Framework Preset**: Next.js (определится автоматически)
   - **Root Directory**: `./` (оставьте по умолчанию)
   - **Build Command**: `npm run build` (по умолчанию)
   - **Output Directory**: `.next` (по умолчанию)

5. **Добавьте переменную окружения**:
   - **Name**: `NEXT_PUBLIC_URL`
   - **Value**: `https://your-project.vercel.app` (Vercel присвоит URL автоматически, можно обновить после первого деплоя)

6. Нажмите **"Deploy"**

7. После деплоя Vercel покажет URL вашего приложения (например: `void3-game.vercel.app`)

## ⚙️ Шаг 4: Обновление URL

1. После первого деплоя скопируйте реальный URL от Vercel

2. В Vercel Dashboard:
   - Перейдите в **Settings** → **Environment Variables**
   - Обновите `NEXT_PUBLIC_URL` на реальный URL (например: `https://void3-game.vercel.app`)

3. Передеплойте проект:
   - Перейдите в **Deployments**
   - Найдите последний деплой
   - Нажмите **"..."** → **"Redeploy"**

Или просто сделайте новый commit и push:

```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

## 🔓 Шаг 5: Отключение Deployment Protection

1. В Vercel Dashboard перейдите в **Settings** → **Deployment Protection**

2. Отключите **"Vercel Authentication"** (переключите в OFF)

3. Это необходимо для того, чтобы Base App мог получить доступ к manifest

## 🔐 Шаг 6: Создание Account Association

1. Убедитесь, что manifest доступен:
   - Откройте в браузере: `https://your-app.vercel.app/.well-known/farcaster.json`
   - Должен отобразиться JSON с метаданными приложения

2. Перейдите на [Base Build Account Association](https://base.build/account-association)

3. Вставьте URL вашего приложения (например: `void3-game.vercel.app`)

4. Нажмите **"Verify"** и следуйте инструкциям

5. После успешной верификации скопируйте сгенерированный объект `accountAssociation`

6. Обновите файл `app/.well-known/farcaster.json/route.ts`:

```typescript
accountAssociation: {
  header: "ваш_header",
  payload: "ваш_payload",
  signature: "ваш_signature"
}
```

7. Закоммитьте и запушьте изменения:

```bash
git add app/.well-known/farcaster.json/route.ts
git commit -m "Add account association"
git push
```

Vercel автоматически передеплоит проект.

## ✅ Шаг 7: Проверка приложения

1. Перейдите на [Base Build Preview](https://base.build/preview)

2. Вставьте URL вашего приложения

3. Проверьте:
   - ✅ **Metadata** - метаданные из manifest должны отображаться правильно
   - ✅ **Account association** - должна быть зеленая галочка
   - ✅ **Launch** - запустите приложение и проверьте работу

## 📸 Шаг 8: Добавление скриншотов (опционально)

1. Сделайте скриншоты игры (1284×2778px, portrait)

2. Сохраните их как `screenshot1.png`, `screenshot2.png`, `screenshot3.png` в папку `public/`

3. Раскомментируйте в `app/.well-known/farcaster.json/route.ts`:

```typescript
screenshotUrls: [
  `${ROOT_URL}/screenshot1.png`,
  `${ROOT_URL}/screenshot2.png`,
  `${ROOT_URL}/screenshot3.png`
],
```

4. Закоммитьте и запушьте:

```bash
git add public/screenshot*.png app/.well-known/farcaster.json/route.ts
git commit -m "Add screenshots"
git push
```

## 🎉 Готово!

Ваше приложение должно быть доступно в Base App!

## 🔗 Полезные ссылки

- [Base Build Dashboard](https://base.build)
- [Base Mini Apps Documentation](https://docs.base.org/mini-apps/quickstart/create-new-miniapp)
- [Vercel Dashboard](https://vercel.com/dashboard)

## ⚠️ Важные заметки

- `NEXT_PUBLIC_URL` должен быть правильным URL вашего Vercel проекта
- Manifest должен быть доступен по адресу `/.well-known/farcaster.json`
- Deployment Protection должен быть отключен
- Скриншоты можно добавить позже через Base Build Dashboard
