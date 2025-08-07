
const handler = async (m, { conn }) => {
  const currentBotNumber = conn.user?.jid?.split('@')[0]?.replace(/\D/g, '')
  
  let stats = `
🌟 *ESTADÍSTICAS VIP* 🌟

👤 *Sub-Bot:* ${conn.user.name}
📱 *Número:* wa.me/${currentBotNumber}
⭐ *Tipo:* Premium
🕐 *Uptime:* ${clockString(process.uptime() * 1000)}

📊 *Estadísticas del Bot:*
• Usuarios en BD: ${Object.keys(global.db.data.users).length}
• Grupos activos: ${Object.keys(global.db.data.chats).length}
• Plugins cargados: ${Object.keys(global.plugins).length}

💎 *Ventajas Premium:*
✅ Comandos ilimitados
✅ Personalización completa
✅ Plugins exclusivos
✅ Soporte prioritario
`

  await conn.reply(m.chat, stats, m)
}

handler.help = ['vipstats']
handler.tags = ['vip']
handler.command = /^(vipstats|estadisticasvip)$/i

export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
