import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return m.reply(`🦈 *¡Eh buba~! Ingresa algo para buscar en YouTube desu~*\n🌊 *Ejemplo:* ${usedPrefix + command} Gawr Gura`)

  try {
    // 🔍 Buscar video con Delirius API
    let searchRes = await fetch(`https://delirius-apiofc.vercel.app/search/ytsearch?q=${encodeURIComponent(text)}`)
    let search = await searchRes.json()

    if (!search.data || !search.data.length) return m.reply('❌ *Awww~ No encontré nada buba~.*')

    let result = search.data[0]

    // 🧾 Mostrar info del video con decoración aleatoria
    const decorations = [
      `✨ *「𝘼𝙦𝙪𝙞́ 𝙩𝙚𝙣𝙚𝙢𝙤𝙨 𝙗𝙪𝙗𝙖!」*\n\n`,
      `🌊 *「¡Hiii~ Esto es lo que encontré desu~!」*\n\n`,
      `🌟 *「Mira buba~ ¡Aquí está!」*\n\n`,
      `🦈 *「¡Tiburón trabajando, aquí está tu resultado!」*\n\n`,
      `💙 *「¡Esto es para ti, buba~!」*\n\n`
    ]
    const randomDecoration = decorations[Math.floor(Math.random() * decorations.length)]
    let info = `${randomDecoration}` +
               `🦈 *Título:* ${result.title}\n` +
               `🌊 *Canal:* ${result.author?.name || 'Desconocido'}\n` +
               `⏳ *Duración:* ${result.duration || 'Desconocida'}\n` +
               `👁️ *Vistas:* ${result.views || 'Desconocidas'}\n` +
               `📅 *Publicado:* ${result.publishedAt || 'Desconocida'}\n` +
               `🔗 *Link:* ${result.url}`

    if (result.image) {
      await conn.sendMessage(m.chat, { image: { url: result.image }, caption: info }, { quoted: m })
    } else {
      await m.reply(info)
    }

    // 🎧 Descargar audio desde múltiples APIs
    const apis = [
      `https://theadonix-api.vercel.app/api/ytmp3?url=${encodeURIComponent(result.url)}`, // API 1
      `https://yt1s.com/api/ajaxSearch/index?vid=${encodeURIComponent(result.url)}`, // API 2
      `https://api.vevioz.com/api/button/mp3/${encodeURIComponent(result.url)}`, // API 3
      `https://api.ytjar.download/audio?url=${encodeURIComponent(result.url)}` // API 4
    ]

    let audioUrl = null
    for (const api of apis) {
      try {
        const res = await fetch(api)
        const json = await res.json()

        // Verificar si la API devuelve un enlace de audio
        if (json?.result?.audio) {
          audioUrl = json.result.audio
          break
        } else if (json?.links?.mp3) {
          audioUrl = json.links.mp3
          break
        } else if (json?.url) {
          audioUrl = json.url
          break
        }
      } catch (e) {
        console.error(`Error con la API: ${api}`, e)
      }
    }

    if (!audioUrl) {
      return m.reply('❌ *Hyaaa~ No pude conseguir el audio buba~.*')
    }

    // 🗣️ Descargar el buffer
    let audioRes = await fetch(audioUrl)
    if (!audioRes.ok) throw new Error('No se pudo descargar el archivo de audio.')

    let audioBuffer = await audioRes.buffer()

    // 🎤 Enviar como nota de voz
    await conn.sendMessage(m.chat, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      fileName: 'audio.mp3',
      ptt: true
    }, { quoted: m })

  } catch (e) {
    m.reply(`❌ *Gyaa~ Algo salió mal desu~: ${e.message}*`)
    await m.react('✖️')
  }
}

handler.command = ['ytbuscar', 'ytsearch'] // Puedes personalizar el comando
export default handler
