import fetch from 'node-fetch';

// 2,000 decoraciones únicas para Gawr Gura: olas, tiburones, kawaii, mar
const DECORACIONES = Array.from({ length: 2000 }, (_, i) => {
    const shark = "🦈";
    const wave = "🌊";
    const heart = "💙";
    const star = "⭐";
    const fish = "🐟";
    const bubble = "🫧";
    const kawaii = ["(｡•̀ᴗ-)✧", "（＾・ω・＾❁）", "(｡♥‿♥｡)", "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧", "(っ˘ω˘ς )", "≧◡≦", "(。U⁄ ⁄ω⁄ ⁄ U。)", "(*≧ω≦)", "( ˘▽˘)っ♨", "( ˘▽˘)っ♨"];
    // patrones alternos
    const patterns = [
        `${wave}${shark}${bubble}${shark}${wave}${i}`,
        `${star}${bubble}${heart}${shark}${wave}${fish}${star}`,
        `╭━━━${shark.repeat((i % 3) + 1)}━━━╮`,
        `⋆｡˚☽˚｡⋆${wave.repeat((i % 4) + 1)}⋆｡˚☽˚｡⋆`,
        `✦━─┉┈${shark}${bubble}┈┉─━✦`,
        `𓆟𓆝𓆟𓆝𓆟${bubble.repeat((i % 2) + 1)}`,
        `🩵${wave}${shark}${wave}${shark}${wave}🩵`,
        `🦈⋆｡ﾟ☁︎｡⋆｡ ﾟ☾ ﾟ｡⋆🦈`,
        `⋆⭒˚｡⋆｡˚☽˚｡⋆${kawaii[i % kawaii.length]}`,
        `${heart}${star}${bubble}${shark}${fish}${heart}${star}${bubble}`,
        `【${wave.repeat((i % 6) + 1)}${shark.repeat((i % 2) + 1)}】`,
        `🦈${star}${bubble}${wave}${star}${shark}${bubble}${wave}`,
        `✧*｡٩(ˊᗜˋ*)و✧*｡${bubble}${wave}${shark}${heart}`,
        `┏━━━━━━🦈━━━━━━┓`,
        `⋆｡˚ ☁️🩵˚｡⋆`,
        `╭╼❀𓆝❀╾╮`,
        `︵‿︵‿୨${shark}୧‿︵‿︵`,
        `✧*。🦈。*✧`,
        `𓆟𓆝𓆟𓆝𓆟`,
        `🦈𓆟🌊𓆝🦈`
    ];
    const deco = patterns[i % patterns.length];
    return {
        arriba: deco,
        centro: deco,
        abajo: deco
    };
});

// Imágenes temáticas para Gawr Gura
const IMAGENES = [
    "https://i.imgur.com/oH6EJ6F.jpg",
    "https://i.imgur.com/4FZlF6M.jpg",
    "https://i.imgur.com/2zIFrXy.jpg",
    "https://i.imgur.com/nk3NWRP.jpg",
    "https://i.imgur.com/d2k0bDl.jpg",
    "https://i.imgur.com/EqH8hsh.jpg",
    "https://i.imgur.com/3zLq9a1.jpg",
    "https://i.imgur.com/9hyF8hO.jpg",
    "https://i.imgur.com/6zT1eB0.jpg",
    "https://i.imgur.com/7b9wEJ1.jpg",
    "https://i.imgur.com/x4o4u7l.jpg",
    "https://i.imgur.com/CV8eew2.jpg",
    "https://i.imgur.com/0M8fE9H.jpg",
    "https://i.imgur.com/H7w7D1L.jpg",
    "https://i.imgur.com/E5kFhJg.jpg",
    "https://i.imgur.com/oevD5wO.jpg",
    "https://i.imgur.com/z1p6zDd.jpg",
    "https://i.imgur.com/UgY6FhN.jpg",
    "https://i.imgur.com/jEhgwB9.jpg",
    "https://i.imgur.com/6g4w7Xy.jpg"
];

// Genera una decoración y su imagen asociada
function randomGuraDeco(i) {
    const idx = Math.floor(Math.random() * DECORACIONES.length);
    return { ...DECORACIONES[idx], img: IMAGENES[idx % IMAGENES.length], idx };
}

