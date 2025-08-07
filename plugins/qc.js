import WSF from 'wa-sticker-formatter';
import axios from 'axios';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    let who = m.quoted ? m.quoted.sender : m.mentionedJid?.[0] || (m.fromMe ? conn.user.jid : m.sender);
    let text = m.quoted?.text || args.slice(1).join(' ');
    let pp = await conn.profilePictureUrl(who, 'image').catch(() => 'https://telegra.ph/file/320b066dc81928b782c7b.png');
    const mentionRegex = new RegExp(`@${who.split('@')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'g');
    const cleanText = text.replace(mentionRegex, '');
    let name = global.db.data.users[who]?.name || 'Usuario';

    const validColors = {
        azure: '#007FFF', beige: '#F5F5DC', black: '#000000', blue: '#0000FF', brown: '#A52A2A',
        chartreuse: '#7FFF00', coral: '#FF7F50', cyan: '#00FFFF', fuchsia: '#FF00FF', gold: '#FFD700',
        green: '#008000', indigo: '#4B0082', khaki: '#F0E68C', lavender: '#E6E6FA', lavenderblush: '#FFF0F5',
        lime: '#00FF00', magenta: '#FF00FF', maroon: '#800000', mint: '#98FF98', navy: '#000080',
        olive: '#808000', orange: '#FFA500', orchid: '#DA70D6', peach: '#FFDAB9', pink: '#FFC0CB',
        plum: '#DDA0DD', purple: '#800080', red: '#FF0000', royalblue: '#4169E1', salmon: '#FA8072',
        sienna: '#A0522D', silver: '#C0C0C0', slategray: '#708090', snow: '#FFFAFA', tan: '#D2B48C',
        teal: '#008080', tomato: '#FF6347', turquoise: '#40E0D0', violet: '#8A2BE2', white: '#FFFFFF',
        yellow: '#FFFF00'
    };

    let color = 'black';
    if (validColors[args[0]?.toLowerCase()]) {
        color = args[0].toLowerCase();
    }

    if (!cleanText) {
        const sortedColors = Object.keys(validColors).sort();
        const columns = 4;
        const colorRows = [];

        for (let i = 0; i < sortedColors.length; i += columns) {
            const row = sortedColors.slice(i, i + columns).map((c, j) => {
                const index = i + j + 1;
                const emoji = ['🌸', '🫧', '🦈', '💙', '⭐', '🎨', '🐬', '✨'][Math.floor(Math.random() * 8)];
                return `💠 *${String(index).padStart(2, '0')}*. ${emoji} \`${c.padEnd(14)}\``;
            });
            colorRows.push(row.join("   "));
        }

        return m.reply(
`*𓆩💙𓆪 Hii~ soy Gura y haré tu sticker brillante 💬✨*

🌊 ᯽ Usa el comando así:
*${usedPrefix}${command} <color> <texto>*

🐬 Ejemplo:
*${usedPrefix}${command} pink Konpeko~! 🦈*

🎨 𓂃 𖥻 Colores disponibles:
${colorRows.join("\n")}

꒰ 🫧 ¡Puedes mencionar a alguien y quitaré el @ para que se vea más bonito! ꒱

⟣ ¡Disfruta creando stickers con Gura, desu~! 🐟💬`
        );
    }

    const obj = {
        type: "quote",
        format: "png",
        backgroundColor: validColors[color],
        width: 512,
        height: 768,
        scale: 2,
        messages: [{
            entities: [],
            avatar: true,
            from: {
                id: 1,
                name: name,
                photo: { url: pp }
            },
            text: cleanText,
            replyMessage: {}
        }]
    };

    try {
        const json = await axios.post('https://qc.botcahx.eu.org/generate', obj, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (!json.data.result?.image) {
            throw new Error("API no devolvió imagen.");
        }

        const buffer = Buffer.from(json.data.result.image, 'base64');
        let stiker = await sticker5(buffer, false, global.packname, global.author);
        if (stiker) {
            return conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m });
        } else {
            return m.reply("❌ Gura no pudo hacer el sticker... inténtalo de nuevo.");
        }
    } catch (error) {
        console.error(error);
        return m.reply("⚠️ Gura-chan encontró un error al generar el sticker...");
    }
};

handler.help = ['qc'];
handler.tags = ['sticker'];
handler.command = /^(qc)$/i;

export default handler;

async function sticker5(img, url, packname, author, categories = ['']) {
    try {
        const metadata = { type: 'full', pack: packname, author, categories };
        return await new WSF.Sticker(img || url, metadata).build();
    } catch (error) {
        console.error("Error al crear sticker:", error);
        return null;
    }
}
