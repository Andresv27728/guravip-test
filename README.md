
<div align="center">

# 🦈 Gawr Gura WhatsApp Bot 🌊

<img src="https://i.imgur.com/VYBYeUJ.gif" alt="Gawr Gura" width="300"/>

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Bot-green.svg?style=for-the-badge&logo=whatsapp)](https://whatsapp.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg?style=for-the-badge&logo=javascript)](https://javascript.info/)
[![Replit](https://img.shields.io/badge/Replit-Ready-orange.svg?style=for-the-badge&logo=replit)](https://replit.com/)
[![Baileys](https://img.shields.io/badge/Baileys-6.7.16-blue.svg?style=for-the-badge)](https://github.com/WhiskeySockets/Baileys)

*Un bot de WhatsApp kawaii inspirado en Gawr Gura de Hololive con sistema premium y sub-bots* 🦈

**Versión:** 2.2.0 | **Librería:** Baileys V6.7.16

---

## ✨ Características Principales

</div>

### 🎮 **Juegos y Entretenimiento**
- 🎲 **Dados virtuales** - Lanza dados con stickers kawaii
- 🎰 **Ruleta diaria** - Gana premios únicos (2% de probabilidad)
- 🏆 **Rankings dinámicos** - TOP 10 de cualquier tema
- 🌸 **Waifus aleatorias** - Imágenes anime de alta calidad
- 🎯 **Juegos VIP** - Casino premium, arcade y más

### 👥 **Gestión de Grupos**
- 🔒 **Control de grupo** - Abrir/cerrar grupos con temporizador
- 👋 **Bienvenidas temporales** - Mensajes personalizables por 1 minuto
- 📋 **Sistema de fichas** - Presentaciones personalizadas
- 🏷️ **Menciones masivas** - Invocar a todos los miembros
- ⚡ **Administración avanzada** - Kick, promote, demote y más
- 🎭 **Personalidades de grupo** - Comportamiento adaptable

### 🛠️ **Herramientas Útiles**
- 📱 **Descargas multimedia** - YouTube, TikTok, Instagram, Pinterest
- 🖼️ **Procesamiento de imágenes** - HD, stickers, conversiones
- 🔍 **Búsquedas inteligentes** - Pinterest, imágenes, música
- 🌐 **Traductor automático** - Múltiples idiomas
- 📊 **Información de grupos** - Inspección detallada
- 📸 **Screenshots web** - Capturas de pantalla de sitios web

### 🤖 **Inteligencia Artificial**
- 🎨 **DALL-E Integration** - Generación de imágenes IA
- 🧠 **Claude AI** - Conversaciones inteligentes
- ✨ **Gemini AI** - Análisis avanzado de texto
- 💬 **Chat inteligente** - Respuestas contextuales
- 🔊 **Text-to-Speech** - Convierte texto a audio

### 🔥 **Sistema Premium Sub-Bots**
- 🌟 **Sub-bots VIP** - Funcionalidades exclusivas
- ⚡ **Auto-reconexión** - Conexión estable 24/7
- 📊 **Reportes diarios** - Estadísticas detalladas
- 🎮 **Comandos ilimitados** - Sin restricciones para VIP
- 🛡️ **Soporte prioritario** - Asistencia exclusiva

### 🔧 **Sistema de Monitoreo**
- 🚨 **Monitor de errores** - Detección automática de fallos
- 📊 **Diagnósticos** - Información del sistema en tiempo real
- 🔄 **Auto-restart** - Reinicio automático en caso de errores
- 📝 **Logs detallados** - Registro completo de actividades

---

<div align="center">

## 🚀 Instalación

</div>

### 📋 **Prerrequisitos**
- Node.js 18+ 
- Git
- Número de WhatsApp para el bot
- Conexión a internet estable

---

## 📱 **Instalación en Termux (Android)**

### 🔧 **Pasos para Termux**

1. **Actualizar Termux**
   ```bash
   pkg update && pkg upgrade -y
   ```

2. **Instalar dependencias**
   ```bash
   pkg install git nodejs yarn python make g++ libwebp imagemagick -y
   ```

3. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Im-Ado/Yuru-Yuri.git
   cd Yuru-Yuri
   ```

4. **Instalar paquetes Node.js**
   ```bash
   npm install
   # O con yarn
   yarn install
   ```

5. **Configurar el bot**
   ```bash
   # Editar config.js con tus datos
   nano config.js
   ```

6. **Ejecutar el bot**
   ```bash
   npm start
   ```

7. **Mantener activo (opcional)**
   ```bash
   # Para mantener el bot corriendo en background
   nohup npm start &
   ```

---

## 💻 **Instalación en Windows**

### 🔧 **Pasos para Windows**

1. **Instalar Node.js**
   - Descarga desde [nodejs.org](https://nodejs.org/)
   - Instala la versión LTS recomendada

2. **Instalar Git**
   - Descarga desde [git-scm.com](https://git-scm.com/)

3. **Clonar el repositorio**
   ```cmd
   git clone https://github.com/Im-Ado/Yuru-Yuri.git
   cd Yuru-Yuri
   ```

4. **Instalar dependencias**
   ```cmd
   npm install
   ```

5. **Configurar variables de entorno (opcional)**
   ```cmd
   # Crear archivo .env
   echo PREFIX=. > .env
   echo OWNER_NUMBER=573133374132 >> .env
   ```

6. **Ejecutar el bot**
   ```cmd
   npm start
   ```

---

## 🐧 **Instalación en Linux (Ubuntu/Debian)**

### 🔧 **Pasos para Linux**

1. **Actualizar sistema**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Instalar Node.js y dependencias**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt install nodejs git python3 python3-pip build-essential libwebp-dev imagemagick -y
   ```

3. **Clonar repositorio**
   ```bash
   git clone https://github.com/Im-Ado/Yuru-Yuri.git
   cd Yuru-Yuri
   ```

4. **Instalar dependencias**
   ```bash
   npm install
   ```

5. **Configurar permisos para ImageMagick**
   ```bash
   sudo nano /etc/ImageMagick-6/policy.xml
   # Comentar la línea: <!-- <policy domain="path" rights="none" pattern="@*" /> -->
   ```

6. **Ejecutar el bot**
   ```bash
   npm start
   ```

7. **Crear servicio systemd (opcional)**
   ```bash
   sudo nano /etc/systemd/system/gura-bot.service
   ```
   
   Contenido del archivo:
   ```ini
   [Unit]
   Description=Gawr Gura WhatsApp Bot
   After=network.target
   
   [Service]
   Type=simple
   User=tu_usuario
   WorkingDirectory=/ruta/a/Yuru-Yuri
   ExecStart=/usr/bin/node index.js
   Restart=always
   RestartSec=10
   
   [Install]
   WantedBy=multi-user.target
   ```
   
   Activar servicio:
   ```bash
   sudo systemctl enable gura-bot
   sudo systemctl start gura-bot
   ```

---

## ☁️ **Instalación en Replit (Recomendado)**

### 🔧 **Pasos para Replit**

1. **Crear un nuevo Repl**
   - Ve a [Replit](https://replit.com/)
   - Crea un nuevo proyecto Node.js
   - Importa desde GitHub: `https://github.com/Im-Ado/Yuru-Yuri.git`

2. **Configurar variables de entorno**
   - Ve a la pestaña **Secrets** en Replit
   - Agrega las siguientes variables:
   ```
   PREFIX = .
   OWNER_NUMBER = 573133374132
   BOT_NAME = Gawr Gura Bot
   ```

3. **El proyecto se ejecutará automáticamente**
   - Replit instalará las dependencias automáticamente
   - Presiona el botón **Run**

4. **Escanear código QR**
   - Se generará un código QR en la consola
   - Escanéalo con WhatsApp Web
   - ¡El bot estará listo! 🎉

---

## 🐳 **Instalación con PM2 (Producción)**

### 🔧 **Para servidores de producción**

1. **Instalar PM2**
   ```bash
   npm install -g pm2
   ```

2. **Crear archivo ecosystem**
   ```bash
   nano ecosystem.config.js
   ```
   
   Contenido:
   ```javascript
   module.exports = {
     apps: [{
       name: 'gura-bot',
       script: 'index.js',
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production'
       }
     }]
   }
   ```

3. **Iniciar con PM2**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

---

<div align="center">

## 📚 Comandos Principales

</div>

### 🎮 **Entretenimiento**
| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `.dado` | Lanza un dado virtual | `.dado` |
| `.ruleta` | Gira la ruleta (1 vez/día) | `.ruleta` |
| `.top` | Crea rankings divertidos | `.top guapos` |
| `.rw` | Waifu aleatoria | `.rw` |

### 👥 **Administración de Grupos**
| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `.cerrar` | Cierra el grupo | `.cerrar` |
| `.abrir` | Abre el grupo | `.abrir` |
| `.cerrartemp` | Cierra por tiempo limitado | `.cerrartemp 5m` |
| `.kick` | Expulsa miembros | `.kick @usuario` |
| `.promote` | Da admin | `.promote @usuario` |
| `.demote` | Quita admin | `.demote @usuario` |

### 📋 **Utilidades de Grupo**
| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `.ficha` | Carta de presentación | `.ficha Hola soy Gura` |
| `.bienvenida` | Activa bienvenidas temporales | `.bienvenida ¡Hola!` |
| `.invocar` | Menciona a todos | `.invocar Reunión` |
| `.link` | Obtiene link del grupo | `.link` |
| `.personalidad` | Cambia personalidad del bot | `.personalidad kawaii` |

### 🎵 **Descargas**
| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `.play` | Descarga música | `.play nombre canción` |
| `.play2` | Descarga música alternativo | `.play2 artista - canción` |
| `.ytmp4` | Descarga video YouTube | `.ytmp4 URL` |
| `.tiktok` | Descarga videos TikTok | `.tiktok URL` |
| `.ig` | Descarga Instagram | `.ig URL` |
| `.pinterest` | Búsqueda en Pinterest | `.pinterest gatos kawaii` |

### 🛠️ **Herramientas**
| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `.sticker` | Crea stickers | `.sticker` (con imagen) |
| `.hd` | Mejora calidad de imagen | `.hd` (con imagen) |
| `.translate` | Traduce texto | `.translate es hello world` |
| `.ss` | Captura de pantalla web | `.ss google.com` |
| `.toimg` | Convierte sticker a imagen | `.toimg` (responder sticker) |
| `.letra` | Obtiene letra de canción | `.letra artista - canción` |

### 🤖 **Inteligencia Artificial**
| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `.dalle` | Genera imagen con IA | `.dalle gato espacial` |
| `.gemini` | Chat con Gemini AI | `.gemini explica la física cuántica` |
| `.claude` | Chat con Claude AI | `.claude escribe un poema` |
| `.brat` | Chat casual con IA | `.brat qué tal tu día` |

### 🔧 **Sub-Bots y Administración**
| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `.serbot` | Crear sub-bot | `.serbot` |
| `.bots` | Ver sub-bots activos | `.bots` |
| `.setname` | Cambiar nombre sub-bot | `.setname Mi Bot` |
| `.setbanner` | Cambiar banner sub-bot | `.setbanner` (con imagen) |
| `.premiumsubbot` | Dar premium a sub-bot | `.premiumsubbot @usuario 7d` |

### 📊 **Información y Diagnósticos**
| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `.menu` | Menú principal | `.menu` |
| `.ping` | Velocidad del bot | `.ping` |
| `.runtime` | Tiempo de actividad | `.runtime` |
| `.infobot` | Información del bot | `.infobot` |
| `.diagnostics` | Diagnósticos del sistema | `.diagnostics` |
| `.errormonitor` | Monitor de errores | `.errormonitor` |

---

<div align="center">

## ⚙️ Configuración Avanzada

</div>

### 🔐 **Variables de Entorno**
```env
# Configuración Principal
PREFIX = .
OWNER_NUMBER = 573133374132
BOT_NAME = Gawr Gura Bot

# APIs Opcionales
OPENAI_KEY = your_openai_key
DEEPAI_KEY = your_deepai_key

# Base de Datos (Opcional)
MONGODB_URI = your_mongodb_uri
```

### 📁 **Estructura del Proyecto**
```
Yuru-Yuri/
├── 📂 plugins/              # Comandos principales
│   ├── 🎮 game-*.js         # Juegos
│   ├── 👥 grupo-*.js        # Gestión de grupos
│   ├── 🛠️ tools-*.js        # Herramientas
│   ├── 📱 descargas-*.js    # Descargas
│   ├── 🤖 ai-*.js           # Inteligencia Artificial
│   ├── 📊 info-*.js         # Información
│   └── 🔧 owner-*.js        # Comandos de propietario
├── 📂 pluginsvip/          # Comandos VIP
│   ├── 💎 vip-*.js          # Funciones premium
├── 📂 lib/                 # Librerías principales
│   ├── 🚨 error-system.js  # Sistema de errores
│   ├── 💾 database.js      # Base de datos
│   ├── 🔧 simple.js        # Funciones básicas
│   └── 📝 logs.js          # Sistema de logs
├── 📂 database/            # Base de datos local
├── 📂 storage/             # Archivos temporales
├── 📂 sessions/            # Sesiones de WhatsApp
├── 📂 tmp/                 # Archivos temporales
├── ⚙️ config.js            # Configuración principal
├── 🚀 main.js              # Núcleo del bot
├── 📋 handler.js           # Manejador de comandos
├── 🔄 index.js             # Archivo de inicio
└── 📦 package.json         # Dependencias
```

### 🔧 **Personalización en config.js**
```javascript
// Información del bot
global.namebot = 'Gawr Gura'
global.nameqr = 'YuriBotMD'
global.packname = 'Gawr Gura'
global.author = 'Y⃟o⃟ S⃟o⃟y⃟ Y⃟o⃟'

// Canal oficial
global.canal = 'https://whatsapp.com/channel/0029VbAmMiM96H4KgBHZUn1z'

// Propietarios del bot
global.owner = [
  ['573133374132', '💖💝 Y⃟o⃟ S⃟o⃟y⃟ Y⃟o⃟ 💝 💖 ', true],
  ['50493732693', 'Ado', true]
]

// Configuración premium sub-bots
global.freeSubBotsLimits = {
  maxCommands: 50,        // comandos por día
  canSetName: false,      // cambiar nombre
  canSetBanner: false,    // cambiar banner
  maxGroups: 3           // máximo grupos
}
```

---

<div align="center">

## 🚨 Solución de Problemas

</div>

### ❌ **Problemas Comunes**

#### **Error de instalación en Termux**
```bash
# Si falla la instalación
pkg install git nodejs python -y
pkg install yarn -y
rm -rf node_modules
yarn install
```

#### **Error de ImageMagick**
```bash
# Linux/Termux
pkg install imagemagick -y
# O en Ubuntu
sudo apt install imagemagick -y
```

#### **Error de conexión QR**
```bash
# Eliminar sesión anterior
rm -rf sessions
npm start
```

#### **Bot no responde**
```bash
# Verificar logs
npm start
# Revisar archivo de errores
cat tmp/bot-errors.log
```

#### **Error de memoria**
```bash
# Limpiar caché
rm -rf tmp/*
rm -rf storage/databases/database.json
npm start
```

### 🔧 **Comandos de Diagnóstico**
- `.diagnostics` - Ver estado del sistema
- `.errormonitor` - Monitor de errores en tiempo real
- `.ping` - Verificar velocidad de respuesta
- `.runtime` - Tiempo de actividad del bot

---

<div align="center">

## 🤝 Contribución

</div>

### 📝 **Cómo Contribuir**
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: nueva característica'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### 🐛 **Reportar Bugs**
- Usa las [Issues](https://github.com/Im-Ado/Yuru-Yuri/issues) de GitHub
- Incluye pasos para reproducir el error
- Menciona tu versión de Node.js y sistema operativo
- Adjunta logs si es posible

### 💡 **Sugerir Características**
- Crea una issue con la etiqueta `enhancement`
- Describe detalladamente la funcionalidad
- Explica por qué sería útil para los usuarios

---

<div align="center">

## 📊 Especificaciones Técnicas

![Languages](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![Baileys](https://img.shields.io/badge/Baileys-6.7.16-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-GPL--3.0-red?style=for-the-badge)

**Versión:** 2.2.0  
**Dependencias:** 40+ paquetes  
**Soporte:** Multi-plataforma  
**Base de Datos:** JSON local / MongoDB  

## 💎 Características Premium

### 🌟 **Sub-Bots VIP**
- Comandos ilimitados
- Personalización completa
- Auto-reconexión 24/7
- Reportes estadísticos
- Soporte prioritario

### 🎮 **Funciones Exclusivas**
- Casino premium con más juegos
- Generación de videos con IA
- Análisis avanzado de contenido
- Respuestas automáticas inteligentes
- Integración con plataformas premium

## 💰 Donaciones

Si este proyecto te fue útil, considera apoyar el desarrollo:

[![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/yosoyyo)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/yosoyyo)

## 📄 Licencia

Este proyecto está bajo la Licencia GPL-3.0 - mira el archivo [LICENSE](LICENSE) para más detalles.

---

### 🦈 Desarrollado con ❤️ por [Yo Soy Yo](https://github.com/Im-Ado)

<img src="https://i.imgur.com/rKVlUIL.gif" alt="Gawr Gura Wave" width="200"/>

*"A~ Shaaark!" - Gawr Gura*

</div>

---

<div align="center">

### 🔗 Enlaces Útiles

[📖 Documentación](https://github.com/Im-Ado/Yuru-Yuri/wiki) • [🐛 Reportar Bug](https://github.com/Im-Ado/Yuru-Yuri/issues) • [💬 Canal WhatsApp](https://whatsapp.com/channel/0029VbAmMiM96H4KgBHZUn1z) • [📱 Soporte](https://wa.me/573133374132)

**⭐ Si te gustó el proyecto, dale una estrella en GitHub!**

**🔄 Última actualización:** Diciembre 2024

</div>