let handler = async (m, { conn, usedPrefix, text, args, command }) => {
    await m.react('🦈');

    if (!['owner', 'creator', 'creador', 'dueño'].includes(command.toLowerCase())) {
        return conn.sendMessage(m.chat, { text: `El comando ${command} no existe.` });
    }

    let list = [{
        displayName: "💖💝 Y⃟o⃟ S⃟o⃟y⃟ Y⃟o⃟ 💝 💖 - Creador de Gawr Gura",
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN: 💖💝 Y⃟o⃟ S⃟o⃟y⃟ Y⃟o⃟ 💝 💖  - Bot Developer\nitem1.TEL;waid=573133374132:573133374132\nitem1.X-ABLabel:Número\nitem2.ADR:;;Colombia;;;;\nitem2.X-ABLabel:País\nEND:VCARD`,
    }];

    // Textos mejorados
    function textoCreador(deco) {
        return `${deco.arriba}
${deco.centro} *👑 Contacto Oficial del Creador 👑*
${deco.abajo}

${deco.centro} *Nombre:* 💖💝 Y⃟o⃟ S⃟o⃟y⃟ Y⃟o⃟ 💝 💖
${deco.centro} *País:* 🇨🇴 Colombia
${deco.centro} *Rol:* Desarrollador de Gawr Gura Bot

${deco.centro} “¡Hola! Soy el creador de *Gawr Gura Bot*, un proyecto lleno de azul y tiburones.
${deco.centro} Si tienes ideas, encontraste un bug o quieres apoyar este mar de alegría, mándame un mensaje.
${deco.centro} ¡Gracias por surfear estas aguas sharky conmigo! 🌊🦈

${deco.centro} _¡Aru~! Shark power~_`;
    }

    // Primer envío
    let deco = randomGuraDeco(0);
    let texto = textoCreador(deco);

    await conn.sendMessage(m.chat, {
        contacts: {
            displayName: `${list.length} Contacto`,
            contacts: list
        },
        contextInfo: {
            externalAdReply: {
                showAdAttribution: true,
                title: 'Gawr Gura - Bot ',
                body: 'Creador: 💖💝 Y⃟o⃟ S⃟o⃟y⃟ Y⃟o⃟ 💝 💖 ',
                thumbnailUrl: deco.img,
                sourceUrl: 'https://github.com',
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });

    // Mensaje decorado editable
    let sent = await conn.sendMessage(m.chat, { text: texto }, { quoted: m });

    // Animación: cambia decoración e imagen cada 5 segundos por 15 minutos
    const TIEMPO_LIMITE = 15 * 60 * 1000; // 15 minutos en milisegundos
    const INTERVALO = 5000; // 5 segundos
    let activo = true;
    let cambios = Math.floor(TIEMPO_LIMITE / INTERVALO); // Número de iteraciones permitidas
    let i = 1;

    setTimeout(() => { activo = false; }, TIEMPO_LIMITE); // Desactiva tras 15 minutos

    const editar = async () => {
        if (!activo || i > cambios) return;
        let decoNuevo = randomGuraDeco(i);
        let textoNuevo = textoCreador(decoNuevo);
        try {
            await conn.sendMessage(m.chat, {
                edit: sent.key,
                text: textoNuevo,
                contextInfo: {
                    externalAdReply: {
                        showAdAttribution: true,
                        title: 'Gawr Gura - Bot ',
                        body: 'Creador: 💖💝 Y⃟o⃟ S⃟o⃟y⃟ Y⃟o⃟ 💝 💖 ',
                        thumbnailUrl: decoNuevo.img,
                        sourceUrl: 'https://github.com',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });
        } catch (e) { /* Si no se puede editar, ignora el error */ }
        i++;
        if (i <= cambios) setTimeout(editar, INTERVALO);
    };

    setTimeout(editar, INTERVALO);
};

handler.help = ['owner', 'creator'];
handler.tags = ['main'];
handler.command = ['owner', 'creator', 'creador', 'dueño'];

export default handler;
