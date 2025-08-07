
const handler = async (m, { conn, args, usedPrefix, command }) => {
  // Solo para sub-bots premium
  const currentBotNumber = conn.user?.jid?.split('@')[0]?.replace(/\D/g, '')
  if (!global.premiumSubBots?.includes(currentBotNumber)) {
    return conn.reply(m.chat, '❌ Esta función es exclusiva para sub-bots VIP Premium.', m)
  }

  const action = args[0]?.toLowerCase()

  if (!action || !['status', 'info'].includes(action)) {
    return conn.reply(m.chat, `💎 *Auto-Reconexión VIP*

🔄 *Estado:* Activado automáticamente
💎 *Beneficio VIP:* Tu sub-bot se reconecta solo al reiniciar el servidor
⚡ *Velocidad:* Reconexión en 5-10 segundos
🛡️ *Estabilidad:* Sistema de reintentos automáticos

*Comandos disponibles:*
• ${usedPrefix + command} status - Ver estado detallado
• ${usedPrefix + command} info - Información del sistema

> *Esta función es exclusiva para usuarios VIP Premium*`, m)
  }

  if (action === 'status') {
    const connectionStatus = conn.ws?.readyState === 1 ? '🟢 Conectado' : '🔴 Desconectado'
    const uptime = process.uptime()
    const hours = Math.floor(uptime / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    
    return conn.reply(m.chat, `💎 *Estado de Auto-Reconexión VIP*

🔄 *Auto-reconexión:* ✅ Activada
📡 *Estado actual:* ${connectionStatus}
⏱️ *Tiempo activo:* ${hours}h ${minutes}m
💎 *Número VIP:* ${currentBotNumber}
🛡️ *Protección:* Activa
🚀 *Prioridad:* Alta

*Características VIP:*
• ✅ Reconexión automática
• ✅ Reintentos ilimitados  
• ✅ Prioridad en conexión
• ✅ Estabilidad mejorada

> *Tu sub-bot se mantendrá siempre conectado*`, m)
  }

  if (action === 'info') {
    return conn.reply(m.chat, `💎 *Sistema de Auto-Reconexión VIP*

*¿Qué es?*
Sistema automático que mantiene tu sub-bot conectado 24/7

*Beneficios VIP:*
🔄 Reconexión automática al reiniciar servidor
⚡ Tiempo de reconexión: 5-10 segundos
🛡️ Sistema de reintentos automáticos
💎 Prioridad alta en las conexiones
🚀 Mayor estabilidad y velocidad

*Diferencias con usuarios gratuitos:*
• Gratuitos: Reconexión manual requerida
• VIP: Reconexión 100% automática

*¿Cuándo se activa?*
• Al reiniciar el servidor principal
• En caso de desconexión inesperada
• Durante mantenimientos del sistema

> *Mantén tu sub-bot siempre activo con VIP Premium*`, m)
  }
}

handler.help = ['vipreconnect', 'autoreconnect']
handler.tags = ['vip']
handler.command = /^(vipreconnect|autoreconnect|reconexionvip)$/i

export default handler
