import { NextResponse } from 'next/server'

const ROOT_URL = (process.env.NEXT_PUBLIC_URL || 'https://izhndv.vercel.app').replace(/\/$/, '')

function withValidProperties(properties: Record<string, undefined | string | string[] | boolean>) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      // Always include noindex even if false
      if (key === 'noindex') return true;
      // Filter out empty values
      return Array.isArray(value) ? value.length > 0 : (value !== undefined && value !== null && value !== '');
    })
  )
}

export async function GET() {
  const manifest = {
    accountAssociation: {
      // ⚠️ ВАЖНО: Заполните эти поля после генерации accountAssociation в Base Build
      // 
      // Инструкция:
      // 1. Убедитесь, что манифест доступен по адресу: https://izhndv.vercel.app/.well-known/farcaster.json
      // 2. Перейдите на https://www.base.dev/ → Account association tool
      // 3. Введите домен: izhndv.vercel.app (без https://)
      // 4. Нажмите "Submit", затем "Verify" и следуйте инструкциям
      // 5. Скопируйте сгенерированные значения header, payload, signature сюда
      //
      header: "",
      payload: "",
      signature: ""
    },
    miniapp: withValidProperties({
      version: "1",
      name: "VOID³",
      homeUrl: ROOT_URL,
      iconUrl: `${ROOT_URL}/icon.png`,
      splashImageUrl: `${ROOT_URL}/splash.png`,
      splashBackgroundColor: "#000011",
      webhookUrl: `${ROOT_URL}/api/webhook`,
      subtitle: "Space dodge game",
      description: "Dodge asteroids and set high scores in this exciting space game. Save your records on Base blockchain.",
      // Screenshots можно добавить после деплоя через Base Build dashboard
      // screenshotUrls: [
      //   `${ROOT_URL}/screenshot1.png`,
      //   `${ROOT_URL}/screenshot2.png`,
      //   `${ROOT_URL}/screenshot3.png`
      // ],
      primaryCategory: "games",
      tags: ["game", "miniapp", "base", "space", "dodge"],
      heroImageUrl: `${ROOT_URL}/hero.png`,
      tagline: "Dodge. Survive. Dominate.",
      ogTitle: "VOID³ - Space Dodge Game",
      ogDescription: "Dodge asteroids and set high scores. Save your records on Base blockchain.",
      ogImageUrl: `${ROOT_URL}/og-image.png`,
      noindex: false
    })
  }

  return NextResponse.json(manifest)
}
