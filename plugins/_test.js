import axios from 'axios'
import crypto from 'crypto'
import fetch from 'node-fetch'

const handler = async (m, { conn, args, command, usedPrefix }) => {
  const url = args[0]
  if (!url) return m.reply(`*[❗] Faltó el link de YouTube we*\n\n📌Ejemplo:\n${usedPrefix + command} https://youtu.be/dQw4w9WgXcQ`)

  m.react('🎞️')

  const download = async (link, format = '360') => {
    const isUrl = (str) => {
      try { new URL(str); return true } catch { return false }
    }

    const youtube = (url) => {
      const a = [
        /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
        /youtu\.be\/([a-zA-Z0-9_-]{11})/
      ]
      for (let b of a) if (b.test(url)) return url.match(b)[1]
      return null
    }

    const hexToBuffer = (hexString) => {
      const matches = hexString.match(/.{1,2}/g)
      return Buffer.from(matches.join(''), 'hex')
    }

    const decrypt = async (enc) => {
      const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12'
      const data = Buffer.from(enc, 'base64')
      const iv = data.slice(0, 16)
      const content = data.slice(16)
      const key = hexToBuffer(secretKey)
      const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
      let decrypted = decipher.update(content)
      decrypted = Buffer.concat([decrypted, decipher.final()])
      return JSON.parse(decrypted.toString())
    }

    const request = async (endpoint, data = {}, method = 'post') => {
      const base = "https://media.savetube.me/api"
      const headers = {
        'accept': '*/*',
        'content-type': 'application/json',
        'origin': 'https://yt.savetube.me',
        'referer': 'https://yt.savetube.me/',
        'user-agent': 'Postify/1.0.0'
      }
      try {
        const res = await axios({
          method,
          url: endpoint.startsWith('http') ? endpoint : base + endpoint,
          data: method === 'post' ? data : undefined,
          params: method === 'get' ? data : undefined,
          headers
        })
        return { status: true, data: res.data }
      } catch (e) {
        return { status: false, error: e.message }
      }
    }

    if (!link) return { status: false, error: "No pusiste ningún link 🧠" }
    if (!isUrl(link)) return { status: false, error: "Ese link no es válido 🗿" }

    const id = youtube(link)
    if (!id) return { status: false, error: "No se pudo sacar el ID del video 😵" }

    const cdnRes = await request("/random-cdn", {}, "get")
    if (!cdnRes.status) return cdnRes
    const cdn = cdnRes.data.cdn

    const infoRes = await request(`https://${cdn}/v2/info`, {
      url: `https://www.youtube.com/watch?v=${id}`
    })
    if (!infoRes.status) return infoRes

    const decrypted = await decrypt(infoRes.data.data)

    const dlRes = await request(`https://${cdn}/download`, {
      id,
      downloadType: 'video',
      quality: format,
      key: decrypted.key
    })

    if (!dlRes.status) return dlRes

    return {
      status: true,
      result: {
        title: decrypted.title || 'Sin título',
        thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
        url: dlRes.data.data.downloadUrl
      }
    }
  }

  try {
    const result = await download(url)
    if (!result.status) throw new Error(result.error || "Error desconocido")

    await conn.sendMessage(m.chat, {
      video: { url: result.result.url },
      caption: `🎞️ *${result.result.title}*`,
      mimetype: 'video/mp4'
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply(`❌ *Ocurrió un error:*\n${e.message}`)
  }
}

handler.command = ['videotest']

export default handler