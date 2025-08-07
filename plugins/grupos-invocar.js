const handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!m.isGroup) return m.reply('🔒 *¡Gawr Gura dice nya~!* Este comando solo se puede usar en *grupos marinos*, no aquí, bub~ 🐬');

  const groupMetadata = await conn.groupMetadata(m.chat);

  console.log('🦈📡 Escaneando las profundidades... Participantes:');
  groupMetadata.participants.forEach(p => {
    console.log(`- ${p.id} | Rol: ${p.admin || 'babyshark 🐟'}`);
  });

  const userParticipant = groupMetadata.participants.find(p => p.id === m.sender);
  const isUserAdmin = userParticipant?.admin === 'admin' || userParticipant?.admin === 'superadmin' || m.sender === groupMetadata.owner;

  if (!isUserAdmin) return m.reply('❌ *¡Alerta, alerta!* Solo los *capitanes marinos* (admins) pueden usar esta habilidad secreta 🧜‍♀️✨');

  const mainEmoji = global.db.data.chats[m.chat]?.customEmoji || '🦈';
  const decoEmoji1 = '🌊';
  const decoEmoji2 = '🪼';
  const decoEmoji3 = '🐚';
  const decoEmoji4 = '🫧';

  m.react(mainEmoji);

  const mensaje = args.join(' ') || '💌 *Mensaje vacío... ¡envíame uno con amor bajo el mar~!* 🐠';

  const total = groupMetadata.participants.length;

  const header = `
╭───────𓆩🌟𓆪───────╮
┃    🐬 *Llamado Marino Global* 🐬
┃       𝒃𝒚 Gawr Gura 🌊💙
╰───────𓆩🦈𓆪───────╯
${decoEmoji4.repeat(12)}
${decoEmoji3} ¡Sumérgete en la mención más kawaii del océano! ${decoEmoji3}
`;

  const info = `
${decoEmoji1} *✉️ Mensaje lanzado desde el submarino:*  
➥ ${mensaje}

${decoEmoji2} *👥 Número de pececitos en el cardumen:*  
➥ ${total} integrantes nadando conmigo 🧜‍♀️

${decoEmoji1.repeat(12)}
`;

  let cuerpo = '';
  for (const mem of groupMetadata.participants) {
    cuerpo += `➳ ${mainEmoji} @${mem.id.split('@')[0]}\n`;
  }

  const footer = `
${decoEmoji2.repeat(12)}
╭──────────✦──────────╮
┃ 🔱 Comando: ${usedPrefix + command}
┃ 🧜 Enviado desde Atlantis por Gura
╰──────────✦──────────╯
${decoEmoji4.repeat(12)}
`;

  const texto = header + info + cuerpo + footer;

  await conn.sendMessage(m.chat, {
    text: texto.trim(),
    mentions: groupMetadata.participants.map(p => p.id)
  });
};

handler.help = ['invocar *<mensaje opcional>*'];
handler.tags = ['group'];
handler.command = ['todos', 'invocar', 'tagall'];
handler.group = true;

export default handler;
