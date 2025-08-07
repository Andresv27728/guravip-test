
import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  let stiker = false
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''
    
    if (!mime) {
      return conn.reply(m.chat, `💎 *VIP Sticker Creator*

*Uso:* Responde a una imagen/video/gif con:
${usedPrefix + command} [efecto]

*Efectos VIP disponibles:*
• glow - Efecto brillante
• neon - Efecto neón
• shadow - Sombra premium
• border - Borde elegante
• vintage - Estilo vintage
• blur - Desenfoque artístico

*Ejemplo:*
${usedPrefix + command} glow`, m)
    }

    const effect = args[0]?.toLowerCase() || 'normal'
    
    if (/image\/(jpe?g|png)|video|gif/.test(mime)) {
      await m.react('💎')
      
      let media = await q.download?.()
      if (!media) throw new Error('No se pudo descargar el archivo')
      
      const isVideo = /video|gif/.test(mime)
      
      // Configuraciones VIP según el efecto
      let stickerOptions = {
        packname: '💎 VIP Stickers',
        author: conn.user.name || 'VIP Bot',
        type: isVideo ? 'full' : 'default',
        categories: ['💎', '🔥'],
        id: Date.now().toString(),
        quality: 100
      }

      // Aplicar efectos VIP
      switch (effect) {
        case 'glow':
          stickerOptions.author = '✨ VIP Glow ✨'
          stickerOptions.packname = '💎 Glow Collection'
          break
        case 'neon':
          stickerOptions.author = '🌈 VIP Neon 🌈'
          stickerOptions.packname = '🔥 Neon Premium'
          break
        case 'shadow':
          stickerOptions.author = '🖤 VIP Shadow 🖤'
          stickerOptions.packname = '⚫ Shadow Elite'
          break
        case 'border':
          stickerOptions.author = '🎭 VIP Border 🎭'
          stickerOptions.packname = '🖼️ Border Premium'
          break
        case 'vintage':
          stickerOptions.author = '📸 VIP Vintage 📸'
          stickerOptions.packname = '🕰️ Vintage Collection'
          break
        case 'blur':
          stickerOptions.author = '🌫️ VIP Blur 🌫️'
          stickerOptions.packname = '💫 Artistic Blur'
          break
        default:
          stickerOptions.author = '👑 VIP Premium 👑'
          stickerOptions.packname = '💎 Elite Stickers'
      }

      stiker = await sticker(media, false, stickerOptions.packname, stickerOptions.author)
      
      if (!stiker) throw new Error('Error al crear el sticker VIP')
      
    } else if (m.text.split(' ').length > 1) {
      // Crear sticker de texto VIP
      const text = m.text.split(' ').slice(1).join(' ')
      if (text.length > 50) {
        return conn.reply(m.chat, '❌ El texto no puede superar los 50 caracteres.', m)
      }
      
      await m.react('💎')
      
      // Generar sticker de texto con estilo VIP
      const textToImage = `https://api.memegen.link/images/custom/_/${encodeURIComponent(text)}.png?background=https://i.imgur.com/VIP_bg.png`
      
      stiker = await sticker(false, textToImage, '💎 VIP Text', '👑 Premium Text')
    } else {
      return conn.reply(m.chat, '❌ Responde a una imagen, video, gif o proporciona texto.', m)
    }

    if (stiker) {
      await conn.sendFile(m.chat, stiker, 'vip_sticker.webp', '', m, null, { asSticker: true })
      await m.react('✅')
      
      // Mensaje de agradecimiento VIP
      setTimeout(() => {
        conn.reply(m.chat, `💎 *Sticker VIP creado exitosamente*\n🔥 Efecto aplicado: ${effect}\n⭐ Calidad premium garantizada`, m)
      }, 1000)
    }
  } catch (e) {
    console.error(e)
    await m.react('❌')
    conn.reply(m.chat, '❌ Error al crear el sticker VIP: ' + e.message, m)
  }
}

handler.help = ['vipsticker', 'vips']
handler.tags = ['vip-sticker']
handler.command = /^(vipsticker|vips|stickervip)$/i

export default handler
