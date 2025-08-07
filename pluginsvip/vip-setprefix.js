
import fs from 'fs'
import { join } from 'path'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  // Solo para sub-bots premium
  const currentBotNumber = conn.user?.jid?.split('@')[0]?.replace(/\D/g, '')
  if (!global.premiumSubBots?.includes(currentBotNumber)) {
    return conn.reply(m.chat, '❌ Esta función es exclusiva para sub-bots VIP Premium.', m)
  }

  if (!args[0]) {
    const configPath = join('./JadiBots', currentBotNumber, 'config.json')
    let currentPrefix = '.'
    
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath))
        currentPrefix = config.prefix || '.'
      } catch (e) {
        console.log('Error leyendo config:', e)
      }
    }

    return conn.reply(m.chat, `💎 *Configuración de Prefijo VIP*

*Prefijo actual:* \`${currentPrefix}\`

*Uso:* ${usedPrefix + command} <nuevo_prefijo>

*Ejemplos:*
• ${usedPrefix + command} !
• ${usedPrefix + command} #
• ${usedPrefix + command} /
• ${usedPrefix + command} >
• ${usedPrefix + command} .

*Nota:* Solo caracteres especiales y de 1-2 caracteres`, m)
  }

  const newPrefix = args[0].trim()

  // Validaciones
  if (newPrefix.length > 2) {
    return conn.reply(m.chat, '❌ El prefijo debe tener máximo 2 caracteres.', m)
  }

  if (/[a-zA-Z0-9]/.test(newPrefix)) {
    return conn.reply(m.chat, '❌ El prefijo no puede contener letras o números. Usa símbolos como: ! # / > < * + = -', m)
  }

  try {
    const configDir = join('./JadiBots', currentBotNumber)
    const configPath = join(configDir, 'config.json')
    
    // Crear directorio si no existe
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
    }

    let config = {}
    if (fs.existsSync(configPath)) {
      try {
        config = JSON.parse(fs.readFileSync(configPath))
      } catch (e) {
        config = {}
      }
    }

    config.prefix = newPrefix
    config.lastUpdate = new Date().toISOString()

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

    // Actualizar prefijo en el bot actual
    conn.prefix = newPrefix

    conn.reply(m.chat, `✅ *Prefijo VIP actualizado*

💎 *Nuevo prefijo:* \`${newPrefix}\`
🔥 *Estado:* Activo inmediatamente
⚡ *Ejemplo:* \`${newPrefix}vipmenu\`

> *Configuración VIP guardada*`, m)

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ Error al configurar el prefijo VIP.', m)
  }
}

handler.help = ['vipprefix', 'setprefix']
handler.tags = ['vip']
handler.command = /^(vipprefix|setprefix|prefijovip)$/i

export default handler
