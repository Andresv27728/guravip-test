const handler = async (m, { conn }) => {
  if (!m.quoted) throw '🔁 *Responde a un mensaje de imagen o video de "ver una vez".*';

  let q = m.quoted;
  let msg = q.msg || q;
  let viewOnce = msg?.viewOnceMessage || msg?.viewOnceMessageV2;

  if (!viewOnce) throw '⚠️ *Ese mensaje no es de tipo "ver una vez".*';

  let mediaMsg = viewOnce.message?.imageMessage || viewOnce.message?.videoMessage;
  if (!mediaMsg) throw '❌ *El mensaje no contiene imagen ni video.*';

  try {
    let type = mediaMsg.mimetype.includes('image') ? 'image' : 'video';
    let buffer = await conn.downloadMediaMessage({
      key: q.key,
      message: {
        [`${type}Message`]: {
          ...mediaMsg,
          viewOnce: false, // Forzar que se descargue como normal
        },
      },
    });

    if (!buffer) throw '⛔ *No se pudo descargar el archivo.*';

    let ext = type === 'image' ? '.jpg' : '.mp4';
    await conn.sendFile(m.chat, buffer, `veruna${ext}`, `📤 *Aquí tienes tu archivo como normal!*`, m);
  } catch (err) {
    console.error(err);
    throw '😿 *Error al intentar procesar el mensaje.*';
  }
};

handler.command = ['ver'];
handler.help = ['ver'];
handler.tags = ['tools'];
export default handler;
