
import fs from 'fs'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const action = args[0]?.toLowerCase()
  
  if (!action) {
    return conn.reply(m.chat, `🚨 *MONITOR DE ERRORES* 🚨

📋 **Opciones disponibles:**
• ${usedPrefix + command} status - Estado del monitor
• ${usedPrefix + command} start - Iniciar monitoreo
• ${usedPrefix + command} stop - Detener monitoreo
• ${usedPrefix + command} clear - Limpiar logs
• ${usedPrefix + command} recent - Ver errores recientes
• ${usedPrefix + command} subbots - Errores de sub-bots

*Ejemplo:* ${usedPrefix + command} start`, m)
  }

  await m.react('🔍')

  try {
    switch (action) {
      case 'status':
        await showMonitorStatus(conn, m)
        break
      case 'start':
        await startErrorMonitoring(conn, m)
        break
      case 'stop':
        await stopErrorMonitoring(conn, m)
        break
      case 'clear':
        await clearErrorLogs(conn, m)
        break
      case 'recent':
        await showRecentErrors(conn, m)
        break
      case 'subbots':
        await showSubBotErrors(conn, m)
        break
      default:
        return conn.reply(m.chat, '❌ Acción no válida.', m)
    }

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    conn.reply(m.chat, `❌ Error en monitor: ${e.message}`, m)
  }
}

// Mostrar estado del monitor
async function showMonitorStatus(conn, m) {
  let response = `🚨 *ESTADO DEL MONITOR* 🚨\n\n`
  
  response += `📊 **Monitor Principal:**\n`
  response += `• Estado: ${global.errorMonitor?.active ? '🟢 Activo' : '🔴 Inactivo'}\n`
  response += `• Errores capturados: ${global.errorLog?.length || 0}\n`
  response += `• Último error: ${global.errorLog?.length > 0 ? 
    new Date(global.errorLog[global.errorLog.length - 1].timestamp).toLocaleString('es-ES') : 
    'N/A'}\n\n`

  response += `👥 **Sub-Bots:**\n`
  if (global.subBotErrors) {
    const totalSubBotErrors = Object.values(global.subBotErrors).reduce((sum, errors) => sum + errors.length, 0)
    response += `• Errores totales: ${totalSubBotErrors}\n`
    response += `• Sub-bots con errores: ${Object.keys(global.subBotErrors).length}\n`
  } else {
    response += `• Sin errores registrados\n`
  }

  response += `\n⚙️ **Configuración:**\n`
  response += `• Max errores guardados: 100\n`
  response += `• Auto-notificación: ${global.errorMonitor?.autoNotify ? '✅' : '❌'}\n`
  response += `• Log a archivo: ${global.errorMonitor?.logToFile ? '✅' : '❌'}\n`

  await conn.reply(m.chat, response, m)
}

// Iniciar monitoreo de errores
async function startErrorMonitoring(conn, m) {
  if (global.errorMonitor?.active) {
    return conn.reply(m.chat, '⚠️ El monitor ya está activo.', m)
  }

  // Inicializar sistema de monitoreo
  global.errorMonitor = {
    active: true,
    autoNotify: true,
    logToFile: true,
    startTime: Date.now(),
    notificationsSent: 0
  }

  if (!global.errorLog) global.errorLog = []
  if (!global.subBotErrors) global.subBotErrors = {}

  // Interceptar errores de proceso
  if (!global.errorMonitor.processErrorHandler) {
    global.errorMonitor.processErrorHandler = (error) => {
      logError('PROCESS', error.message, error.stack)
    }
    process.on('uncaughtException', global.errorMonitor.processErrorHandler)
    process.on('unhandledRejection', global.errorMonitor.processErrorHandler)
  }

  // Interceptar errores de consola
  if (!global.originalConsoleError) {
    global.originalConsoleError = console.error
    console.error = (...args) => {
      const message = args.join(' ')
      logError('CONSOLE', message)
      global.originalConsoleError(...args)
    }
  }

  let response = `🚨 *MONITOR INICIADO* 🚨\n\n`
  response += `✅ Monitor de errores activado\n`
  response += `📊 Interceptando errores de:\n`
  response += `• Procesos no capturados\n`
  response += `• Promesas rechazadas\n`
  response += `• Errores de consola\n`
  response += `• Sub-bots conectados\n\n`
  response += `🔔 Se notificarán errores críticos automáticamente`

  await conn.reply(m.chat, response, m)
}

