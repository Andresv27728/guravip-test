import fs from 'fs'
import os from 'os'

const handler = async (m, { conn }) => {
  try {
    // Información del sistema
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2)
    const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2)
    const usedMem = (totalMem - freeMem).toFixed(2)
    const cpuUsage = os.loadavg()[0].toFixed(2)
    const uptime = process.uptime()

    // Estadísticas del bot
    const totalChats = Object.keys(global.db.data.chats || {}).length
    const totalUsers = Object.keys(global.db.data.users || {}).length
    const totalPlugins = fs.readdirSync('./plugins').filter(file => file.endsWith('.js')).length

    // Información de Node.js
    const nodeVersion = process.version
    const platform = os.platform()
    const arch = os.arch()

    // Runtime formateado
    const days = Math.floor(uptime / 86400)
    const hours = Math.floor((uptime % 86400) / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    const seconds = Math.floor(uptime % 60)

    const runtimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`

    // Porcentaje de memoria
    const memPercent = ((usedMem / totalMem) * 100).toFixed(1)

    const infoMsg = `
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
│                                                    │
│  🦈 ••••••••••••••••••••••••••••••••••••••••••••• 🦈  │
│             ✨ *INFORMACIÓN DEL BOT* ✨               │
│  🦈 ••••••••••••••••••••••••••••••••••••••••••••• 🦈  │
│                                                    │
│  📊 *ESTADÍSTICAS EN TIEMPO REAL*                   │
│  ├─ 👥 Chats Registrados: ${totalChats}                    │
│  ├─ 👤 Usuarios Registrados: ${totalUsers}                 │
│  ├─ 🔧 Plugins Cargados: ${totalPlugins}                   │
│  └─ ⏰ Tiempo Activo: ${runtimeStr}                │
│                                                    │
│  💻 *INFORMACIÓN DEL SISTEMA*                       │
│  ├─ 🖥️ Plataforma: ${platform} (${arch})              │
│  ├─ 🟢 Node.js: ${nodeVersion}                         │
│  ├─ 💾 RAM Total: ${totalMem} GB                       │
│  ├─ 🔥 RAM Usada: ${usedMem} GB (${memPercent}%)           │
│  ├─ 💚 RAM Libre: ${freeMem} GB                        │
│  └─ ⚡ CPU Load: ${cpuUsage}%                          │
│                                                    │
│  🌊 *ESTADO DEL BOT*                                │
│  ├─ 🟢 Estado: Online                               │
│  ├─ 🔋 Performance: ${memPercent < 80 ? 'Óptimo' : 'Alto uso'}             │
│  ├─ 📡 Conexión: Estable                           │
│  └─ 🦈 Versión: Gawr Gura Bot v2.0                 │
│                                                    │
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

꒰ 💙 *Información actualizada en tiempo real buba~* 💙 ꒱
`

    await conn.sendMessage(m.chat, { text: infoMsg }, { quoted: m })
    await m.react('📊')

  } catch (error) {
    console.error(error)
    await m.reply('❌ *¡Hyaaa~! Error al obtener información del bot buba~*')
  }
}

handler.help = ['infobot', 'stats']
handler.tags = ['info']
handler.command = ['infobot', 'stats', 'status', 'estadisticas']

export default handler