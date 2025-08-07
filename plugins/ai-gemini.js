
import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const text = args.join(' ');

  if (!text) {
    return m.reply(`✧･ﾟ: *✧･ﾟ:* 🦈 *¡Hyaaa~! Escribe algo para que Gemini pueda ayudarte buba~!*\n\n*Ejemplo:* ${usedPrefix}${command} ¿Cómo hacer takoyaki?`);
  }

  try {
    await m.react('🤖');
    
    const name = m.pushName || 'Usuario';
    
    const response = await fetch('https://api.ryzendesu.vip/api/ai/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        user: name
      })
    });

    if (!response.ok) throw new Error('Gemini API failed');
    
    const data = await response.json();
    
    if (!data.response) throw new Error('No response from Gemini');

    const responseMsg = `
✧･ﾟ: *✧･ﾟ:* 💎 *ɢᴇᴍɪɴɪ ᴀɪ* 💎 :･ﾟ✧*:･ﾟ✧

${data.response}

꒰ 🌟 *Pregunta de:* @${m.sender.split('@')[0]} ꒱
`;

    await conn.sendMessage(m.chat, {
      text: responseMsg,
      mentions: [m.sender]
    }, { quoted: m });

    await m.react('💎');

  } catch (error) {
    console.error(error);
    await m.reply(`❌ *¡Hyaaa~! Gemini no pudo responder buba~*\n\n*Error:* ${error.message}`);
    await m.react('❌');
  }
};

handler.help = ['gemini'];
handler.tags = ['ai'];
handler.command = ['gemini', 'bard'];
handler.register = false;

export default handler;