// Detener monitoreo
async function stopErrorMonitoring(conn, m) {
  if (!global.errorMonitor?.active) {
    return conn.reply(m.chat, '⚠️ El monitor no está activo.', m)
  }

  global.errorMonitor.active = false

  // Restaurar console.error original
  if (global.originalConsoleError) {
    console.error = global.originalConsoleError
    delete global.originalConsoleError
  }

  // Remover listeners de proceso
  if (global.errorMonitor.processErrorHandler) {
    process.removeListener('uncaughtException', global.errorMonitor.processErrorHandler)
    process.removeListener('unhandledRejection', global.errorMonitor.processErrorHandler)
    delete global.errorMonitor.processErrorHandler
  }

  const uptime = Math.floor((Date.now() - global.errorMonitor.startTime) / 1000)
  
  let response = `🚨 *MONITOR DETENIDO* 🚨\n\n`
  response += `⏹️ Monitor desactivado\n`
  response += `⏱️ Tiempo activo: ${uptime}s\n`
  response += `📊 Errores capturados: ${global.errorLog?.length || 0}\n`
  response += `🔔 Notificaciones enviadas: ${global.errorMonitor.notificationsSent}\n\n`
  response += `💾 Los logs se mantienen hasta limpiar manualmente`

  await conn.reply(m.chat, response, m)
}

// Limpiar logs de errores
async function clearErrorLogs(conn, m) {
  const totalErrors = (global.errorLog?.length || 0) + 
    Object.values(global.subBotErrors || {}).reduce((sum, errors) => sum + errors.length, 0)

  global.errorLog = []
  global.subBotErrors = {}

  let response = `🧹 *LOGS LIMPIADOS* 🧹\n\n`
  response += `✅ Eliminados ${totalErrors} errores\n`
  response += `📊 Estado: Limpio\n`
  response += `🔄 Monitor: ${global.errorMonitor?.active ? 'Activo' : 'Inactivo'}`

  await conn.reply(m.chat, response, m)
}

// Mostrar errores recientes
async function showRecentErrors(conn, m) {
  if (!global.errorLog || global.errorLog.length === 0) {
    return conn.reply(m.chat, '✅ No hay errores recientes registrados.', m)
  }

  let response = `📋 *ERRORES RECIENTES* 📋\n\n`
  
  const recentErrors = global.errorLog.slice(-10).reverse()
  
  recentErrors.forEach((error, index) => {
    const time = new Date(error.timestamp).toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    
    response += `${index + 1}. [${time}] ${error.type || 'ERROR'}\n`
    response += `   ${error.message.substring(0, 80)}${error.message.length > 80 ? '...' : ''}\n\n`
  })

  response += `📊 Total errores: ${global.errorLog.length}\n`
  response += `⏰ Último: ${new Date(global.errorLog[global.errorLog.length - 1].timestamp).toLocaleString('es-ES')}`

  await conn.reply(m.chat, response, m)
}

