
let handler = async (m, { conn, text}) => {
  const groupId = text? text: m.chat;

  try {
    const mensaje = `
 *𝙎𝙃𝙊𝙔𝙊 𝙃𝙄𝙉𝘼𝙏𝘼 ოძ  𝘽 ꂦ Ꮏ se despide del grupo* 

👋 Ha sido un gusto estar con ustedes.
`;

    await conn.sendMessage(groupId, { text: mensaje});
    await conn.groupLeave(groupId);
} catch (e) {
    console.error('🚫 Error al intentar abandonar el grupo:', e);
    await m.reply('⚠️ Algo salió mal... No pude salir del grupo.');
}
};

handler.command = /^(salir|leave|salirdelgrupo|leavegc)$/i;
handler.group = true;
export default handler;
