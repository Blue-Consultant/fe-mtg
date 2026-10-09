function allowedCapture(value) {
  let parsed

  try {
    parsed = new URL(value)
  } catch {
    return null
  }

  const host = parsed.hostname.toLowerCase()
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':')

  if (parsed.protocol !== 'https:') return null
  if (isIp || host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) return null
  if (!parsed.pathname.includes('/payments/yape/') && !parsed.pathname.includes('/payments/manual/')) return null

  return parsed
}

export async function GET(request) {
  const target = allowedCapture(new URL(request.url).searchParams.get('url') || '')

  if (!target) {
    return Response.json({ message: 'No se puede descargar esa imagen.' }, { status: 400 })
  }

  try {
    const upstream = await fetch(target)

    if (!upstream.ok) {
      return Response.json({ message: 'No se pudo descargar la captura.' }, { status: 502 })
    }

    const type = upstream.headers.get('content-type') || 'image/jpeg'
    const bytes = await upstream.arrayBuffer()
    const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg'

    return new Response(bytes, {
      headers: {
        'Content-Type': type,
        'Content-Disposition': `attachment; filename="yape.${ext}"`,
        'Cache-Control': 'private, max-age=60'
      }
    })
  } catch {
    return Response.json({ message: 'No se pudo descargar la captura.' }, { status: 502 })
  }
}
