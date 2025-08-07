
import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const text = args.join(' ');

  if (!text) {
    return m.reply(`✧･ﾟ: *✧･ﾟ:* 🦈 *¡Hyaaa~! Dime algo para que pueda ser una brat contigo~!*\n\n*Ejemplo:* ${usedPrefix}${command} Explícame algo difícil`);
  }

  try {
    await m.react('😤');
    
    const bratPrompt = `Responde como una "brat" anime kawaii, usando un tono presumido pero tierno. Usa expresiones como "hmph!", "baka", "no es que me importe o algo así...", y emojis kawaii. Tu personalidad es orgullosa pero adorable.`;
    
    const response = await fetch('https://api.ryzendesu.vip/api/ai/gpt4', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: `${bratPrompt}\n\nUsuario: ${text}`,
        system: "Eres una IA con personalidad brat kawaii"
      })
    });

    if (!response.ok) {
      // API de respaldo
      const backupResponse = await fetch(`https://api.openai-sb.com/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'system',
            content: bratPrompt
          }, {
            role: 'user',
            content: text
          }]
        })
      });
      
      if (!backupResponse.ok) throw new Error('Brat API failed');
      
      const backupData = await backupResponse.json();
      var result = backupData.choices[0].message.content;
    } else {
      const data = await response.json();
      var result = data.response || data.choices?.[0]?.message?.content;
    }

    if (!result) throw new Error('No response from Brat AI');

    const responseMsg = `
✧･ﾟ: *✧･ﾟ:* 😤 *ʙʀᴀᴛ ᴀɪ* 😤 :･ﾟ✧*:･ﾟ✧

${result}

꒰ 💅 *Pregunta de:* @${m.sender.split('@')[0]} ꒱
`;

    await conn.sendMessage(m.chat, {
      text: responseMsg,
      mentions: [m.sender]
    }, { quoted: m });

    await m.react('💅');

  } catch (error) {
    console.error(error);
    await m.reply(`❌ *¡Hmph! No es que quisiera responder de todas formas, baka~!*\n\n*Error:* ${error.message}`);
    await m.react('❌');
  }
};

handler.help = ['brat'];
handler.tags = ['ai'];
handler.command = ['brat', 'bratai'];
handler.register = false;

export default handler;
