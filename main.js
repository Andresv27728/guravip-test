process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';

import './config.js';
import { createRequire } from 'module';
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import * as ws from 'ws';
import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch, mkdirSync } from 'fs';
import yargs from 'yargs';
import chalk from 'chalk';
import syntaxerror from 'syntax-error';
import { tmpdir } from 'os';
import { format } from 'util';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import { makeWASocket } from './lib/simple.js';
import { initializeErrorSystem, cleanOldLogs } from './lib/error-system.js';
import { Low, JSONFile } from 'lowdb';
import lodash from 'lodash';
import readline from 'readline';
import NodeCache from 'node-cache';
import qrcode from 'qrcode-terminal';
import { spawn } from 'child_process';

const { proto } = (await import('@whiskeysockets/baileys')).default;
const {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
} = await import('@whiskeysockets/baileys');

const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

protoType();
serialize();

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};
global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
};
global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};

global.API = (name, path = '/', query = {}, apikeyqueryname) =>
  (name in global.APIs ? global.APIs[name] : name) +
  path +
  (query || apikeyqueryname
    ? '?' +
      new URLSearchParams(
        Object.entries({
          ...query,
          ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}),
        })
      )
    : '');

global.timestamp = { start: new Date() };

const __dirname = global.__dirname(import.meta.url);

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp(
  '^[' +
    (opts['prefix'] || '‎z/#$%.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') +
    ']'
);

global.db = new Low(new JSONFile(`storage/databases/database.json`));

global.DATABASE = global.db;
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ)
    return new Promise((resolve) =>
      setInterval(async function () {
        if (!global.db.READ) {
          clearInterval(this);
          resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
        }
      }, 1 * 1000)
    );
  if (global.db.data !== null) return;
  global.db.READ = true;
  await global.db.read().catch(console.error);
  global.db.READ = null;
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(global.db.data || {}),
  };
  global.db.chain = lodash.chain(global.db.data);
};

global.authFile = `sessions`;
const { state, saveCreds } = await useMultiFileAuthState(global.authFile);

const { version } = await fetchLatestBaileysVersion();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));

const logger = pino({
  timestamp: () => `,"time":"${new Date().toJSON()}"`,
}).child({ class: 'client' });
logger.level = 'fatal';

const connectionOptions = {
  version: version,
  logger,
  printQRInTerminal: false,
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, logger),
  },
  browser: Browsers.ubuntu('Chrome'),
  markOnlineOnclientect: false,
  generateHighQualityLinkPreview: true,
  syncFullHistory: true,
  retryRequestDelayMs: 10,
  transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 10 },
  maxMsgRetryCount: 15,
  appStateMacVerification: {
    patch: false,
    snapshot: false,
  },
  getMessage: async (key) => {
    const jid = jidNormalizedUser(key.remoteJid);
    const msg = await store.loadMessage(jid, key.id);
    return msg?.message || '';
  },
};

global.conn = makeWASocket(connectionOptions);

// Inicializar sistema de monitoreo de errores
initializeErrorSystem();

// Limpiar logs antiguos al inicio
cleanOldLogs();

/**
 * Función para reconectar un sub-bot y asignarle un manejador de mensajes.
 * @param {string} botPath - Ruta completa a la carpeta de sesión del sub-bot.
 */
/**
 * Función para reconectar un sub-bot y asignarle un manejador de mensajes.
 * @param {string} botPath - Ruta completa a la carpeta de sesión del sub-bot.
 * @param {string} priority - Prioridad del sub-bot: 'vip' o 'free'
 * @param {number} delay - Retraso antes de la reconexión en ms
 */
