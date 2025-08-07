import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'


global.owner = [
  ['573133374132', '💖💝 Y⃟o⃟ S⃟o⃟y⃟ Y⃟o⃟ 💝 💖 ', true],
  ['50493732693', 'Ado', true],
]


global.mods = []
global.prems = []

global.libreria = 'Baileys'
global.baileys = 'V 6.7.16' 
global.vs = '2.2.0'
global.nameqr = 'YuriBotMD'
global.namebot ='Gawr Gura'
global.sessions = 'Sessions'
global.jadi = 'JadiBots' 
global.yukiJadibts = true

// Sistema Premium para Sub-Bots
global.premiumSubBots = []
global.vipTimes = {} // { number: expirationTimestamp }
global.freeSubBotsLimits = {
  maxCommands: 50, // comandos por día
  canSetName: false,
  canSetBanner: false,
  maxGroups: 3
}

// Configuración de alertas VIP
global.vipAlerts = {
  warningTimes: [24, 12, 6, 1], // horas antes de expirar
  checkInterval: 30 * 60 * 1000 // revisar cada 30 minutos
}

global.packname = 'Gawr Gura'
global.namebot = 'Gawr Gura'
global.author = '💖💝 Y⃟o⃟ S⃟o⃟y⃟ Y⃟o⃟ 💝 💖 '


global.namecanal = 'Gawr Gura'
global.canal = 'https://whatsapp.com/channel/0029VbAmMiM96H4KgBHZUn1z'
global.idcanal = '120363399729727124@newsletter'

global.ch = {
ch1: '120363399729727124@newsletter',
}

global.multiplier = 69 
global.maxwarn = '2'


let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
