const handler = async (m, { conn, text }) => {
  const nuevoTexto = text || (m.quoted && m.quoted.text)

  if (!nuevoTexto) throw '*⚠️ Escribe o responde a un mensaje con el texto que deseas establecer como descripción o nombre del bot.*'

  try {
    // Intentar cambiar la descripción (estado)
    await conn.updateProfileStatus(nuevoTexto)
    return m.reply(`✅ Se actualizó correctamente la *descripción del perfil*:\n\n"${nuevoTexto}"`)
  } catch (e) {
    console.warn('❌ No se pudo cambiar la descripción, intentando cambiar el nombre...')
    try {
      // Si falla, intenta cambiar el nombre del perfil
      await conn.updateProfileName(nuevoTexto)
      return m.reply(`⚠️ No se pudo cambiar la descripción, pero se actualizó el *nombre del perfil*:\n\n"${nuevoTexto}"`)
    } catch (err) {
      console.error('❌ Error al cambiar el nombre también:', err)
      throw '❌ No se pudo cambiar ni la descripción ni el nombre del perfil.'
    }
  }
}

handler.help = ['descripcion <texto>']
handler.tags = ['herramientas']
handler.command = /^descripcion$/i
handler.owner = true // Solo el owner puede usar este comando

export default handler
