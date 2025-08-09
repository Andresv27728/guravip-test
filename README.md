# WhatsApp Bot with Baileys

A powerful WhatsApp bot built with JavaScript and Node.js using the Baileys library. This bot features a plugin-based command system, premium user management, and lots of useful commands.

![WhatsApp Bot](https://i.imgur.com/example.png)

## ✨ Features

- 🔌 Plugin-based command system
- 👑 Premium user management
- 🧩 100+ built-in commands
- 👥 Group management
- 🎮 Games and fun commands
- ⬇️ Media downloading
- 🔄 Easy to extend with new plugins
- 📊 User statistics
- 🔐 Sub-bot system (public/premium)

## 📋 Requirements

- Node.js v14+
- A WhatsApp account
- Internet connection

## 📲 Installation

### Method 1: Local Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/whatsapp-bot-baileys.git

# Navigate to the directory
cd whatsapp-bot-baileys

# Install dependencies
npm install

# Start the bot
npm start
```

### Method 2: Termux (Android)

```bash
# Update packages
pkg update && pkg upgrade

# Install required packages
pkg install nodejs git libwebp ffmpeg imagemagick

# Clone the repository
git clone https://github.com/yourusername/whatsapp-bot-baileys.git

# Navigate to the directory
cd whatsapp-bot-baileys

# Install dependencies
npm install

# Start the bot
npm start
```

### Method 3: Boxmine or VPS

```bash
# Login to your server via SSH
ssh user@yourserver

# Update system
apt update && apt upgrade

# Install required packages
apt install nodejs git libwebp ffmpeg imagemagick

# Clone the repository
git clone https://github.com/yourusername/whatsapp-bot-baileys.git

# Navigate to the directory
cd whatsapp-bot-baileys

# Install dependencies
npm install

# Install PM2 to keep the bot running
npm install -g pm2

# Start the bot with PM2
pm2 start index.js --name "whatsapp-bot"

# Check logs
pm2 logs whatsapp-bot
```

## ⚙️ Configuration

Edit `config/settings.js` to customize your bot:

```javascript
module.exports = {
    bot: {
        name: "YourBotName", // Bot name
        emoji: "🤖", // Bot emoji
        prefix: "!", // Command prefix
        owners: ["1234567890"], // Your WhatsApp number
    },
    // More settings...
};
```

## 🚀 Getting Started

1. Start the bot: `npm start`
2. Scan the QR code with WhatsApp
3. Wait for the bot to connect
4. Try a command like `!help` to get started

## 📝 Sub-bot System

This bot includes a sub-bot system with two tiers:

### Public Sub-bots

- Limited access to basic commands
- Only 2 download commands
- Minimal group administration commands
- Limited game commands
- Perfect for testing the bot

### Premium Sub-bots

- Full access to all commands
- All download options available
- Complete group administration
- All games and fun features
- Premium features

## 👑 Premium Management

### How to Add Premium Users

As the owner of the bot, use the command:

```
!vip 1234567890 30
```

This gives premium access to the number `1234567890` for `30` days.

### Premium Benefits

- Full access to all commands
- Unlimited downloads
- Priority processing
- No usage limits

## 📚 Available Commands

Here's a list of some available commands:

### 👮 Admin Commands
- `!kick @user` - Remove a user from the group
- `!add 1234567890` - Add a user to the group
- `!promote @user` - Make a user admin
- `!demote @user` - Remove admin status
- `!mute` - Mute the group (only admins can send messages)
- `!unmute` - Unmute the group
- `!link` - Get the group invite link
- `!setname New Group Name` - Change group name
- `!setdesc New Description` - Change group description
- `!tagall` - Mention all members
- `!warning @user` - Give a warning to a user

### ⬇️ Download Commands
- `!ytmp3 URL` - Download YouTube audio
- `!ytmp4 URL` - Download YouTube video
- `!fb URL` - Download Facebook video
- `!ig URL` - Download Instagram post/video
- `!tiktok URL` - Download TikTok video
- `!twitter URL` - Download Twitter video
- `!spotify URL` - Download Spotify track
- `!image query` - Search and download an image
- `!pinterest query` - Download from Pinterest

### 🎮 Game Commands
- `!tictactoe @user` - Play Tic Tac Toe
- `!hangman` - Play Hangman
- `!trivia` - Trivia questions
- `!math` - Math challenges
- `!quiz` - General knowledge quiz
- `!riddle` - Solve riddles
- `!truth` - Truth question
- `!dare` - Dare challenge
- `!roll` - Roll a dice
- `!flip` - Flip a coin

### 👑 Owner Commands
- `!broadcast message` - Send message to all users
- `!eval code` - Evaluate JavaScript code
- `!exec command` - Execute shell command
- `!ban @user reason` - Ban a user
- `!unban phone_number` - Unban a user
- `!setname name` - Change bot name
- `!restart` - Restart the bot
- `!update` - Update bot from repository
- `!vip number days` - Give premium access
- `!stats` - Show bot statistics

### ⭐ Premium Commands
- `!sticker` - Create stickers from images/videos
- `!translate text` - Translate text to different language
- `!ocr` - Extract text from image
- `!removebg` - Remove background from image
- `!weather city` - Get weather information
- `!wallpaper query` - Download HD wallpapers
- `!lyrics song name` - Find song lyrics
- `!anime title` - Search anime information

### 🌐 Public Commands
- `!help` - Show command list
- `!info` - Bot information
- `!ping` - Check bot response time
- `!profile` - View your profile
- `!menu` - Show complete menu
- `!status` - Check bot status
- `!creator` - Bot creator info
- `!donate` - Support the developer

## ⚠️ Troubleshooting

### Common Issues

1. **QR Code Not Showing**
   - Make sure your terminal supports QR rendering
   - Try using `npm run qr` to generate a QR code

2. **Connection Issues**
   - Check your internet connection
   - Ensure your WhatsApp is up to date
   - Try deleting the `sessions` folder and reconnecting

3. **Missing Dependencies**
   - Run `npm install` again to ensure all dependencies are installed
   - For media processing, ensure ffmpeg is properly installed

### Still Having Problems?

Open an issue on GitHub with:
- Your system information
- Error logs
- Steps to reproduce the issue

## 🌟 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Contact

- WhatsApp: +1234567890
- Email: your-email@example.com
- GitHub: [yourusername](https://github.com/yourusername)

---

Made with ❤️ by Your Name