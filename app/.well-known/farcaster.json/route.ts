import { NextResponse } from 'next/server'

const ROOT_URL = (process.env.NEXT_PUBLIC_URL || 'https://void-ruddy.vercel.app').replace(/\/$/, '')

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
      header: "eyJmaWQiOjI4OTM2MCwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDkyMjVCMTRiQ0I2RjdjMDNENzkxRTA3NTk0NjI5MjQwOTlCY2IxQ2EifQ",
      payload: "eyJkb21haW4iOiJ2b2lkLXJ1ZGR5LnZlcmNlbC5hcHAifQ",
      signature: "AAAAAAAAAAAAAAAAyhG94Fl3s2MRZwKIYr4qFzl2yhEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkSCrVbLAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAul7REO_bo9AFv8iC11NYrLu4WEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVQ_-6NvAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAJpK9E-rqqIwm6NHEMTtwAfFV91Vi0bkflYjDH6h4cb9OSiDW7hqG4HIa04-i2ju-5zvtt-8pQB1-Qr30EvaYzAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAWepK3GOmX6M-I13XW-S8SSwYDjrhWwqMROytRWUz0BEOrSzgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABhONckBkw3Nhb8mArNSUHm_kr7f3ZEFQfxrQCq3nWjA5z9XpxR43jjMKVfRlTRiWL6OKWwZN0gvnQ4MROd_onTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAl8ZgIay2xclZzG8RWZzuWvO8j9R0fus3XxDee9lRlVy8dAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC-eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiNlRSTUp3akNSRkF4NEw4M25YMTZWZTNwWnJXWWFKOUZLZmFYVi1LNGl0OCIsIm9yaWdpbiI6ImFuZHJvaWQ6YXBrLWtleS1oYXNoOkVBT1d3T1FBQmhzUVhkbGdHaTVoQk9hZHg3VFk2WlhfQ3FKbHBveGYxaGsiLCJhbmRyb2lkUGFja2FnZU5hbWUiOiJvcmcudG9zaGkifQAAZJJkkmSSZJJkkmSSZJJkkmSSZJJkkmSSZJJkkmSSZJI"
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
