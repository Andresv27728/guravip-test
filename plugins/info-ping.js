
import fs from 'fs'
import path from 'path'

// Lista de bordes aleatorios con pares de bordes superior e inferior
const borders = [
  { top: '╭───────────────🌊🦈🌊───────────────╮', bottom: '╰───────────────🌊🦈🌊───────────────╯' },
  { top: '╭═══════════════🐟✨🐟═══════════════╮', bottom: '╰═══════════════🐟✨🐟═══════════════╯' },
  { top: '╔═══════════════💙🦈💙═══════════════╗', bottom: '╚═══════════════💙🦈💙═══════════════╝' },
  { top: '╔────────────────🐬🌊🐬────────────────╗', bottom: '╚────────────────🐬🌊🐬────────────────╝' },
  { top: '╭✧･ﾟ: *✧･ﾟ: 🦈* :･ﾟ✧ :･ﾟ✧╮', bottom: '╰✧･ﾟ: *✧･ﾟ: 🦈* :･ﾟ✧ :･ﾟ✧╯' },
  { top: '╭━━━━━ 🌟 🦈 🌟 ━━━━━╮', bottom: '╰━━━━━ 🌟 🦈 🌟 ━━━━━╯' },
]

const handler = async (m, { conn }) => {
  const start = process.hrtime.bigint()

  // Obtener el número del bot actual (la sesión activa)
  const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
  const configPath = path.join('./JadiBots', botActual, 'config.json')

  let nombreBot = global.namebot || '🌊🦈 𝙂𝘼𝙒𝙍 𝙂𝙐𝙍𝘼 🦈🌊'

  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      if (config.name) nombreBot = config.name
    } catch (err) {
      console.log('⚠️ No se pudo leer config del subbot:', err)
    }
  }

  const end = process.hrtime.bigint()
  const latency = Number(end - start) / 1000000 // Convertir a milisegundos con decimales

  // Seleccionar un par de bordes aleatorio
  const randomBorder = borders[Math.floor(Math.random() * borders.length)]

  // Determinar el estado de la conexión
  let status = '🟢 Excelente'
  if (latency > 100) status = '🟡 Bueno'
  if (latency > 300) status = '🔴 Lento'

  // Crear el mensaje decorado
  const decoratedMessage = `
${randomBorder.top}
│                                    │
│   ⚡ *Ping:* ${latency.toFixed(2)} ms           │
│   📊 *Estado:* ${status}                 │
│   🦈 *Bot:* ${nombreBot}        │
│                                    │
${randomBorder.bottom}
`

  await conn.sendMessage(m.chat, { 
    text: decoratedMessage 
  }, { quoted: m })
}

handler.command = ['p', 'ping']
export default handler
