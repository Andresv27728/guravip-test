import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `🌸 Ingresa el enlace de un video de TikTok.

📌 *Ejemplo:*
${usedPrefix + command} https://vm.tiktok.com/xxxxxx`, 
      global.rcanal
    );
  }

  try {
    await m.react('🎴');

    const api = `https://theadonix-api.vercel.app/api/tiktok?url=${encodeURIComponent(text)}`;
    const res = await fetch(api);
    const json = await res.json();

    const result = json?.result;
    if (!result?.video) {
      await m.react('❌');
      return m.reply('❌ No se pudo obtener el video.', global.rcanal);
    }

    const {
      title,
      author,
      thumbnail,
      duration,
      video,
      audio,
      likes,
      comments,
      shares,
      views,
    } = result;

    const caption = `
✿ *${title}*
*✐ Autor:* ${author.name} (@${author.username})
*✎ Duración:* ${duration}s

*✰ Likes:* ${likes}   *ᥫ᭡ ${comments}*   *➩ ${shares}*   *☄︎ ${views}*

> ☁︎ Adonix API`.trim()

    
    await conn.sendMessage(
      m.chat,
      {
        image: { url: thumbnail },
        caption,
        contextInfo: global.rcanal
      },
      { quoted: m }
    );

    
    await conn.sendMessage(
      m.chat,
      {
        video: { url: video },
        mimetype: 'video/mp4',
        fileName: `${author.username}.mp4`,
        contextInfo: global.rcanal
      },
      { quoted: m }
    );

    await m.react('✅');

  } catch (e) {
    console.error(e);
    await m.react('⚠️');
    return m.reply('❌ Error al procesar el enlace.', global.rcanal);
  }
};

handler.help = ['tiktok <enlace>'];
handler.tags = ['downloader'];
handler.command = ['ttdl', 'tt', 'tiktok'];

export default handler;
