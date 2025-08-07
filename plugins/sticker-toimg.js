import { webp2png } from '../lib/webp2mp4.js';

const handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.quoted || m.quoted.mtype !== 'stickerMessage')
    throw `✳️ Responde a un sticker con *${usedPrefix + command}* para convertirlo a imagen PNG.`;

  const isAnimated = m.quoted.msg?.isAnimated;

  if (isAnimated) throw '⚠️ Este sticker es animado. Usa *tovideo* para convertirlo a video.';

  try {
    const sticker = await m.quoted.download();
    const imgUrl = await webp2png(sticker);
    await conn.sendFile(m.chat, imgUrl, 'sticker.png', '🖼️ Aquí tienes tu sticker convertido a imagen.', m);
  } catch (e) {
    console.error(e);
    throw '❌ Error al convertir el sticker a imagen.';
  }
};

handler.help = ['toimg'];
handler.tags = ['herramientas', 'convertidor'];
handler.command = /^toimg$/i;

export default handler;
