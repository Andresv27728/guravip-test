
import ytdl from 'ytdl-core'
import fs from 'fs'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `💎 *YouTube VIP Downloader*

*Uso:* ${usedPrefix + command} <url> [formato]

*Formatos disponibles:*
• mp4 - Video en MP4 (calidad premium)
• mp3 - Audio en MP3 (320kbps)
• hd - Video en alta definición
• 4k - Video en 4K (si disponible)

*Ejemplo:*
${usedPrefix + command} https://youtu.be/xxx mp4`, m)
  }

  const url = args[0]
  const format = args[1]?.toLowerCase() || 'mp4'

  if (!ytdl.validateURL(url)) {
    return conn.reply(m.chat, '❌ URL de YouTube inválida.', m)
  }

  try {
    await m.react('💎')
    
    const info = await ytdl.getInfo(url)
    const title = info.videoDetails.title
    const duration = info.videoDetails.lengthSeconds
    
    if (duration > 600) { // 10 minutos
      return conn.reply(m.chat, '⚠️ Video muy largo. Los VIP pueden descargar videos de hasta 10 minutos.', m)
    }

    let options = {}
    let fileName = ''
    let caption = `💎 *${title}*\n🔥 *Descarga VIP Premium*\n⏱️ *Duración:* ${Math.floor(duration/60)}:${(duration%60).toString().padStart(2,'0')}`

    switch (format) {
      case 'mp3':
        options = { quality: 'highestaudio', filter: 'audioonly' }
        fileName = `${title}.mp3`
        caption += '\n🎵 *Formato:* Audio MP3 320kbps'
        break
      case 'hd':
        options = { quality: 'highest', filter: 'videoandaudio' }
        fileName = `${title}_HD.mp4`
        caption += '\n📹 *Formato:* Video HD Premium'
        break
      case '4k':
        options = { quality: 'highest', filter: 'videoandaudio', format: 'mp4' }
        fileName = `${title}_4K.mp4`
        caption += '\n🎬 *Formato:* Video 4K Ultra'
        break
      default:
        options = { quality: 'highest', filter: 'videoandaudio' }
        fileName = `${title}.mp4`
        caption += '\n📱 *Formato:* Video MP4 Premium'
    }

    const stream = ytdl(url, options)
    const tempPath = `./tmp/vip_${Date.now()}_${fileName}`
    
    await conn.reply(m.chat, '⏳ Descargando con calidad VIP premium...', m)
    
    const writeStream = fs.createWriteStream(tempPath)
    stream.pipe(writeStream)
    
    writeStream.on('finish', async () => {
      try {
        if (format === 'mp3') {
          await conn.sendMessage(m.chat, {
            audio: fs.readFileSync(tempPath),
            mimetype: 'audio/mpeg',
            fileName: fileName,
            caption: caption
          }, { quoted: m })
        } else {
          await conn.sendMessage(m.chat, {
            video: fs.readFileSync(tempPath),
            mimetype: 'video/mp4',
            fileName: fileName,
            caption: caption
          }, { quoted: m })
        }
        
        fs.unlinkSync(tempPath)
        await m.react('✅')
      } catch (e) {
        console.error(e)
        await m.react('❌')
        fs.unlinkSync(tempPath)
        conn.reply(m.chat, '❌ Error al enviar el archivo.', m)
      }
    })

    writeStream.on('error', (e) => {
      console.error(e)
      m.react('❌')
      conn.reply(m.chat, '❌ Error en la descarga VIP.', m)
    })

  } catch (e) {
    console.error(e)
    await m.react('❌')
    conn.reply(m.chat, '❌ Error al procesar la descarga VIP.', m)
  }
}

handler.help = ['vipyt', 'vipytdl']
handler.tags = ['vip-downloader']
handler.command = /^(vipyt|vipytdl|vipy)$/i

export default handler
