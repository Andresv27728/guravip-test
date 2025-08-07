
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn }) => {
  await m.react('🎲')
  
  // Número aleatorio del 1 al 6
  const numeroAleatorio = Math.floor(Math.random() * 6) + 1
  
  // Generar el sticker del dado
  const dadoText = `
  ╭─────────────╮
  │    DADO     │
  │             │
  │      ${numeroAleatorio}      │
  │             │
  │   🎲 ${numeroAleatorio} 🎲   │
  ╰─────────────╯
  `
  
  try {
    // Crear sticker con el resultado
    const stickerBuffer = await sticker(false, 'https://api.lolhuman.xyz/api/ttp6?apikey=GataDios&text=' + encodeURIComponent(dadoText), global.packname, global.author)
    
    await conn.sendFile(m.chat, stickerBuffer, 'dado.webp', '', m)
    
    // Mensaje adicional
    await conn.reply(m.chat, `🎲 *¡Has lanzado el dado!*\n\n*Resultado:* ${numeroAleatorio}`, m, rcanal)
    
    await m.react('✅')
  } catch (e) {
    console.error('Error creando sticker de dado:', e)
    await conn.reply(m.chat, `🎲 *¡Has lanzado el dado!*\n\n*Resultado:* ${numeroAleatorio}`, m, rcanal)
    await m.react('✅')
  }
}

handler.help = ['dado']
handler.tags = ['game']
handler.command = ['dado', 'dice']

export default handler