async function reconnectSubBot(botPath, priority = 'free', delay = 0) {
    const botNumber = path.basename(botPath);
    const priorityIcon = priority === 'vip' ? '💎' : '🆓';

    if (delay > 0) {
        console.log(chalk.cyan(`⏰ Esperando ${delay/1000}s para reconectar ${priorityIcon} sub-bot: ${botNumber}`));
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    console.log(chalk.yellow(`${priorityIcon} Intentando reconectar sub-bot ${priority.toUpperCase()}: ${botNumber}`));

    try {
        const { state: subBotState, saveCreds: saveSubBotCreds } = await useMultiFileAuthState(botPath);
        const subBotConn = makeWASocket({
            version: version,
            logger,
            printQRInTerminal: false,
            auth: {
                creds: subBotState.creds,
                keys: makeCacheableSignalKeyStore(subBotState.keys, logger),
            },
            browser: priority === 'vip' ?
                ['Premium VIP Bot', 'Chrome', '2.0.0'] :
                ['Free Bot', 'Chrome', '1.0.0'],
            markOnlineOnclientect: false,
            generateHighQualityLinkPreview: priority === 'vip',
            syncFullHistory: priority === 'vip',
            retryRequestDelayMs: priority === 'vip' ? 5 : 15,
            transactionOpts: {
                maxCommitRetries: priority === 'vip' ? 15 : 5,
                delayBetweenTriesMs: priority === 'vip' ? 5 : 15
            },
            maxMsgRetryCount: priority === 'vip' ? 20 : 10,
            appStateMacVerification: {
                patch: false,
                snapshot: false,
            },
            getMessage: async (key) => {
                const jid = jidNormalizedUser(key.remoteJid);
                const msg = await store.loadMessage(jid, key.id);
                return msg?.message || '';
            },
        });

        subBotConn.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'open') {
                console.log(chalk.green(`✅ ${priorityIcon} Sub-bot ${priority.toUpperCase()} conectado: ${botNumber}`));

                // Auto-reconexión habilitada para VIP
                if (priority === 'vip') {
                    subBotConn.autoReconnect = true;
                    console.log(chalk.magenta(`🔄 Auto-reconexión VIP activada para: ${botNumber}`));
                }
            } else if (connection === 'close') {
                const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
                console.error(chalk.red(`❌ ${priorityIcon} Sub-bot ${priority.toUpperCase()} desconectado: ${botNumber}. Razón: ${reason}`));

                // Auto-reconexión solo para VIP
                if (priority === 'vip' && subBotConn.autoReconnect) {
                    console.log(chalk.yellow(`🔄 Reintentando reconexión VIP para: ${botNumber}`));
                    setTimeout(() => {
                        reconnectSubBot(botPath, priority, 5000); // Reintentar en 5 segundos
                    }, 5000);
                }
            }
        });

        subBotConn.ev.on('creds.update', saveSubBotCreds);

        // Asignar el manejador de mensajes al sub-bot
        if (handler && handler.handler) {
            subBotConn.handler = handler.handler.bind(subBotConn);
            subBotConn.ev.on('messages.upsert', subBotConn.handler);
            console.log(chalk.blue(`📨 Manejador asignado al sub-bot ${priority.toUpperCase()}: ${botNumber}`));
        } else {
            console.warn(chalk.yellow(`⚠️ No se encontró el manejador para: ${botNumber}`));
        }

        // Guardar la conexión del sub-bot
        if (!global.subBots) {
            global.subBots = {};
        }
        global.subBots[botNumber] = {
            conn: subBotConn,
            priority: priority,
            autoReconnect: priority === 'vip'
        };

    } catch (e) {
        console.error(chalk.red(`❌ Error al reconectar ${priorityIcon} sub-bot ${priority.toUpperCase()} en ${botNumber}:`), e);

        // Reintentar solo para VIP en caso de error
        if (priority === 'vip') {
            console.log(chalk.yellow(`🔄 Reintentando reconexión VIP en 10 segundos para: ${botNumber}`));
            setTimeout(() => {
                reconnectSubBot(botPath, priority, 10000);
            }, 10000);
        }
    }
}

/**
 * Función para reconectar todos los sub-bots con prioridades
 */
async function reconnectAllSubBots() {
    const rutaJadiBot = join(__dirname, './JadiBots');

    if (!existsSync(rutaJadiBot)) {
        console.log(chalk.red('❌ No existe la carpeta JadiBots'));
        return;
    }

    const readRutaJadiBot = readdirSync(rutaJadiBot);
    if (readRutaJadiBot.length === 0) {
        console.log(chalk.yellow('⚠️ No hay sub-bots para reconectar'));
        return;
    }

    console.log(chalk.bold.cyan('🚀 Iniciando reconexión por prioridades...'));

    const vipBots = [];
    const freeBots = [];
    const credsFile = 'creds.json';

    // Clasificar bots por tipo
    for (const subBotDir of readRutaJadiBot) {
        const botPath = join(rutaJadiBot, subBotDir);
        const readBotPath = readdirSync(botPath);

        if (readBotPath.includes(credsFile)) {
            const botNumber = subBotDir.replace(/[^0-9]/g, '');
            const isVip = global.premiumSubBots?.includes(botNumber);

            if (isVip) {
                vipBots.push(botPath);
            } else {
                freeBots.push(botPath);
            }
        }
    }

    console.log(chalk.bold.magenta(`💎 Sub-bots VIP encontrados: ${vipBots.length}`));
    console.log(chalk.bold.blue(`🆓 Sub-bots gratuitos encontrados: ${freeBots.length}`));

    // 1. Reconectar bots VIP primero (prioridad alta)
    console.log(chalk.bold.magenta('💎 Fase 1: Reconectando sub-bots VIP...'));
    for (let i = 0; i < vipBots.length; i++) {
        const delay = i * 2000; // 2 segundos entre cada VIP
        reconnectSubBot(vipBots[i], 'vip', delay);
    }

    // 2. Reconectar bots gratuitos después (prioridad baja)
    const vipReconnectionTime = vipBots.length * 2000 + 5000; // Tiempo para VIP + 5s extra
    console.log(chalk.bold.blue(`🆓 Fase 2: Reconectando sub-bots gratuitos en ${vipReconnectionTime/1000}s...`));

    setTimeout(() => {
        for (let i = 0; i < freeBots.length; i++) {
            const delay = i * 5000; // 5 segundos entre cada gratuito
            reconnectSubBot(freeBots[i], 'free', delay);
        }
    }, vipReconnectionTime);
}


