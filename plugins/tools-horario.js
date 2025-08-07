import moment from 'moment-timezone';

const handler = async (m, { conn }) => {
  const zonas = [
    { nombre: 'Perú 🇵🇪', zona: 'America/Lima' },
    { nombre: 'México 🇲🇽', zona: 'America/Mexico_City' },
    { nombre: 'Bolivia 🇧🇴', zona: 'America/La_Paz' },
    { nombre: 'Chile 🇨🇱', zona: 'America/Santiago' },
    { nombre: 'Argentina 🇦🇷', zona: 'America/Argentina/Buenos_Aires' },
    { nombre: 'Colombia 🇨🇴', zona: 'America/Bogota' },
    { nombre: 'Ecuador 🇪🇨', zona: 'America/Guayaquil' },
    { nombre: 'Costa Rica 🇨🇷', zona: 'America/Costa_Rica' },
    { nombre: 'Cuba 🇨🇺', zona: 'America/Havana' },
    { nombre: 'Guatemala 🇬🇹', zona: 'America/Guatemala' },
    { nombre: 'Honduras 🇭🇳', zona: 'America/Tegucigalpa' },
    { nombre: 'Nicaragua 🇳🇮', zona: 'America/Managua' },
    { nombre: 'Panamá 🇵🇦', zona: 'America/Panama' },
    { nombre: 'Uruguay 🇺🇾', zona: 'America/Montevideo' },
    { nombre: 'Venezuela 🇻🇪', zona: 'America/Caracas' },
    { nombre: 'Paraguay 🇵🇾', zona: 'America/Asuncion' },
    { nombre: 'New York 🇺🇸', zona: 'America/New_York' },
    { nombre: 'Asia (Jakarta) 🌏', zona: 'Asia/Jakarta' },
    { nombre: 'Brasil 🇧🇷', zona: 'America/Sao_Paulo' },
    { nombre: 'Guinea Ecuatorial 🌍', zona: 'Africa/Malabo' },
  ];

  const zonaActual = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const fechaActual = moment().tz(zonaActual).format('DD/MM/YY HH:mm:ss');

  let mensaje = `╭━━━ ⏰ *ZONAS HORARIAS* ⏰ ━━━╮\n`;
  mensaje += `┃ *By GuraBot* 🦈\n┃\n`;

  for (const zona of zonas) {
    const hora = moment().tz(zona.zona).format('DD/MM HH:mm');
    mensaje += `┃ 🕒 ${zona.nombre.padEnd(16)}: ${hora}\n`;
  }

  mensaje += `┃\n┣ 🎌 *Zona horaria del servidor actual:*\n┃ 📍 ${zonaActual}\n┃ 📅 ${fechaActual}\n`;
  mensaje += `╰━━━━━━━━━━━━━━━━━━━━━━━╯`;

  await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m });
};

handler.help = ['horario'];
handler.tags = ['info'];
handler.command = ['horario'];

export default handler;
