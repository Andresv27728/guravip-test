
// Sistema de monitoreo de errores para el bot principal y sub-bots
import fs from 'fs'
import path from 'path'

export function initializeErrorSystem() {
    console.log('🚨 Inicializando sistema de monitoreo de errores...')
    
    // Inicializar variables globales
    if (!global.errorLog) global.errorLog = []
    if (!global.subBotErrors) global.subBotErrors = {}
    if (!global.errorMonitor) {
        global.errorMonitor = {
            active: false,
            autoNotify: false,
            logToFile: true,
            startTime: Date.now(),
            notificationsSent: 0
        }
    }

    // Crear directorio de logs si no existe
    const logDir = './tmp'
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
    }

    // Interceptar errores no capturados del proceso principal
    process.on('uncaughtException', (error) => {
        logError('UNCAUGHT_EXCEPTION', error.message, error.stack)
        console.error('❌ Uncaught Exception:', error)
    })

    process.on('unhandledRejection', (reason, promise) => {
        logError('UNHANDLED_REJECTION', `${reason}`, `Promise: ${promise}`)
        console.error('❌ Unhandled Rejection:', reason)
    })

    // Interceptar warnings
    process.on('warning', (warning) => {
        logError('WARNING', warning.message, warning.stack)
    })

    // Función global para log de errores
    global.logError = logError
    global.logSubBotError = logSubBotError
    
    console.log('✅ Sistema de monitoreo de errores inicializado')
}

function logError(type, message, stack = null) {
    if (!global.errorLog) global.errorLog = []

    const errorEntry = {
        timestamp: new Date().toISOString(),
        type: type,
        message: message,
        stack: stack,
        isMainBot: true
    }

    global.errorLog.push(errorEntry)

    // Mantener solo los últimos 100 errores
    if (global.errorLog.length > 100) {
        global.errorLog = global.errorLog.slice(-100)
    }

    // Log a archivo
    if (global.errorMonitor?.logToFile) {
        try {
            const logLine = `[${errorEntry.timestamp}] MAIN_BOT ${type}: ${message}\n`
            fs.appendFileSync('./tmp/bot-errors.log', logLine)
        } catch (e) {
            // Silently fail
        }
    }
}

function logSubBotError(botNumber, message, type = 'ERROR') {
    if (!global.subBotErrors) global.subBotErrors = {}
    if (!global.subBotErrors[botNumber]) global.subBotErrors[botNumber] = []

    const errorEntry = {
        timestamp: new Date().toISOString(),
        type: type,
        message: message,
        botNumber: botNumber,
        isVip: global.premiumSubBots?.includes(botNumber) || false
    }

    global.subBotErrors[botNumber].push(errorEntry)

    // Mantener solo los últimos 50 errores por sub-bot
    if (global.subBotErrors[botNumber].length > 50) {
        global.subBotErrors[botNumber] = global.subBotErrors[botNumber].slice(-50)
    }

    // Log a archivo
    if (global.errorMonitor?.logToFile) {
        try {
            const logLine = `[${errorEntry.timestamp}] SUBBOT_${botNumber} ${type}: ${message}\n`
            fs.appendFileSync('./tmp/subbot-errors.log', logLine)
        } catch (e) {
            // Silently fail
        }
    }
}

// Función para limpiar logs antiguos
export function cleanOldLogs() {
    try {
        const logFiles = ['./tmp/bot-errors.log', './tmp/subbot-errors.log']
        
        logFiles.forEach(file => {
            if (fs.existsSync(file)) {
                const stats = fs.statSync(file)
                const fileAge = Date.now() - stats.mtime.getTime()
                const sevenDays = 7 * 24 * 60 * 60 * 1000
                
                if (fileAge > sevenDays) {
                    fs.unlinkSync(file)
                    console.log(`🧹 Eliminado log antiguo: ${file}`)
                }
            }
        })
    } catch (e) {
        console.error('Error limpiando logs:', e)
    }
}

// Función para obtener estadísticas de errores
export function getErrorStats() {
    const mainBotErrors = global.errorLog?.length || 0
    const subBotErrors = global.subBotErrors ? 
        Object.values(global.subBotErrors).reduce((sum, errors) => sum + errors.length, 0) : 0
    
    const totalSubBots = global.subBotErrors ? Object.keys(global.subBotErrors).length : 0
    
    const recentErrors = global.errorLog?.filter(error => {
        const errorTime = new Date(error.timestamp).getTime()
        const oneHourAgo = Date.now() - (60 * 60 * 1000)
        return errorTime > oneHourAgo
    }).length || 0

    return {
        mainBotErrors,
        subBotErrors,
        totalErrors: mainBotErrors + subBotErrors,
        totalSubBots,
        recentErrors,
        isHealthy: recentErrors < 5
    }
}

export default {
    initializeErrorSystem,
    cleanOldLogs,
    getErrorStats
}
