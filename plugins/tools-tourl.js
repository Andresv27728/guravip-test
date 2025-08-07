import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';
  if (!mime) return conn.reply(m.chat, `🌊✨ *Aww~* Porfis responde a una *imagen o video*, ¡así puedo subirlo al cielo de Catbox! 🐾`, m, rcanal);

  await m.react("🫧");

  try {
    let media = await q.download();
    let isTele = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime);
    let link = await catbox(media);

    let txt = `
╭─── 𓆩💙𓆪 ───╮
   🦈 *C A T B O X  -  U P L O A D* 🦈
╰─── 𓆩🌊𓆪 ───╯

${"🫧".repeat(15)}

📤 *¡Tu archivo fue lanzado al océano digital!*
${"🐚".repeat(6)}

📎 *Enlace mágico:*  
${link}

📦 *Tamaño del archivo:*  
${formatBytes(media.length)}

⏳ *Expira:*  
${isTele ? 'Nunca jamás~ 💫' : 'No estoy segura nya~ 🐠'}

${"🫧".repeat(15)}
> *Subido por ${namebot} - powered by Gura~* 💙
`;

    await conn.sendFile(m.chat, media, 'thumbnail.jpg', txt.trim(), m, rcanal);
    await m.react("✅");
  } catch {
    await m.react("💔");
    await conn.reply(m.chat, '😿 Aghhh... algo salió mal al nadar con el archivo...', m);
  }
};

handler.help = ['tourl'];
handler.tags = ['tools'];
handler.command = ['catbox', 'tourl'];
export default handler;

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

async function catbox(content) {
  const { ext, mime } = (await fileTypeFromBuffer(content)) || {};
  const blob = new Blob([content.toArrayBuffer()], { type: mime });
  const formData = new FormData();
  const randomBytes = crypto.randomBytes(5).toString("hex");
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, `${randomBytes}.${ext}`);

  const response = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Atlantis; Submarine v2.0) Gura/1.0 BlueSharkBot Safari/7.1",
    },
  });

  return await response.text();
}
