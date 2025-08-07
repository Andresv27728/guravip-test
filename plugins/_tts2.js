import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`📢 Usa el comando así:\n\n${usedPrefix + command} Hola.`)

  // Reacción de espera 🎙️
  await conn.sendMessage(m.chat, {
    react: {
      text: '🎙️',
      key: m.key
    }
  })

  // APIs disponibles (principal y respaldos)
  const apis = [
    `https://apis-starlights-team.koyeb.app/starlight/loquendo?text=${encodeURIComponent(text)}&voice=Jorge`, // API principal
    `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(text)}`, // Respaldo 1
    `https://freetts.com/Home/PlayAudio?Language=en-US&Voice=Brian&Text=${encodeURIComponent(text)}`, // Respaldo 2
    `https://voicemaker.in/api/tts?content=${encodeURIComponent(text)}&languageCode=en-US&voice=Matthew`, // Respaldo 3
    `https://soundoftext.nyc3.digitaloceanspaces.com/sounds/${encodeURIComponent(text)}.mp3` // Respaldo 4 (directo)
  ]

  let audioBuffer = null

  for (const api of apis) {
    try {
      const res = await fetch(api)

      // Procesar respuesta dependiendo del formato de la API
      if (api.includes('starlight')) {
        const json = await res.json()
        if (json.audio) {
          audioBuffer = Buffer.from(json.audio, 'base64')
          break
        }
      } else if (api.includes('streamelements') || api.includes('freetts')) {
        const json = await res.json()
        if (json.sound || json.audio) {
          const audioRes = await fetch(json.sound || json.audio)
          audioBuffer = await audioRes.buffer()
          break
        }
      } else if (api.includes('voicemaker')) {
        const json = await res.json()
        if (json.audioUrl) {
          const audioRes = await fetch(json.audioUrl)
          audioBuffer = await audioRes.buffer()
          break
        }
      } else if (api.includes('soundoftext')) {
        const audioRes = await fetch(api)
        if (audioRes.ok) {
          audioBuffer = await audioRes.buffer()
          break
        }
      }
    } catch (e) {
      console.error(`Error con la API: ${api}`, e)
    }
  }

  if (!audioBuffer) {
    return m.reply('❌ Todas las APIs fallaron. Inténtalo más tarde.')
  }

  try {
    await conn.sendMessage(m.chat, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      ptt: true
    }, { quoted: m })
  } catch (e) {
    console.error(e)
    m.reply('⚠️ Error enviando el audio.')
  }
}

handler.command = ['tts']
handler.help = ['tts <texto>']
handler.tags = ['tools']
export default handler
