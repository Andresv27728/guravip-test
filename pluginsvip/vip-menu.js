
import fs from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'

// Decoraciones VIP exclusivas
const vipDecorations = [
  '♦️･ﾟ: *♦️･ﾟ: 💎* :･ﾟ♦️ :･ﾟ♦️',
  '👑･ﾟ: *👑･ﾟ: 🌟* :･ﾟ👑 :･ﾟ👑',
  '💎･ﾟ: *💎･ﾟ: ⭐* :･ﾟ💎 :･ﾟ💎',
  '🔥･ﾟ: *🔥･ﾟ: 💫* :･ﾟ🔥 :･ﾟ🔥',
  '⚡･ﾟ: *⚡･ﾟ: 🎯* :･ﾟ⚡ :･ﾟ⚡',
]

const vipTextStyles = [
  { greeting: 'ᴠɪᴘ ᴜsᴇʀ~ 💎', activity: '👑 Poder Premium', dateText: '🌟 Elite Mode' },
  { greeting: 'ᴘʀᴇᴍɪᴜᴍ~ 🔥', activity: '💎 Status VIP', dateText: '⚡ Premium Day' },
  { greeting: 'ᴇʟɪᴛᴇ~ ⭐', activity: '🎯 Max Power', dateText: '💫 VIP Time' },
  { greeting: 'ʀᴏʏᴀʟ~ 👑', activity: '🌟 Premium Energy', dateText: '🔥 Elite Date' },
  { greeting: 'ᴍᴀsᴛᴇʀ~ 💫', activity: '⚡ Supreme Mode', dateText: '💎 Royal Time' },
]

const vipTags = {
  'vip': '💎 VIP Premium',
  'vip-downloader': '⬇️ Descargas VIP',
  'vip-sticker': '🎭 Stickers Premium',
  'vip-video': '🎬 Videos VIP',
  'vip-tools': '🛠️ Herramientas VIP',
  'vip-ai': '🤖 IA Premium',
  'vip-games': '🎮 Juegos VIP',
  'vip-group': '👥 Grupos VIP'
}

const defaultVipMenu = {
  before: `
💎 %greeting
( *%tipo VIP* )

> ⤿ ¡Bienvenido %name! ˎˊ˗ 
%activity: %uptime ⌇
%dateText: %date

🌟 *ACCESO PREMIUM ACTIVADO*
➤ ✐ Comandos ilimitados disponibles
➤ ✐ Plugins exclusivos cargados
➤ ✐ Personalización completa activa

%readmore`.trimStart(),

  header: '\n💎 *%decoration*\n👑 *❝ %category ❞*',
  body: '\n🔹 %cmd %islimit %isPremium',
  footer: '',
  after: '\n> ⋆ *VIP Bot by Yo Soy Yo* ⋆',
}

const handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    const currentBotNumber = conn.user?.jid?.split('@')[0]?.replace(/\D/g, '')
    
    // Verificar que sea un sub-bot premium
    if (!global.premiumSubBots?.includes(currentBotNumber)) {
      return conn.reply(m.chat, '❌ Este comando es solo para sub-bots VIP Premium.', m)
    }

    const { exp, limit, level } = global.db.data.users[m.sender]
    const { min, xp, max } = xpRange(level, global.multiplier)
    const name = await conn.getName(m.sender)

    const d = new Date(Date.now() + 3600000)
    const locale = 'es'
    const date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })

    // Detectar automáticamente todos los plugins VIP
    const vipPluginsPath = './pluginsvip'
    let vipPlugins = []
    
    if (fs.existsSync(vipPluginsPath)) {
      const files = fs.readdirSync(vipPluginsPath).filter(file => file.endsWith('.js'))
      
      for (const file of files) {
        try {
          const pluginPath = join(vipPluginsPath, file)
          if (global.plugins[file]) {
            const plugin = global.plugins[file]
            if (!plugin.disabled) {
              vipPlugins.push({
                help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
                tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
                prefix: 'customPrefix' in plugin,
                limit: plugin.limit,
                premium: plugin.premium,
              })
            }
          }
        } catch (e) {
          console.log(`Error loading VIP plugin ${file}:`, e)
        }
      }
    }

    let nombreBot = global.namebot || 'VIP Bot'
    let bannerFinal = './storage/img/Menu3.jpg'

    const configPath = join('./JadiBots', currentBotNumber, 'config.json')
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath))
        if (config.name) nombreBot = config.name + ' 💎 VIP'
        if (config.banner) bannerFinal = config.banner
      } catch (err) {
        console.log('⚠️ No se pudo leer config del subbot:', err)
      }
    }

    const tipo = 'Premium VIP 💎'
    const menuConfig = conn.vipMenu || defaultVipMenu

    // Animación VIP
    let sentMessageID = null
    let animationCount = 0
    const maxAnimations = 30 // Limitar animaciones

    while (animationCount < maxAnimations) {
      const randomDecoration = vipDecorations[Math.floor(Math.random() * vipDecorations.length)]
      const randomTextStyle = vipTextStyles[Math.floor(Math.random() * vipTextStyles.length)]

      const _text = [
        menuConfig.before,
        ...Object.keys(vipTags).map(tag => {
          const pluginsForTag = vipPlugins.filter(plugin => plugin.tags?.includes(tag))
          if (pluginsForTag.length === 0) return ''
          
          return [
            menuConfig.header
              .replace(/%category/g, vipTags[tag])
              .replace(/%decoration/g, randomDecoration),
            pluginsForTag.map(plugin =>
              plugin.help.map(helpText =>
                menuConfig.body
                  .replace(/%cmd/g, plugin.prefix ? helpText : `${_p}${helpText}`)
                  .replace(/%islimit/g, plugin.limit ? '◜⭐◞' : '')
                  .replace(/%isPremium/g, '◜💎 VIP◞')
                  .trim()
              ).join('\n')
            ).join('\n'),
            menuConfig.footer,
          ].join('\n')
        }).filter(section => section !== ''),
        menuConfig.after,
      ].join('\n')

      const replace = {
        '%': '%',
        p: _p,
        botname: nombreBot,
        taguser: '@' + m.sender.split('@')[0],
        exp: exp - min,
        maxexp: xp,
        totalexp: exp,
        xp4levelup: max - exp,
        level,
        limit,
        name,
        date,
        uptime: clockString(process.uptime() * 1000),
        tipo,
        readmore: readMore,
        greeting: randomTextStyle.greeting,
        activity: randomTextStyle.activity,
        dateText: randomTextStyle.dateText,
      }

      const text = _text.replace(
        new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'),
        (_, name) => String(replace[name])
      )

      const isURL = typeof bannerFinal === 'string' && /^https?:\/\//i.test(bannerFinal)
      const imageContent = isURL
        ? { image: { url: bannerFinal } }
        : { image: fs.readFileSync(bannerFinal) }

      if (!sentMessageID) {
        const response = await conn.sendMessage(m.chat, {
          ...imageContent,
          caption: text.trim(),
          mentionedJid: conn.parseMention(text),
        }, { quoted: m })
        sentMessageID = response.key.id
      } else {
        try {
          await conn.modifyMessage(m.chat, sentMessageID, {
            ...imageContent,
            caption: text.trim(),
          })
        } catch (e) {
          console.warn('No se pudo editar el mensaje VIP:', e)
          break
        }
      }

      animationCount++
      await new Promise(resolve => setTimeout(resolve, 1500)) // Animación más lenta para VIP
    }
  } catch (e) {
    console.error('❌ Error en el menú VIP:', e)
    conn.reply(m.chat, '❎ Lo sentimos, ocurrió un error en el menú VIP.', m)
  }
}

handler.help = ['vipmenu', 'menuvip']
handler.tags = ['vip']
handler.command = ['vipmenu', 'menuvip', 'menupremium']

export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}
