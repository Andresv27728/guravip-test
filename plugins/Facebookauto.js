import { igdl } from 'ruhend-scraper';

const handler = async (m, { conn }) => {
    const fbRegex = /https?:\/\/(www\.)?(facebook\.com|fb\.watch)\/[^\s]+/i;
    const match = m.text.match(fbRegex);
    if (!match) return;

    const url = match[0];
    const sharkEmoji = '🦈';
    const warningEmoji = '⚠️';
    const waitingEmoji = '🌊';
    const successEmoji = '✨';
    const errorEmoji = '❌';
    const oopsEmoji = '💢';

    let res;
    try {
        await m.react(waitingEmoji); // Gura-style waiting emoji
        res = await igdl(url);
    } catch (e) {
        return conn.reply(m.chat, `${oopsEmoji} *Aww, algo salió mal desu~... ¡Revisa el enlace, buba!*`, m);
    }

    let result = res.data;
    if (!result || result.length === 0) {
        return conn.reply(m.chat, `${warningEmoji} *Nada de nada ~ no encontré nada que descargar... buba! 🦈💦*`, m);
    }

    let data;
    try {
        data = result.find(i => i.resolution === "720p (HD)") || result.find(i => i.resolution === "360p (SD)");
    } catch (e) {
        return conn.reply(m.chat, `${oopsEmoji} *Oopsie doopsie! Tuve problemas procesando los datos desu... 🦈💔*`, m);
    }

    if (!data) {
        return conn.reply(m.chat, `${warningEmoji} *Eh?? No encontré una resolución buena, uwu~ 💦*`, m);
    }

    let video = data.url;
    try {
        await conn.sendMessage(
            m.chat,
            {
                video: { url: video },
                caption: `${sharkEmoji} *¡Aquí tienes, buba! Espero que te guste desu~ 🦈✨*`,
                fileName: 'fb.mp4',
                mimetype: 'video/mp4'
            },
            { quoted: m }
        );
        await m.react(successEmoji); // Gura-style success emoji
    } catch (e) {
        await m.react(errorEmoji);
        return conn.reply(m.chat, `${oopsEmoji} *¡Hyaaa! Algo falló al enviarte el video... ¡No te enojes conmigo desu~! 🦈💦*`, m);
    }
};

handler.customPrefix = /https?:\/\/(www\.)?(facebook\.com|fb\.watch)\//i;
handler.command = new RegExp;
handler.group = true;
handler.register = false;
handler.limit = false;

export default handler;
