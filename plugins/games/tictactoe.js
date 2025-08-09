/**
 * TicTacToe game command
 * Category: games
 */

const { formatMessage } = require('../../lib/connect');

// Store active games
const activeGames = {};

class TicTacToeGame {
    constructor(player1) {
        this.board = [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9']
        ];
        this.player1 = player1; // X
        this.player2 = null;    // O
        this.currentTurn = null;
        this.status = 'waiting'; // waiting, playing, ended
    }
    
    join(player2) {
        if (this.status !== 'waiting') return false;
        if (player2 === this.player1) return false;
        
        this.player2 = player2;
        this.currentTurn = this.player1;
        this.status = 'playing';
        return true;
    }
    
    makeMove(player, position) {
        if (this.status !== 'playing') return { success: false, message: 'Game is not active' };
        if (player !== this.currentTurn) return { success: false, message: 'Not your turn' };
        
        // Convert position (1-9) to board coordinates
        const pos = parseInt(position);
        if (isNaN(pos) || pos < 1 || pos > 9) return { success: false, message: 'Invalid position' };
        
        const row = Math.floor((pos - 1) / 3);
        const col = (pos - 1) % 3;
        
        // Check if position is already taken
        if (this.board[row][col] === 'X' || this.board[row][col] === 'O') {
            return { success: false, message: 'Position already taken' };
        }
        
        // Make the move
        this.board[row][col] = player === this.player1 ? 'X' : 'O';
        
        // Check for win
        const result = this.checkWin();
        if (result.status === 'win' || result.status === 'draw') {
            this.status = 'ended';
            return { 
                success: true, 
                message: result.status === 'win' ? `${player} wins!` : 'Game ended in a draw!',
                gameEnded: true,
                winner: result.status === 'win' ? player : null
            };
        }
        
        // Switch turns
        this.currentTurn = player === this.player1 ? this.player2 : this.player1;
        return { success: true, message: `${this.currentTurn}'s turn` };
    }
    
    checkWin() {
        // Check rows
        for (let i = 0; i < 3; i++) {
            if (this.board[i][0] === this.board[i][1] && this.board[i][1] === this.board[i][2]) {
                return { status: 'win', line: [i, 0, i, 2] };
            }
        }
        
        // Check columns
        for (let i = 0; i < 3; i++) {
            if (this.board[0][i] === this.board[1][i] && this.board[1][i] === this.board[2][i]) {
                return { status: 'win', line: [0, i, 2, i] };
            }
        }
        
        // Check diagonals
        if (this.board[0][0] === this.board[1][1] && this.board[1][1] === this.board[2][2]) {
            return { status: 'win', line: [0, 0, 2, 2] };
        }
        
        if (this.board[0][2] === this.board[1][1] && this.board[1][1] === this.board[2][0]) {
            return { status: 'win', line: [0, 2, 2, 0] };
        }
        
        // Check for draw (all positions filled)
        let isDraw = true;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (!['X', 'O'].includes(this.board[i][j])) {
                    isDraw = false;
                    break;
                }
            }
            if (!isDraw) break;
        }
        
        return { status: isDraw ? 'draw' : 'ongoing' };
    }
    
    renderBoard() {
        let boardStr = '🎮 *Tic-Tac-Toe Game*\n\n';
        
        for (let i = 0; i < 3; i++) {
            boardStr += this.board[i].map(cell => {
                if (cell === 'X') return '❌';
                if (cell === 'O') return '⭕';
                return `${cell}️⃣`;
            }).join(' ') + '\n';
        }
        
        if (this.status === 'waiting') {
            boardStr += `\n⏳ Waiting for player 2 to join...\n👤 Player 1: @${this.player1.split('@')[0]}\n\n📝 Type *!ttt join* to join`;
        } else if (this.status === 'playing') {
            const currentPlayer = this.currentTurn === this.player1 ? '❌' : '⭕';
            const currentPlayerJid = this.currentTurn === this.player1 ? this.player1 : this.player2;
            
            boardStr += `\n👤 Player 1 (❌): @${this.player1.split('@')[0]}\n👤 Player 2 (⭕): @${this.player2.split('@')[0]}\n\n🎲 Current turn: ${currentPlayer} @${currentPlayerJid.split('@')[0]}\n\n📝 Type *!ttt <position>* to place your mark`;
        } else if (this.status === 'ended') {
            boardStr += `\n🏁 Game ended!`;
        }
        
        return boardStr;
    }
}

