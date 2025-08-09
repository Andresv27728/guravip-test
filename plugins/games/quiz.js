/**
 * Quiz game command
 * Category: games
 */

const { formatMessage } = require('../../lib/connect');
const axios = require('axios');

// Store active quizzes
const activeQuizzes = {};

class Quiz {
    constructor(questionData, groupId, sender) {
        this.question = questionData.question;
        this.correctAnswer = questionData.correct_answer;
        this.incorrectAnswers = questionData.incorrect_answers;
        this.allAnswers = [...this.incorrectAnswers, this.correctAnswer].sort(() => Math.random() - 0.5);
        this.category = questionData.category;
        this.difficulty = questionData.difficulty;
        this.sender = sender;
        this.groupId = groupId;
        this.answered = false;
        this.timer = null;
        this.startTime = Date.now();
    }
    
    getQuestion() {
        const difficultyEmoji = {
            easy: '🟢',
            medium: '🟡',
            hard: '🔴'
        };
        
        let questionText = `🎯 *Quiz Time!* ${difficultyEmoji[this.difficulty] || '❓'}\n\n`;
        questionText += `📋 Category: ${this.category}\n`;
        questionText += `❓ Question: ${this.decodeHtml(this.question)}\n\n`;
        
        // Add answer options
        this.allAnswers.forEach((answer, index) => {
            const option = String.fromCharCode(65 + index); // A, B, C, D
            questionText += `${option}. ${this.decodeHtml(answer)}\n`;
        });
        
        questionText += `\n⏱️ You have 30 seconds to answer!\n📝 Type *!quiz <letter>* to answer`;
        
        return questionText;
    }
    
    checkAnswer(answer) {
        if (this.answered) return { correct: false, message: 'This quiz has already been answered!' };
        
        const letterIndex = answer.toUpperCase().charCodeAt(0) - 65; // Convert A to 0, B to 1, etc.
        if (letterIndex < 0 || letterIndex >= this.allAnswers.length) {
            return { correct: false, message: 'Invalid option! Please choose a valid letter.' };
        }
        
        const selectedAnswer = this.allAnswers[letterIndex];
        const correct = selectedAnswer === this.correctAnswer;
        const timeTaken = ((Date.now() - this.startTime) / 1000).toFixed(2);
        
        this.answered = true;
        clearTimeout(this.timer);
        
        if (correct) {
            return {
                correct: true,
                message: `✅ Correct! The answer is ${this.decodeHtml(this.correctAnswer)}\n⏱️ You answered in ${timeTaken} seconds!`,
                timeTaken: parseFloat(timeTaken)
            };
        } else {
            return {
                correct: false,
                message: `❌ Wrong! The correct answer is ${this.decodeHtml(this.correctAnswer)}`
            };
        }
    }
    
    decodeHtml(html) {
        return html
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&ldquo;/g, '"')
            .replace(/&rdquo;/g, '"')
            .replace(/&lsquo;/g, ''')
            .replace(/&rsquo;/g, ''');
    }
}

module.exports = {
    name: 'Quiz',
    desc: 'Play a trivia quiz game',
    usage: '!quiz [category]',
    
    /**
     * Execute command
     * @param {Object} ctx - Command context
     */
    execute: async (ctx) => {
        const { sock, message, args, metadata } = ctx;
        const groupId = metadata.from;
        const sender = metadata.sender;
        const isGroup = metadata.isGroup;
        
        // Only allow in groups
        if (!isGroup) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('❌ This command can only be used in groups!') 
            });
            return;
        }
        
        // Check if first arg is a letter answer for an active quiz
        if (args.length > 0 && args[0].length === 1 && /[A-Da-d]/.test(args[0])) {
            // Check if there's an active quiz in this group
            if (!activeQuizzes[groupId] || activeQuizzes[groupId].answered) {
                await sock.sendMessage(groupId, { 
                    text: formatMessage('❌ There\'s no active quiz in this group!\n\n📝 Type *!quiz* to start a new quiz.') 
                });
                return;
            }
            
            const quiz = activeQuizzes[groupId];
            const result = quiz.checkAnswer(args[0]);
            
            await sock.sendMessage(groupId, { 
                text: formatMessage(result.message),
                mentions: [sender]
            });
            
            delete activeQuizzes[groupId];
            return;
        }
        
        // Check if there's already an active quiz
        if (activeQuizzes[groupId] && !activeQuizzes[groupId].answered) {
            await sock.sendMessage(groupId, { 
                text: formatMessage('❌ There\'s already an active quiz in this group! Answer it first!') 
            });
            return;
        }
        
        // Get category if specified
        let categoryId = '';
        if (args.length > 0) {
            const category = args.join(' ').toLowerCase();
            const categories = {
                'general': 9,
                'books': 10,
                'film': 11,
                'music': 12,
                'theatre': 13,
                'television': 14,
                'video games': 15,
                'board games': 16,
                'science': 17,
                'computers': 18,
                'math': 19,
                'mythology': 20,
                'sports': 21,
                'geography': 22,
                'history': 23,
                'politics': 24,
                'art': 25,
                'celebrities': 26,
                'animals': 27
            };
            
            if (categories[category]) {
                categoryId = `&category=${categories[category]}`;
            }
        }
        
        try {
            // Fetch a random trivia question
            const response = await axios.get(`https://opentdb.com/api.php?amount=1${categoryId}&type=multiple&encode=html3`);
            
            if (response.data.response_code !== 0 || !response.data.results || !response.data.results.length) {
                await sock.sendMessage(groupId, { 
                    text: formatMessage('❌ Failed to get a quiz question. Please try again or try a different category.') 
                });
                return;
            }
            
            // Create new quiz
            const quiz = new Quiz(response.data.results[0], groupId, sender);
            activeQuizzes[groupId] = quiz;
            
            // Send the question
            await sock.sendMessage(groupId, { 
                text: formatMessage(quiz.getQuestion()) 
            });
            
            // Set timeout to end the quiz after 30 seconds
            quiz.timer = setTimeout(async () => {
                if (activeQuizzes[groupId] && !activeQuizzes[groupId].answered) {
                    activeQuizzes[groupId].answered = true;
                    await sock.sendMessage(groupId, { 
                        text: formatMessage(`⏱️ Time's up! The correct answer was: ${quiz.decodeHtml(quiz.correctAnswer)}`) 
                    });
                    delete activeQuizzes[groupId];
                }
            }, 30000);
            
        } catch (error) {
            await sock.sendMessage(groupId, { 
                text: formatMessage(`❌ An error occurred: ${error.message || 'Failed to start quiz'}`) 
            });
        }
    }
};