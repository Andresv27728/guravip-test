import yts from 'yt-search'
import fs from 'fs'
import axios from 'axios'
import fetch from "node-fetch"

const handler = async (m, { conn, command, text, usedPrefix }) => {
  if (!text) throw `Ejemplo: ${usedPrefix}${command} <su consulta>`

  const search = await yts(text)
  const vid = search.videos[0]
  if (!vid) throw 'Vídeo no encontrado, por favor prueba con otro título~'

  const { title, thumbnail, timestamp, views, ago, url } = vid

  await conn.sendMessage(m.chat, {
    image: { url: thumbnail },
    caption: `🔍 Encontré la canción: *${title}*\nSe está descargando actualmente...`,
  }, { quoted: m })

  try {
let ouh = await fetch(`https://fastrestapis.fasturl.cloud/downup/ytdown-v1?name=${title}&format=mp3&quality=128&server=auto`)
  let gyh = await ouh.json()
//    const data = fetch(`https://fastrestapis.fasturl.cloud/downup/ytdown-v1?name=${title}&format=mp3&quality=128&server=auto`)
//    const result = await data.json();

    await conn.sendMessage(m.chat, {
      audio: { url: gyh.result.media },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      caption: `*${gyh.result.title}*\n*Duración*: ${gyh.result.duration}`,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          mediaType: 2,
          mediaUrl: url,
          title: gyh.result.title,
          body: 'Audio Download',
          sourceUrl: url,
          thumbnail: await (await conn.getFile(thumbnail)).data,
        },
      },
    }, { quoted: m })


  } catch (error) {
    console.error('Error:', error.message)
    throw `Error al descargar el audio 😢: ${error.message}`
  }
}

handler.help = ['play3'].map(v => v + ' <consulta>')
handler.tags = ['Downloaders']
handler.command = /^(play3)$/i

handler.register = false
handler.disable = true

export default handler