module.exports = {
    name: 'TicTacToe',
    desc: 'Play Tic-Tac-Toe game',
    usage: '!ttt [start/join/position]',
    aliases: ['ttt'],
    
    /**
     * Execute command
     * @param {Object} ctx - Command context
     */
    execute: async (ctx) => {
        const { sock, message, args, metadata } = ctx;
        const groupId = metadata.from;
        const sender = metadata.sender;
        
        // Check if the command is used in a group
        if (!metadata.isGroup) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('❌ This command can only be used in groups!') 
            });
            return;
        }
        
        const command = args[0] ? args[0].toLowerCase() : 'help';
        
        switch(command) {
            case 'start':
                // Check if there's already a game in this group
                if (activeGames[groupId]) {
                    await sock.sendMessage(groupId, { 
                        text: formatMessage('❌ A game is already in progress in this group!') 
                    });
                    return;
                }
                
                // Create a new game
                activeGames[groupId] = new TicTacToeGame(sender);
                
                // Send board
                await sock.sendMessage(groupId, { 
                    text: formatMessage(activeGames[groupId].renderBoard()),
                    mentions: [sender]
                });
                break;
                
            case 'join':
                // Check if there's a game waiting for players
                if (!activeGames[groupId]) {
                    await sock.sendMessage(groupId, { 
                        text: formatMessage('❌ There\'s no active game in this group!\n\n📝 Type *!ttt start* to start a new game.') 
                    });
                    return;
                }
                
                // Check if the game is waiting for a second player
                if (activeGames[groupId].status !== 'waiting') {
                    await sock.sendMessage(groupId, { 
                        text: formatMessage('❌ The game is already in progress or has ended!') 
                    });
                    return;
                }
                
                // Join the game
                const joinSuccess = activeGames[groupId].join(sender);
                if (!joinSuccess) {
                    await sock.sendMessage(groupId, { 
                        text: formatMessage('❌ You cannot join your own game!') 
                    });
                    return;
                }
                
                // Send updated board
                await sock.sendMessage(groupId, { 
                    text: formatMessage(activeGames[groupId].renderBoard()),
                    mentions: [activeGames[groupId].player1, activeGames[groupId].player2]
                });
                break;
                
            case 'help':
                await sock.sendMessage(groupId, { 
                    text: formatMessage('🎮 *Tic-Tac-Toe Commands*\n\n📝 *!ttt start* - Start a new game\n📝 *!ttt join* - Join an existing game\n📝 *!ttt <1-9>* - Make a move\n📝 *!ttt end* - End the current game') 
                });
                break;
                
            case 'end':
                // Check if there's an active game
                if (!activeGames[groupId]) {
                    await sock.sendMessage(groupId, { 
                        text: formatMessage('❌ There\'s no active game in this group!') 
                    });
                    return;
                }
                
                // Check if the sender is one of the players
                const isPlayer = sender === activeGames[groupId].player1 || 
                                (activeGames[groupId].player2 && sender === activeGames[groupId].player2);
                
                if (!isPlayer && !metadata.isGroupAdmin && !metadata.fromMe) {
                    await sock.sendMessage(groupId, { 
                        text: formatMessage('❌ Only players or group admins can end the game!') 
                    });
                    return;
                }
                
                // End the game
                await sock.sendMessage(groupId, { 
                    text: formatMessage('🏁 Game ended by @' + sender.split('@')[0]),
                    mentions: [sender]
                });
                
                delete activeGames[groupId];
                break;
                
            default:
                // Check if there's an active game
                if (!activeGames[groupId]) {
                    await sock.sendMessage(groupId, { 
                        text: formatMessage('❌ There\'s no active game in this group!\n\n📝 Type *!ttt start* to start a new game.') 
                    });
                    return;
                }
                
                // Check if the game is in progress
                if (activeGames[groupId].status !== 'playing') {
                    await sock.sendMessage(groupId, { 
                        text: formatMessage('❌ The game is not in progress!\n\n📝 Type *!ttt join* to join the game.') 
                    });
                    return;
                }
                
                // Check if it's the sender's turn
                if (sender !== activeGames[groupId].currentTurn) {
                    await sock.sendMessage(groupId, { 
                        text: formatMessage('❌ It\'s not your turn!'),
                        mentions: [sender]
                    });
                    return;
                }
                
                // Make the move
                const moveResult = activeGames[groupId].makeMove(sender, command);
                
                if (!moveResult.success) {
                    await sock.sendMessage(groupId, { 
                        text: formatMessage(`❌ ${moveResult.message}`),
                        mentions: [sender]
                    });
                    return;
                }
                
                // Send updated board
                await sock.sendMessage(groupId, { 
                    text: formatMessage(activeGames[groupId].renderBoard()),
                    mentions: [activeGames[groupId].player1, activeGames[groupId].player2]
                });
                
                // If game ended, clean up
                if (moveResult.gameEnded) {
                    if (moveResult.winner) {
                        await sock.sendMessage(groupId, { 
                            text: formatMessage(`🏆 @${moveResult.winner.split('@')[0]} wins the game!`),
                            mentions: [moveResult.winner]
                        });
                    } else {
                        await sock.sendMessage(groupId, { 
                            text: formatMessage('🤝 Game ended in a draw!') 
                        });
                    }
                    
                    // Delete the game after a short delay
                    setTimeout(() => {
                        delete activeGames[groupId];
                    }, 1000);
                }
                break;
        }
    }
};