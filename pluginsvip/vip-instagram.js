
import fetch from 'node-fetch'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `💎 *Instagram VIP Downloader*

*Uso:* ${usedPrefix + command} <url>

*Soporta:*
• Posts de Instagram
• Reels
• IGTV
• Stories (si son públicas)
• Carruseles (múltiples fotos)

*Ejemplo:*
${usedPrefix + command} https://instagram.com/p/xxx`, m)
  }

  const url = args[0]
  if (!url.match(/instagram\.com\/(p|reel|tv)/)) {
    return conn.reply(m.chat, '❌ Proporciona una URL válida de Instagram.', m)
  }

  try {
    await m.react('💎')
    
    const response = await fetch(`https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`)
    const data = await response.json()
    
    if (!data.thumbnail_url) {
      return conn.reply(m.chat, '❌ No se pudo obtener información del post.', m)
    }

    // Usar diferentes APIs para la descarga
    const downloadApis = [
      `https://api.saveinsta.app/download?url=${encodeURIComponent(url)}`,
      `https://api.instagram-downloader.co/download?url=${encodeURIComponent(url)}`,
      `https://insta-dl.hazex.workers.dev/?url=${encodeURIComponent(url)}`
    ]

    let downloadResult = null
    
    for (const api of downloadApis) {
      try {
        const dlResponse = await fetch(api)
        const dlData = await dlResponse.json()
        
        if (dlData.success && dlData.data) {
          downloadResult = dlData.data
          break
        }
      } catch (e) {
        continue
      }
    }

    const caption = `💎 *Instagram VIP Download*
📱 *Usuario:* ${data.author_name}
🔥 *Tipo:* ${url.includes('/reel/') ? 'Reel' : url.includes('/tv/') ? 'IGTV' : 'Post'}
⭐ *Calidad Premium*

> *Descarga VIP exclusiva*`

    if (downloadResult && downloadResult.video_url) {
      // Es un video/reel
      await conn.sendMessage(m.chat, {
        video: { url: downloadResult.video_url },
        mimetype: 'video/mp4',
        fileName: 'instagram_vip.mp4',
        caption: caption
      }, { quoted: m })
    } else if (downloadResult && downloadResult.image_url) {
      // Es una imagen
      await conn.sendMessage(m.chat, {
        image: { url: downloadResult.image_url },
        caption: caption
      }, { quoted: m })
    } else {
      // Fallback con thumbnail
      await conn.sendMessage(m.chat, {
        image: { url: data.thumbnail_url },
        caption: caption + '\n\n⚠️ *Nota:* Solo se pudo obtener la miniatura.'
      }, { quoted: m })
    }

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    conn.reply(m.chat, '❌ Error en la descarga VIP de Instagram.', m)
  }
}

handler.help = ['vipig', 'vipinsta']
handler.tags = ['vip-downloader']
handler.command = /^(vipig|vipinsta|vipinstagram)$/i

export default handler
