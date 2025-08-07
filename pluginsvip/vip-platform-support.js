
const handler = async (m, { conn, args, usedPrefix, command }) => {
  // Solo para sub-bots premium
  const currentBotNumber = conn.user?.jid?.split('@')[0]?.replace(/\D/g, '')
  if (!global.premiumSubBots?.includes(currentBotNumber)) {
    return conn.reply(m.chat, '❌ Esta función es exclusiva para sub-bots VIP Premium.', m)
  }

  if (!args[0]) {
    return conn.reply(m.chat, `💎 *Descargador Universal VIP*

*Plataformas soportadas:*
• YouTube (Videos/Audio)
• TikTok (Sin marca de agua)
• Instagram (Posts/Reels/Stories)
• Facebook (Videos)
• Twitter/X (Videos/GIFs)
• Threads (Contenido)
• Pinterest (Imágenes/Videos)
• Reddit (Videos/GIFs)
• Twitch (Clips)
• SoundCloud (Audio)

*Uso:* ${usedPrefix + command} <url> [formato]

*Formatos disponibles:*
• mp4, mp3, hd, 4k

*Ejemplo:*
${usedPrefix + command} https://youtube.com/watch?v=xxx mp4`, m)
  }

  const url = args[0]
  const format = args[1]?.toLowerCase() || 'mp4'

  try {
    await m.react('💎')
    
    // Detectar plataforma automáticamente
    let platform = 'unknown'
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) platform = 'youtube'
    else if (url.includes('tiktok.com')) platform = 'tiktok'
    else if (url.includes('instagram.com')) platform = 'instagram'
    else if (url.includes('facebook.com') || url.includes('fb.watch')) platform = 'facebook'
    else if (url.includes('twitter.com') || url.includes('x.com')) platform = 'twitter'
    else if (url.includes('threads.net')) platform = 'threads'
    else if (url.includes('pinterest.com')) platform = 'pinterest'
    else if (url.includes('reddit.com')) platform = 'reddit'
    else if (url.includes('twitch.tv')) platform = 'twitch'
    else if (url.includes('soundcloud.com')) platform = 'soundcloud'

    // Usar API universal para descargas
    const response = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        url: url,
        vCodec: 'h264',
        vQuality: format === '4k' ? '2160' : format === 'hd' ? '720' : '480',
        aFormat: format === 'mp3' ? 'mp3' : 'best',
        filenamePattern: 'basic',
        isAudioOnly: format === 'mp3'
      })
    })

    const data = await response.json()

    if (data.status === 'success') {
      const caption = `💎 *${platform.toUpperCase()} VIP Download*
🔥 *Formato:* ${format.toUpperCase()}
⚡ *Calidad:* Premium
🌟 *Sin restricciones*

> *Descarga VIP exclusiva*`

      if (format === 'mp3' && data.url) {
        await conn.sendMessage(m.chat, {
          audio: { url: data.url },
          mimetype: 'audio/mpeg',
          fileName: `${platform}_vip.mp3`,
          caption: caption
        }, { quoted: m })
      } else if (data.url) {
        await conn.sendMessage(m.chat, {
          video: { url: data.url },
          mimetype: 'video/mp4',
          fileName: `${platform}_vip.mp4`,
          caption: caption
        }, { quoted: m })
      }
    } else {
      throw new Error(data.text || 'Error en la descarga')
    }

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    conn.reply(m.chat, `❌ Error en descarga VIP: ${e.message}`, m)
  }
}

handler.help = ['vipdown', 'universalvip']
handler.tags = ['vip-downloader']
handler.command = /^(vipdown|universalvip|downvip)$/i

export default handler
