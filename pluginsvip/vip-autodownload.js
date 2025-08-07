
const handler = async (m, { conn }) => {
  // Solo para sub-bots premium
  const currentBotNumber = conn.user?.jid?.split('@')[0]?.replace(/\D/g, '')
  if (!global.premiumSubBots?.includes(currentBotNumber)) return

  // Detectar links de diferentes plataformas
  const patterns = {
    youtube: /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
    tiktok: /(?:tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)\/[^\s]+/i,
    instagram: /(?:instagram\.com\/(?:p|reel|tv)\/[^\s]+)/i,
    facebook: /(?:facebook\.com|fb\.watch)\/[^\s]+/i,
    twitter: /(?:twitter\.com|x\.com)\/[^\s]+\/status\/\d+/i,
    threads: /threads\.net\/[^\s]+/i
  }

  let detectedPlatform = null
  let url = null

  for (const [platform, regex] of Object.entries(patterns)) {
    const match = m.text.match(regex)
    if (match) {
      detectedPlatform = platform
      url = match[0]
      break
    }
  }

  if (!detectedPlatform || !url) return

  try {
    await m.react('💎')
    
    switch (detectedPlatform) {
      case 'youtube':
        await downloadYoutube(conn, m, url)
        break
      case 'tiktok':
        await downloadTiktok(conn, m, url)
        break
      case 'instagram':
        await downloadInstagram(conn, m, url)
        break
      case 'facebook':
        await downloadFacebook(conn, m, url)
        break
      case 'twitter':
        await downloadTwitter(conn, m, url)
        break
      case 'threads':
        await downloadThreads(conn, m, url)
        break
    }
    
    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    conn.reply(m.chat, `❌ Error en descarga automática VIP de ${detectedPlatform}`, m)
  }
}

// Funciones de descarga para cada plataforma
async function downloadYoutube(conn, m, url) {
  const response = await fetch(`https://api.cobalt.tools/api/json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, vCodec: 'h264', vQuality: '720' })
  })
  
  const data = await response.json()
  if (data.status === 'success' && data.url) {
    await conn.sendMessage(m.chat, {
      video: { url: data.url },
      caption: '💎 *YouTube VIP Auto-Download*\n🔥 Descarga automática premium'
    }, { quoted: m })
  }
}

async function downloadTiktok(conn, m, url) {
  const apis = [
    `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`,
    `https://api.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`
  ]

  for (const api of apis) {
    try {
      const response = await fetch(api)
      const data = await response.json()
      
      if (data.status && (data.video || data.data?.play)) {
        const videoUrl = data.video || data.data?.play || data.data?.hdplay
        await conn.sendMessage(m.chat, {
          video: { url: videoUrl },
          caption: '💎 *TikTok VIP Auto-Download*\n🎭 Sin marca de agua'
        }, { quoted: m })
        break
      }
    } catch (e) {
      continue
    }
  }
}

async function downloadInstagram(conn, m, url) {
  const response = await fetch(`https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`)
  const data = await response.json()
  
  if (data.thumbnail_url) {
    await conn.sendMessage(m.chat, {
      image: { url: data.thumbnail_url },
      caption: '💎 *Instagram VIP Auto-Download*\n📱 Vista previa automática'
    }, { quoted: m })
  }
}

async function downloadFacebook(conn, m, url) {
  try {
    const response = await fetch(`https://api.cobalt.tools/api/json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
    
    const data = await response.json()
    if (data.status === 'success' && data.url) {
      await conn.sendMessage(m.chat, {
        video: { url: data.url },
        caption: '💎 *Facebook VIP Auto-Download*\n🌐 Descarga premium'
      }, { quoted: m })
    }
  } catch (e) {
    console.log('Facebook download failed:', e)
  }
}

async function downloadTwitter(conn, m, url) {
  try {
    const response = await fetch(`https://api.cobalt.tools/api/json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
    
    const data = await response.json()
    if (data.status === 'success' && data.url) {
      await conn.sendMessage(m.chat, {
        video: { url: data.url },
        caption: '💎 *Twitter/X VIP Auto-Download*\n🐦 Descarga automática'
      }, { quoted: m })
    }
  } catch (e) {
    console.log('Twitter download failed:', e)
  }
}

async function downloadThreads(conn, m, url) {
  try {
    const response = await fetch(`https://api.threads-downloader.com/download?url=${encodeURIComponent(url)}`)
    const data = await response.json()
    
    if (data.success && data.data?.video_url) {
      await conn.sendMessage(m.chat, {
        video: { url: data.data.video_url },
        caption: '💎 *Threads VIP Auto-Download*\n🧵 Contenido premium'
      }, { quoted: m })
    }
  } catch (e) {
    console.log('Threads download failed:', e)
  }
}

handler.all = true
handler.priority = 5

export default handler
