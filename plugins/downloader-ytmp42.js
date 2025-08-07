import fetch from 'node-fetch';
import ytdl from 'ytdl-core';
import yts from 'yt-search';

// 🔹 Lista de 10 API keys gratuitas (puedes agregar más)
const API_KEYS = [
  'https://delirius-apiofc.vercel.app/download/ytmp3?url=https://youtu.be/TdrL3QxjyVw',
  'https://delirius-apiofc.vercel.app/download/ytmp3?url=https://youtu.be/TdrL3QxjyVw',
  'AIzaSyA3-PRUEBA3',
  'AIzaSyA4-PRUEBA4',
  'AIzaSyA5-PRUEBA5',
  'AIzaSyA6-PRUEBA6',
  'AIzaSyA7-PRUEBA7',
  'AIzaSyA8-PRUEBA8',
  'AIzaSyA9-PRUEBA9',
  'AIzaSyA10-PRUEBA10'
];

// Función para obtener una API key aleatoria
function getRandomApiKey() {
  return API_KEYS[Math.floor(Math.random() * API_KEYS.length)];
}

const handler = async (m, { conn, args, usedPrefix }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `✏️ Ingresa un título para buscar en YouTube.

Ejemplo:
> ${usedPrefix}play Corazón Serrano - Mix Poco Yo`, m);
  }

  await m.react('🔍');
  await conn.sendMessage(m.chat, { 
    text: `⏳ *Buscando...*\n🔎 ${args.join(" ")}\n_Por favor espera un momento..._`, 
  }, { quoted: m });

  try {
    let videoInfo;

    // 1️⃣ Intentar búsqueda con YouTube Data API
    try {
      const API_KEY = getRandomApiKey();
      const searchURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(args.join(" "))}&key=${API_KEY}`;
      const res = await fetch(searchURL);
      const data = await res.json();

      if (data.items && data.items.length) {
        const video = data.items[0];
        videoInfo = {
          title: video.snippet.title,
          url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
          thumbnail: video.snippet.thumbnails.high.url
        };
      } else {
        throw new Error('Sin resultados API oficial');
      }
    } catch (err) {
      console.warn('⚠️ Error en API oficial, usando yt-search:', err.message);
      const results = await yts(args.join(" "));
      if (!results.videos.length) throw new Error('No se encontraron resultados en yt-search');
      const video = results.videos[0];
      videoInfo = {
        title: video.title,
        url: video.url,
        thumbnail: video.thumbnail
      };
    }

    // 2️⃣ Descargar miniatura
    const thumbnail = await (await fetch(videoInfo.thumbnail)).buffer();

    // 3️⃣ Enviar información
    await conn.sendMessage(m.chat, {
      image: thumbnail,
      caption: `🎥 *Video encontrado*\n📌 Título: ${videoInfo.title}\n🔗 Enlace: ${videoInfo.url}`,
    }, { quoted: m });

    // 4️⃣ Descargar y enviar audio MP3
    const audioStream = ytdl(videoInfo.url, { filter: 'audioonly', quality: 'highestaudio' });
    await conn.sendMessage(m.chat, {
      audio: { stream: audioStream },
      mimetype: 'audio/mpeg',
      fileName: `${videoInfo.title}.mp3`
    }, { quoted: m });

    await m.react('✅');

  } catch (e) {
    console.error(e);
    await m.react('❌');
    conn.reply(m.chat, '❗ Ocurrió un error al buscar o enviar el audio.', m);
  }
};

handler.help = ['play'];
handler.tags = ['descargas'];
handler.command = ['play'];

export default handler;
