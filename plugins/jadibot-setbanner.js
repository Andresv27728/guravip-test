import fs from 'fs'
import path from 'path'

const handler = async (m, { text, usedPrefix, command }) => {
  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./JadiBots', senderNumber)
  const configPath = path.join(botPath, 'config.json')

  
  const urlRegex = /(https?:\/\/[^\s]+(\.jpg|\.jpeg|\.png|\.webp))/i
  const match = text.match(urlRegex)
  if (!match) {
    return m.reply(`> 📸 Usa así:\n*${usedPrefix + command} https://example.com/banner.jpg*, osea sube la imagen a un hosting de imágenes como catbox.moe, o simplemente utiliza .catbox respondiendo a la imagen q quieres de banner.`)
  }

  if (!fs.existsSync(botPath)) {
    return m.reply('✧ Este comando es sólo para los sub bots. ')
  }

  // Verificar si el sub-bot es premium
  const isPremium = global.premiumSubBots?.includes(senderNumber) || false
  
  if (!isPremium) {
    return m.reply(`
❌ *Función Premium*

Esta función solo está disponible para sub-bots premium.

🌟 *Beneficios Premium:*
• ✅ Personalización de nombre
• ✅ Personalización de banner  
• ✅ Comandos ilimitados
• ✅ Acceso a plugins VIP

💎 Contacta al owner para obtener acceso premium.
`)
  }

  const bannerURL = match[1]

  try {
    const config = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath))
      : {}

    config.banner = bannerURL

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    m.reply(`☁︎ Se cambió el banner correctamente a:\n${bannerURL}`)
  } catch (e) {
    console.error(e)
    m.reply('❌ No se pudo guardar el banner.')
  }
}

handler.help = ['setbanner']
handler.tags= ['serbot']
handler.command = /^setbanner$/i
handler.owner = false
export default handler
