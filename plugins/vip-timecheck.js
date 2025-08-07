
// Sistema automático de verificación de tiempo VIP
import { setTimeout } from 'timers'

// Función para verificar expiraciones VIP
async function checkVipExpirations() {
  const now = Date.now()
  const expiredUsers = []
  const warningUsers = []

  // Verificar cada usuario VIP
  for (const [number, expirationTime] of Object.entries(global.vipTimes || {})) {
    const timeLeft = expirationTime - now
    const hoursLeft = timeLeft / (60 * 60 * 1000)

    // Si ya expiró
    if (timeLeft <= 0) {
      expiredUsers.push(number)
      continue
    }

    // Verificar si necesita advertencia
    for (const warningHours of global.vipAlerts.warningTimes) {
      if (hoursLeft <= warningHours && hoursLeft > (warningHours - 1)) {
        if (!global.db.data.settings.vipWarningsSent) {
          global.db.data.settings.vipWarningsSent = {}
        }
        
        const warningKey = `${number}_${warningHours}`
        if (!global.db.data.settings.vipWarningsSent[warningKey]) {
          warningUsers.push({ number, hours: warningHours })
          global.db.data.settings.vipWarningsSent[warningKey] = true
        }
      }
    }
  }

  // Procesar usuarios expirados
  for (const number of expiredUsers) {
    // Remover de premium
    const index = global.premiumSubBots.indexOf(number)
    if (index > -1) {
      global.premiumSubBots.splice(index, 1)
      global.db.data.settings.premiumSubBots = global.premiumSubBots
    }
    
    // Limpiar tiempo VIP
    delete global.vipTimes[number]
    global.db.data.settings.vipTimes = global.vipTimes

    console.log(`🔴 VIP expirado para: ${number}`)
    
    // Notificar al owner sobre la expiración
    try {
      for (const [ownerNumber] of global.owner) {
        const ownerJid = ownerNumber + '@s.whatsapp.net'
        await global.conn?.sendMessage(ownerJid, {
          text: `⚠️ *VIP EXPIRADO*

👤 Usuario: wa.me/${number}
📅 Expiró: ${new Date().toLocaleDateString('es-ES')}
🔄 Estado: Removido del sistema VIP

> *Notificación automática del sistema*`
        })
      }
    } catch (e) {
      console.log('No se pudo notificar al owner:', e)
    }
    
    // Intentar enviar notificación de expiración al usuario
    try {
      const jid = number + '@s.whatsapp.net'
      await global.conn?.sendMessage(jid, {
        text: `💎 *TU VIP HA EXPIRADO* 💎

❌ Tu acceso premium ha terminado
📅 Fecha de expiración: ${new Date().toLocaleDateString('es-ES')}

🔄 Para renovar tu VIP:
• Contacta al owner: wa.me/${global.owner[0][0]}
• Características perdidas:
  - Comandos ilimitados
  - Personalización
  - Plugins VIP
  - Auto-reconexión

💝 ¡Gracias por usar nuestro servicio premium!`
      })
    } catch (e) {
      console.log('No se pudo enviar notificación de expiración:', e)
    }
  }

  // Procesar advertencias
  for (const { number, hours } of warningUsers) {
    console.log(`⚠️ Advertencia VIP enviada a ${number}: ${hours}h restantes`)
    
    try {
      const jid = number + '@s.whatsapp.net'
      const emoji = hours <= 1 ? '🚨' : hours <= 6 ? '⚠️' : '💎'
      
      await global.conn?.sendMessage(jid, {
        text: `${emoji} *ADVERTENCIA VIP* ${emoji}

⏰ Tu acceso premium expira en: *${hours} horas*
📅 Fecha de expiración: ${new Date(global.vipTimes[number]).toLocaleDateString('es-ES')}

🔄 Para renovar tu VIP:
• Contacta al owner: wa.me/${global.owner[0][0]}
• Renueva antes de que expire para mantener:
  - Comandos ilimitados ✅
  - Personalización completa ✅
  - Plugins VIP exclusivos ✅
  - Auto-reconexión prioritaria ✅

💎 ¡No pierdas tus beneficios premium!`
      })
    } catch (e) {
      console.log('No se pudo enviar advertencia VIP:', e)
    }
  }
}

// Inicializar verificación automática
function startVipTimeChecker() {
  console.log('🕐 Sistema de verificación VIP iniciado')
  
  // Verificar inmediatamente
  setTimeout(checkVipExpirations, 5000)
  
  // Configurar verificación periódica
  setInterval(checkVipExpirations, global.vipAlerts.checkInterval)
}

// Handler para comando manual de verificación
const handler = async (m, { conn }) => {
  if (!global.owner.map(([number]) => number).includes(m.sender.replace(/[^0-9]/g, ''))) {
    return m.reply('❌ Solo el owner puede usar este comando.')
  }

  await m.react('⏳')
  
  try {
    await checkVipExpirations()
    await m.react('✅')
    conn.reply(m.chat, '✅ Verificación de tiempos VIP completada.', m)
  } catch (e) {
    console.error(e)
    await m.react('❌')
    conn.reply(m.chat, '❌ Error en la verificación: ' + e.message, m)
  }
}

handler.help = ['checkvip']
handler.tags = ['owner']
handler.command = /^(checkvip|verificarvip)$/i
handler.owner = true

export default handler
export { startVipTimeChecker, checkVipExpirations }