// Mostrar errores de sub-bots
async function showSubBotErrors(conn, m) {
  if (!global.subBotErrors || Object.keys(global.subBotErrors).length === 0) {
    return conn.reply(m.chat, '✅ No hay errores de sub-bots registrados.', m)
  }

  let response = `👥 *ERRORES DE SUB-BOTS* 👥\n\n`

  for (const [botNumber, errors] of Object.entries(global.subBotErrors)) {
    if (errors.length === 0) continue

    const isVip = global.premiumSubBots?.includes(botNumber)
    response += `${isVip ? '💎' : '🆓'} **+${botNumber}** (${errors.length} errores)\n`
    
    // Mostrar últimos 3 errores de este sub-bot
    const recentErrors = errors.slice(-3).reverse()
    recentErrors.forEach((error, index) => {
      const time = new Date(error.timestamp).toLocaleString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
      response += `   ${index + 1}. [${time}] ${error.message.substring(0, 50)}...\n`
    })
    response += `\n`
  }

  const totalSubBotErrors = Object.values(global.subBotErrors).reduce((sum, errors) => sum + errors.length, 0)
  response += `📊 **Resumen:**\n`
  response += `• Total errores: ${totalSubBotErrors}\n`
  response += `• Sub-bots afectados: ${Object.keys(global.subBotErrors).length}\n`

  await conn.reply(m.chat, response, m)
}

// Función para registrar errores
function logError(type, message, stack = null) {
  if (!global.errorLog) global.errorLog = []

  const errorEntry = {
    timestamp: new Date().toISOString(),
    type: type,
    message: message,
    stack: stack
  }

  global.errorLog.push(errorEntry)

  // Mantener solo los últimos 100 errores
  if (global.errorLog.length > 100) {
    global.errorLog = global.errorLog.slice(-100)
  }

  // Auto-notificar errores críticos
  if (global.errorMonitor?.autoNotify && shouldNotifyError(message)) {
    notifyCriticalError(errorEntry)
  }

  // Log a archivo si está habilitado
  if (global.errorMonitor?.logToFile) {
    try {
      const logLine = `[${errorEntry.timestamp}] ${type}: ${message}\n`
      fs.appendFileSync('./tmp/error.log', logLine)
    } catch (e) {
      // Silently fail if can't write to file
    }
  }
}

// Verificar si un error debe notificarse
function shouldNotifyError(message) {
  const criticalKeywords = [
    'ENOTFOUND',
    'ECONNRESET',
    'TypeError',
    'ReferenceError',
    'SyntaxError',
    'Maximum call stack',
    'out of memory'
  ]

  return criticalKeywords.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  )
}

// Notificar error crítico al owner
async function notifyCriticalError(error) {
  try {
    if (global.errorMonitor.notificationsSent >= 10) {
      return // Evitar spam de notificaciones
    }

    const message = `🚨 *ERROR CRÍTICO DETECTADO* 🚨\n\n` +
      `⏰ **Tiempo:** ${new Date(error.timestamp).toLocaleString('es-ES')}\n` +
      `🔴 **Tipo:** ${error.type}\n` +
      `💬 **Mensaje:** ${error.message}\n\n` +
      `> Sistema de monitoreo automático`

    for (const [ownerNumber] of global.owner) {
      const ownerJid = ownerNumber + '@s.whatsapp.net'
      await global.conn.sendMessage(ownerJid, { text: message })
    }

    global.errorMonitor.notificationsSent++
  } catch (e) {
    console.log('Error enviando notificación crítica:', e)
  }
}

// Función global para registrar errores de sub-bots
global.logSubBotError = function(botNumber, message) {
  if (!global.subBotErrors) global.subBotErrors = {}
  if (!global.subBotErrors[botNumber]) global.subBotErrors[botNumber] = []

  global.subBotErrors[botNumber].push({
    timestamp: new Date().toISOString(),
    message: message
  })

  // Mantener solo los últimos 20 errores por sub-bot
  if (global.subBotErrors[botNumber].length > 20) {
    global.subBotErrors[botNumber] = global.subBotErrors[botNumber].slice(-20)
  }
}

handler.help = ['errormonitor', 'monitorerrores']
handler.tags = ['owner']
handler.command = /^(errormonitor|monitorerrores|monitor)$/i
handler.owner = true

export default handler