async function handleLogin() {
  if (conn.authState.creds.registered) {
    console.log(chalk.green('Sesión ya está registrada.'));
    return;
  }

  let loginMethod = await question(
    chalk.green(
      '¿Cómo deseas iniciar sesión?\nEscribe "qr" para escanear el código QR o "code" para usar un código de 8 dígitos:\n'
    )
  );

  loginMethod = loginMethod.toLowerCase().trim();

  if (loginMethod === 'code') {
    let phoneNumber = await question(chalk.blue('Ingresa el número de WhatsApp donde estará el bot (incluye código país, ej: 521XXXXXXXXXX):\n'));
    phoneNumber = phoneNumber.replace(/\D/g, ''); // Solo números

    // Ajustes básicos para México (52)
    if (phoneNumber.startsWith('52') && phoneNumber.length === 12) {
      phoneNumber = `521${phoneNumber.slice(2)}`;
    } else if (phoneNumber.startsWith('52')) {
      phoneNumber = `521${phoneNumber.slice(2)}`;
    } else if (phoneNumber.startsWith('0')) {
      phoneNumber = phoneNumber.replace(/^0/, '');
    }

    if (typeof conn.requestPairingCode === 'function') {
      try {
        // Validar que la conexión esté abierta antes de solicitar código
        if (conn.ws.readyState === ws.OPEN) {
          let code = await conn.requestPairingCode(phoneNumber);
          code = code?.match(/.{1,4}/g)?.join('-') || code;
          console.log(chalk.cyan('Tu código de emparejamiento es:', code));
        } else {
          console.log(chalk.red('La conexión no está abierta. Intenta nuevamente.'));
        }
      } catch (e) {
        console.log(chalk.red('Error al solicitar código de emparejamiento:'), e.message || e);
      }
    } else {
      console.log(chalk.red('Tu versión de Baileys no soporta emparejamiento por código.'));
    }
  } else {
    console.log(chalk.yellow('Generando código QR, escanéalo con tu WhatsApp...'));
    conn.ev.on('connection.update', ({ qr }) => {
      if (qr) qrcode.generate(qr, { small: true });
    });
  }
}

await handleLogin();

conn.isInit = false;
conn.well = false;

if (!opts['test']) {
  if (global.db) {
    setInterval(async () => {
      if (global.db.data) await global.db.write();
      if (opts['autocleartmp']) {
        const tmp = [tmpdir(), 'tmp', 'serbot'];
        tmp.forEach((filename) => {
          spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete']);
        });
      }
    }, 30 * 1000);
  }
}

function clearTmp() {
  const tmp = [join(__dirname, './tmp')];
  const filename = [];
  tmp.forEach((dirname) => readdirSync(dirname).forEach((file) => filename.push(join(dirname, file))));
  return filename.map((file) => {
    const stats = statSync(file);
    if (stats.isFile() && Date.now() - stats.mtimeMs >= 1000 * 60 * 3) return unlinkSync(file);
    return false;
  });
}

setInterval(() => {
  if (global.stopped === 'close' || !conn || !conn.user) return;
  clearTmp();
}, 180000);

