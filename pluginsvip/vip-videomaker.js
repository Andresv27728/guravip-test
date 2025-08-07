
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.quoted || !/video/.test(m.quoted.mimetype || '')) {
    return conn.reply(m.chat, `💎 *VIP Video Editor*

*Uso:* Responde a un video con:
${usedPrefix + command} [efecto] [duración]

*Efectos VIP disponibles:*
• speed - Cambiar velocidad (0.5x - 2x)
• reverse - Video en reversa
• blur - Desenfoque cinematográfico
• vintage - Filtro vintage premium
• neon - Efectos de neón
• glitch - Efecto glitch artístico
• slow - Cámara lenta premium
• fast - Cámara rápida

*Ejemplos:*
${usedPrefix + command} speed 1.5
${usedPrefix + command} reverse
${usedPrefix + command} vintage 10`, m)
  }

  const effect = args[0]?.toLowerCase()
  const duration = args[1] ? parseInt(args[1]) : 30

  if (!effect) {
    return conn.reply(m.chat, '❌ Especifica un efecto VIP.', m)
  }

  if (duration > 60) {
    return conn.reply(m.chat, '⚠️ Duración máxima: 60 segundos para videos VIP.', m)
  }

  try {
    await m.react('💎')
    
    const media = await m.quoted.download()
    const inputPath = `./tmp/vip_input_${Date.now()}.mp4`
    const outputPath = `./tmp/vip_output_${Date.now()}.mp4`
    
    fs.writeFileSync(inputPath, media)
    
    await conn.reply(m.chat, '⏳ Aplicando efectos VIP premium...', m)
    
    let ffmpegCommand = []
    
    switch (effect) {
      case 'speed':
        const speed = args[1] ? parseFloat(args[1]) : 1.5
        if (speed < 0.5 || speed > 2) {
          return conn.reply(m.chat, '❌ Velocidad debe estar entre 0.5x y 2x', m)
        }
        ffmpegCommand = [
          '-i', inputPath,
          '-filter_complex', `[0:v]setpts=${1/speed}*PTS[v];[0:a]atempo=${speed}[a]`,
          '-map', '[v]', '-map', '[a]',
          '-t', duration.toString(),
          '-c:v', 'libx264', '-c:a', 'aac',
          outputPath
        ]
        break
        
      case 'reverse':
        ffmpegCommand = [
          '-i', inputPath,
          '-vf', 'reverse',
          '-af', 'areverse',
          '-t', duration.toString(),
          outputPath
        ]
        break
        
      case 'blur':
        ffmpegCommand = [
          '-i', inputPath,
          '-vf', 'boxblur=5:1',
          '-t', duration.toString(),
          '-c:v', 'libx264',
          outputPath
        ]
        break
        
      case 'vintage':
        ffmpegCommand = [
          '-i', inputPath,
          '-vf', 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131,vignette=angle=PI/4',
          '-t', duration.toString(),
          '-c:v', 'libx264',
          outputPath
        ]
        break
        
      case 'neon':
        ffmpegCommand = [
          '-i', inputPath,
          '-vf', 'eq=contrast=2:brightness=0.2:saturation=3,hue=s=2',
          '-t', duration.toString(),
          '-c:v', 'libx264',
          outputPath
        ]
        break
        
      case 'glitch':
        ffmpegCommand = [
          '-i', inputPath,
          '-vf', 'noise=alls=20:allf=t+u,hue=H=sin(2*PI*t):s=sin(2*PI*t)+1',
          '-t', duration.toString(),
          '-c:v', 'libx264',
          outputPath
        ]
        break
        
      case 'slow':
        ffmpegCommand = [
          '-i', inputPath,
          '-filter_complex', '[0:v]setpts=2*PTS[v];[0:a]atempo=0.5[a]',
          '-map', '[v]', '-map', '[a]',
          '-t', duration.toString(),
          '-c:v', 'libx264', '-c:a', 'aac',
          outputPath
        ]
        break
        
      case 'fast':
        ffmpegCommand = [
          '-i', inputPath,
          '-filter_complex', '[0:v]setpts=0.5*PTS[v];[0:a]atempo=2[a]',
          '-map', '[v]', '-map', '[a]',
          '-t', duration.toString(),
          '-c:v', 'libx264', '-c:a', 'aac',
          outputPath
        ]
        break
        
      default:
        return conn.reply(m.chat, '❌ Efecto no reconocido.', m)
    }

    const ffmpeg = spawn('ffmpeg', ffmpegCommand)
    
    ffmpeg.on('close', async (code) => {
      if (code === 0 && fs.existsSync(outputPath)) {
        const caption = `💎 *Video VIP Editado*
🔥 *Efecto:* ${effect}
⏱️ *Duración:* ${duration}s
⭐ *Calidad:* Premium VIP

> *Editado con tecnología VIP*`

        await conn.sendMessage(m.chat, {
          video: fs.readFileSync(outputPath),
          mimetype: 'video/mp4',
          fileName: `vip_${effect}_${Date.now()}.mp4`,
          caption: caption
        }, { quoted: m })
        
        await m.react('✅')
      } else {
        await m.react('❌')
        conn.reply(m.chat, '❌ Error al procesar el video VIP.', m)
      }
      
      // Limpiar archivos temporales
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
    })

    ffmpeg.on('error', (err) => {
      console.error('FFmpeg error:', err)
      m.react('❌')
      conn.reply(m.chat, '❌ Error en el procesamiento VIP.', m)
      
      // Limpiar archivos temporales
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
    })

  } catch (e) {
    console.error(e)
    await m.react('❌')
    conn.reply(m.chat, '❌ Error en el editor VIP: ' + e.message, m)
  }
}

handler.help = ['vipvideo', 'vipedit']
handler.tags = ['vip-video']
handler.command = /^(vipvideo|vipedit|videovip)$/i

export default handler
