/** 🦈✨ Comando Kick con estilo de GuraBot **/

var handler = async (m, { conn, args }) => {
    if (!m.isGroup) return m.reply('🔒 *Este comando solo se puede usar en grupos, desu~!*');

    const groupMetadata = await conn.groupMetadata(m.chat);

    // 🐚 Mostrar participantes en consola para debug
    console.log('🔍 Participantes del grupo:');
    groupMetadata.participants.forEach(p => {
        console.log(`- ${p.id} admin: ${p.admin || 'miembro'}`);
    });

    const userParticipant = groupMetadata.participants.find(p => p.id === m.sender);

    // 🦈 Verificar si el que usa el comando es admin
    const isUserAdmin =
        userParticipant?.admin === 'admin' ||
        userParticipant?.admin === 'superadmin' ||
        m.sender === groupMetadata.owner;

    if (!isUserAdmin) {
        return m.reply('❌ *Lo siento senpai, solo los administradores pueden usar este comando~*');
    }

    // 🎯 Determinar a quién sacar
    let user;
    if (m.mentionedJid && m.mentionedJid[0]) {
        user = m.mentionedJid[0];
    } else if (m.quoted) {
        user = m.quoted.sender;
    } else if (args[0]) {
        const number = args[0].replace(/[^0-9]/g, '');
        if (!number) return m.reply('⚠️ *Ese número no es válido, desu~*');
        user = number + '@s.whatsapp.net';
    } else {
        return m.reply('🚫 *Menciona, responde o escribe el número de la persona que quieres echar~*');
    }

    const ownerGroup = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
    const ownerBot = global.owner[0][0] + '@s.whatsapp.net';

    // ❌ Reglas especiales de protección
    if (user === conn.user.jid) return m.reply(`😿 *No puedo echarme a mí misma, soy GuraBot~*`);
    if (user === ownerGroup) return m.reply(`👑 *Ese es el dueño del grupo, imposible desu~*`);
    if (user === ownerBot) return m.reply(`💥 *¡Ese es mi oniichan creador! ¡No lo toques! >w<*`);

    try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
        await m.reply(`✅ *Usuario eliminado con éxito~ Hasta la vista, baby shark 🦈.*`);
    } catch (e) {
        await m.reply(`❌ *No pude expulsar al usuario, nyah~ ¿Soy admin? ¿O ya no tengo permisos?*`);
    }
};

handler.help = ['kick'];
handler.tags = ['group'];
handler.command = ['kick', 'echar', 'hechar', 'sacar', 'ban'];

export default handler;