async function connectionUpdate(update) {
  const { connection, lastDisconnect, isNewLogin } = update;
  global.stopped = connection;
  if (isNewLogin) conn.isInit = true;
  const code =
    lastDisconnect?.error?.output?.statusCode ||
    lastDisconnect?.error?.output?.payload?.statusCode;
  if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
    await global.reloadHandler(true).catch(console.error);
    global.timestamp.connect = new Date();
  }
  if (global.db.data == null) await loadDatabase();
  if (connection === 'open') {
    console.log(chalk.bold.green('🟢 Bot principal conectado correctamente'));

    // Inicializar sistema de reportes diarios VIP
    try {
      const { initializeDailyReports } = await import('./plugins/vip-daily-report.js')
      initializeDailyReports()
    } catch (e) {
      console.log('⚠️ No se pudo inicializar reportes VIP:', e)
    }

    // --- Lógica de reconexión de sub-bots con prioridades ---
    const rutaJadiBot = join(__dirname, './JadiBots');

    if (!existsSync(rutaJadiBot)) {
        mkdirSync(rutaJadiBot, { recursive: true });
        console.log(chalk.bold.cyan(`📁 Carpeta JadiBots creada: ${rutaJadiBot}`));
    } else {
        console.log(chalk.bold.cyan(`📁 Carpeta JadiBots encontrada: ${rutaJadiBot}`));
    }

    // Esperar 3 segundos después de que el bot principal se conecte
    console.log(chalk.bold.cyan('⏰ Esperando 3 segundos antes de reconectar sub-bots...'));
    setTimeout(() => {
        reconnectAllSubBots();
    }, 3000);
    // --- Fin de la lógica de reconexión de sub-bots ---

  }
  const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
  if (reason === 405) {
    if (existsSync('./sessions/creds.json')) unlinkSync('./sessions/creds.json');
    console.log(
      chalk.bold.redBright(
        `Conexión reemplazada, por favor espera un momento. Reiniciando...\nSi aparecen errores, vuelve a iniciar con: npm start`
      )
    );
    process.send('reset');
  }
  if (connection === 'close') {
    switch (reason) {
      case DisconnectReason.badSession:
        conn.logger.error(`Sesión incorrecta, elimina la carpeta ${global.authFile} y escanea nuevamente.`);
        break;
      case DisconnectReason.connectionClosed:
      case DisconnectReason.connectionLost:
      case DisconnectReason.timedOut:
        conn.logger.warn(`Conexión perdida o cerrada, reconectando...`);
        await global.reloadHandler(true).catch(console.error);
        break;
      case DisconnectReason.connectionReplaced:
        conn.logger.error(
          `Conexión reemplazada, se abrió otra sesión. Cierra esta sesión primero.`
        );
        break;
      case DisconnectReason.loggedOut:
        conn.logger.error(`Sesión cerrada, elimina la carpeta ${global.authFile} y escanea nuevamente.`);
        break;
      case DisconnectReason.restartRequired:
        conn.logger.info(`Reinicio necesario, reinicia el servidor si hay problemas.`);
        await global.reloadHandler(true).catch(console.error);
        break;
      default:
        conn.logger.warn(`Desconexión desconocida: ${reason || ''} - Estado: ${connection || ''}`);
        await global.reloadHandler(true).catch(console.error);
        break;
    }
  }
}

process.on('uncaughtException', console.error);

let isInit = true;
// La importación de handler.js debe hacerse antes de que se use en reconnectSubBot
let handler = await import('./handler.js'); // Asegúrate que esta línea esté aquí

global.reloadHandler = async function (restartConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
    if (Handler && Object.keys(Handler).length) handler = Handler;
  } catch (e) {
    console.error(e);
  }

  if (restartConn) {
    try {
      if (global.conn.ws) global.conn.ws.close();
    } catch {}
    global.conn.ev.removeAllListeners();
    global.conn = makeWASocket(connectionOptions);
    isInit = true;
  }

  if (!isInit) {
    conn.ev.off('messages.upsert', conn.handler);
    conn.ev.off('connection.update', conn.connectionUpdate);
    conn.ev.off('creds.update', conn.credsUpdate);
  }

  conn.handler = handler.handler.bind(global.conn);
  conn.connectionUpdate = connectionUpdate.bind(global.conn);
  conn.credsUpdate = saveCreds.bind(global.conn, true);

  conn.ev.on('messages.upsert', conn.handler);
  conn.ev.on('connection.update', conn.connectionUpdate);
  conn.ev.on('creds.update', conn.credsUpdate);

  isInit = false;
  return true;
};

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'));
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};

async function filesInit() {
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const file = global.__filename(join(pluginFolder, filename));
      const module = await import(file);
      global.plugins[filename] = module.default || module;
    } catch (e) {
      conn.logger.error(e);
      delete global.plugins[filename];
    }
  }
}
await filesInit();

global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    const dir = global.__filename(join(pluginFolder, filename), true);
    if (filename in global.plugins) {
      if (existsSync(dir)) conn.logger.info(`Updated plugin - '${filename}'`);
      else {
        conn.logger.warn(`Deleted plugin - '${filename}'`);
        return delete global.plugins[filename];
      }
    } else conn.logger.info(`New plugin - '${filename}'`);

    const err = syntaxerror(readFileSync(dir), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
    });
    if (err) conn.logger.error(`Syntax error while loading '${filename}':\n${format(err)}`);
    else {
      try {
        const module = await import(`${global.__filename(dir)}?update=${Date.now()}`);
        global.plugins[filename] = module.default || module;
      } catch (e) {
        conn.logger.error(`Error requiring plugin '${filename}':\n${format(e)}`);
      } finally {
        global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
      }
    }
  }
};
Object.freeze(global.reload);

watch(pluginFolder, global.reload);
await global.reloadHandler();