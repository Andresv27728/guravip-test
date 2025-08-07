const delay = ms => new Promise(res => setTimeout(res, ms));

const handler = async (m, { conn }) => {
  if (!m.isGroup) throw '❌ Este comando solo funciona en grupos';

  const groupMetadata = await conn.groupMetadata(m.chat);
  const participants = groupMetadata.participants;

  const botNumber = conn.decodeJid(conn.user.id);
  const ownerGroup = groupMetadata.owner || participants.find(p => p.admin === 'superadmin')?.id;

  const toKick = participants
    .filter(p => p.id !== botNumber && p.id !== ownerGroup)
    .map(p => p.id);

  if (!toKick.length) {
    await conn.reply(m.chat, '✅ No hay nadie que se pueda eliminar.', m);
    return;
  }

  await conn.sendMessage(m.chat, { text: `🚨 Ejecutando PURGA de ${toKick.length} miembros...` });

  for (const user of toKick) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
      await delay(1000); // espera entre expulsiones para no saturar
    } catch (err) {
      console.log(`❌ No se pudo eliminar a ${user}:`, err);
    }
  }

  await conn.sendMessage(m.chat, { text: '✅ Purga completada.' });
};

handler.command = ['purgamegasupremaultra'];
handler.group = true;

export default handler;
