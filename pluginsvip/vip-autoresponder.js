
import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const currentBotNumber = conn.user?.jid?.split('@')[0]?.replace(/\D/g, '')
  const configPath = path.join('./JadiBots', currentBotNumber, 'autoresponder.json')
  
  const args = text.split(' ')
  const action = args[0]?.toLowerCase()
  
  if (!action || !['add', 'remove', 'list', 'toggle'].includes(action)) {
    return m.reply(`
🤖 *Auto-Respuesta VIP*

*Uso:*
${usedPrefix + command} add <palabra> | <respuesta>
${usedPrefix + command} remove <palabra>
${usedPrefix + command} list
${usedPrefix + command} toggle

*Ejemplo:*
${usedPrefix + command} add hola | ¡Hola! ¿Cómo estás?
`)
  }
  
  // Crear archivo si no existe
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ enabled: false, responses: {} }, null, 2))
  }
  
  const config = JSON.parse(fs.readFileSync(configPath))
  
  if (action === 'toggle') {
    config.enabled = !config.enabled
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    return m.reply(`🤖 Auto-respuesta ${config.enabled ? 'activada' : 'desactivada'}`)
  }
  
  if (action === 'list') {
    const responses = Object.keys(config.responses)
    if (responses.length === 0) {
      return m.reply('📝 No hay respuestas automáticas configuradas.')
    }
    
    let list = '*📝 Respuestas Automáticas:*\n\n'
    responses.forEach((word, index) => {
      list += `${index + 1}. "${word}" → "${config.responses[word]}"\n`
    })
    
    return m.reply(list)
  }
  
  if (action === 'add') {
    const content = args.slice(1).join(' ')
    const [word, response] = content.split(' | ')
    
    if (!word || !response) {
      return m.reply('❌ Formato incorrecto. Usa: add <palabra> | <respuesta>')
    }
    
    config.responses[word.toLowerCase()] = response
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    return m.reply(`✅ Respuesta automática agregada para: "${word}"`)
  }
  
  if (action === 'remove') {
    const word = args.slice(1).join(' ').toLowerCase()
    
    if (!config.responses[word]) {
      return m.reply('❌ Esa palabra no tiene respuesta automática.')
    }
    
    delete config.responses[word]
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    return m.reply(`✅ Respuesta automática eliminada para: "${word}"`)
  }
}

handler.help = ['vipautoresp']
handler.tags = ['vip']
handler.command = /^(vipautoresp|autorespuestavirus)$/i

export default handler
