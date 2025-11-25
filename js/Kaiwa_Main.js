function getCharacterIndexFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const characterIndex = urlParams.get('character');
    return characterIndex ? parseInt(characterIndex, 10) : 0;
}

// Game state
const synth = window.speechSynthesis;

function speak(text, lang = 'ja-JP') {
    if (!synth) {
        console.warn('Trình duyệt không hỗ trợ Text-to-Speech');
        return;
    }

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;

    const voices = synth.getVoices();
    const japaneseVoice = voices.find(voice => voice.lang.includes('ja'));
    if (japaneseVoice) {
        utterance.voice = japaneseVoice;
    }

    synth.speak(utterance);
}

let selectedCharacter = null;
let kaiwaData = [];
let currentQuestionIndex = 0;
let score = 0;
let streak = 0;
let selectedWords = [];
let currentAnswerStructure = [];

// DOM elements
const elements = {
    characterProfile: document.getElementById('character-profile'),
    questionText: document.getElementById('question-text'),
    questionTranslation: document.getElementById('question-translation'),
    sentencePreview: document.getElementById('sentence-preview'),
    wordBlocksContainer: document.getElementById('word-blocks-container'),
    result: document.getElementById('result'),
    score: document.getElementById('score'),
    currentQuestion: document.getElementById('current-question'),
    totalQuestions: document.getElementById('total-questions'),
    streak: document.getElementById('streak'),
    nextBtn: document.getElementById('next-btn'),
    checkBtn: document.getElementById('check-btn'),
    progressFill: document.getElementById('progress-fill'),
    speakQuestionBtn: document.getElementById('speak-question-btn'),
    toggleHintsCheckbox: document.getElementById('toggle-hints-checkbox'),
    sidebar: document.getElementById('sidebar'),
    sidebarToggleBtn: document.getElementById('sidebar-toggle-btn'),
    sidebarOverlay: document.getElementById('sidebar-overlay')
};

// Initialize the game UI
function init() {
    // Luôn load danh sách nhân vật nếu có, để dùng cho dropdown chọn nhân vật
    if (typeof characters !== 'undefined') {
        loadCharacterSelection();
    }

    if (typeof questions !== 'undefined') {
        // Chế độ dùng bộ câu hỏi cố định (như Bài 1)
        kaiwaData = questions;
    } else if (typeof characters !== 'undefined' && typeof generateQuestions === 'function') {
        // Chế độ sinh câu hỏi dựa trên nhân vật (như Bài 2-5)
        const characterIndex = getCharacterIndexFromURL();
        selectedCharacter = characters[characterIndex];
        if (selectedCharacter) {
            kaiwaData = generateQuestions(selectedCharacter);
        } else {
            console.error("Character not found at index:", characterIndex);
            return;
        }
    } else {
        console.error("No questions or characters data found.");
        console.error("Available globals:", {
            hasQuestions: typeof questions !== 'undefined',
            hasCharacters: typeof characters !== 'undefined',
            hasGenerateQuestions: typeof generateQuestions === 'function'
        });
        return;
    }
    
    setupEventListeners();
    restartGame();
}

function setupEventListeners() {
    elements.nextBtn.addEventListener('click', nextQuestion);
    elements.checkBtn.addEventListener('click', checkAnswer);
    elements.speakQuestionBtn.addEventListener('click', () => {
        const questionText = elements.questionText.textContent;
        speak(questionText);
    });
    elements.toggleHintsCheckbox.addEventListener('change', () => {
        if (elements.toggleHintsCheckbox.checked) {
            elements.wordBlocksContainer.style.display = 'flex';
        } else {
            elements.wordBlocksContainer.style.display = 'none';
        }
    });

    // Sidebar toggle events
    if (elements.sidebarToggleBtn && elements.sidebar && elements.sidebarOverlay) {
        elements.sidebarToggleBtn.addEventListener('click', () => {
            elements.sidebar.classList.toggle('open');
            elements.sidebarOverlay.classList.toggle('open');
        });

        elements.sidebarOverlay.addEventListener('click', () => {
            elements.sidebar.classList.remove('open');
            elements.sidebarOverlay.classList.remove('open');
        });
    }
}

function loadQuestion() {
    const currentData = kaiwaData[currentQuestionIndex];
    
    if(selectedCharacter) {
        loadCharacterProfile(selectedCharacter);
    }
    
    elements.questionText.textContent = currentData.question;
    elements.questionTranslation.textContent = currentData.translation;
    speak(currentData.question);
    
    if (currentData.blocks) {
        loadWordBlocks(currentData.blocks, currentData.correctOrder);
        currentAnswerStructure = currentData.correctOrder || [];
    } else {
        // Fallback to multiple choice
        loadAnswerOptions(currentData.options);
    }
    
    elements.currentQuestion.textContent = currentQuestionIndex + 1;
    elements.totalQuestions.textContent = kaiwaData.length;
    elements.result.className = 'result';
    elements.result.textContent = '';
    elements.checkBtn.style.display = 'flex';
    elements.nextBtn.style.display = 'flex';
    
    updateProgressBar();
}

function loadCharacterProfile(character) {
    if (!character) {
        elements.characterProfile.innerHTML = `<div class="character-name">Character not found</div>`;
        return;
    }
    elements.characterProfile.innerHTML = `
        <div class="character-main">
            <div class="character-avatar">${character.avatar}</div>
            <div class="character-name">${character.name}</div>
        </div>
        <div class="character-info">
            <div class="character-details">
                ${Object.entries(character.details).map(([label, value]) => {
                    const isParagraph = value.length > 30 || value.includes('<br>');
                    const cleanLabel = label.replace(/\s*\(.*\)/, '');

                    if (isParagraph) {
                        return `
                            <div class="detail-item paragraph">
                                <span class="detail-label">${cleanLabel}</span>
                                <span class="detail-value">${value}</span>
                            </div>
                        `;
                    } else {
                        return `
                            <div class="detail-item">
                                <span class="detail-label">${cleanLabel}:</span>
                                <span class="detail-value">${value}</span>
                            </div>
                        `;
                    }
                }).join('')}
            </div>
        </div>
    `;
}

function loadWordBlocks(blocks, correctOrder) {
    elements.sentencePreview.innerHTML = '';
    elements.wordBlocksContainer.innerHTML = '';
    selectedWords = [];
    
    // Shuffle the blocks for the user to arrange
    const shuffledBlocks = [...blocks].sort(() => Math.random() - 0.5);
    
    shuffledBlocks.forEach((block, index) => {
        const blockElement = document.createElement('div');
        blockElement.className = 'word-block';
        blockElement.textContent = block;
        blockElement.dataset.index = index;
        blockElement.addEventListener('click', () => selectWordBlock(blockElement, block));
        elements.wordBlocksContainer.appendChild(blockElement);
    });
}



function selectWordBlock(blockElement, word) {
    speak(word);
    // If the block is already selected, remove it
    if (blockElement.classList.contains('selected')) {
        blockElement.classList.remove('selected');
        const index = selectedWords.findIndex(w => w.element === blockElement);
        if (index !== -1) {
            selectedWords.splice(index, 1);
        }
    } else {
        // Add the block to the selected words
        blockElement.classList.add('selected');
        selectedWords.push({
            element: blockElement,
            word: word
        });
    }
    
    updateSentencePreview();
}

function updateSentencePreview() {
    elements.sentencePreview.innerHTML = '';
    
    if (selectedWords.length === 0) {
        elements.sentencePreview.innerHTML = '<span class="empty-slot"></span>';
        return;
    }
    
    selectedWords.forEach(item => {
        const wordElement = document.createElement('span');
        wordElement.className = 'word-block selected';
        wordElement.textContent = item.word;
        elements.sentencePreview.appendChild(wordElement);
    });
}

function checkAnswer() {
    if (selectedWords.length === 0) {
        elements.result.className = 'result show incorrect';
        elements.result.innerHTML = `<i class="fas fa-exclamation-circle"></i> Vui lòng chọn câu trả lời!`;
        return;
    }
    
    const currentData = kaiwaData[currentQuestionIndex];
    const userAnswer = selectedWords.map(item => item.word.trim()).join(' ');
    let isCorrect = false;
    
    // Check if the answer matches the correct order
    if (currentData.correctOrder) {
        const correctAnswer = currentData.correctOrder.map(word => word.trim()).join(' ');
        
        // ===== DEBUG CODE - BẮT ĐẦU =====
        console.log('=== DEBUG CHARACTER COMPARISON ===');
        console.log('User Answer:', userAnswer);
        console.log('Correct Answer:', correctAnswer);
        console.log('Match:', userAnswer === correctAnswer);
        console.log('\n--- Character by Character ---');
        
        // So sánh từng ký tự
        const maxLength = Math.max(userAnswer.length, correctAnswer.length);
        for (let i = 0; i < maxLength; i++) {
            const userChar = userAnswer[i] || '(empty)';
            const correctChar = correctAnswer[i] || '(empty)';
            const userCode = userAnswer[i] ? userAnswer.charCodeAt(i) : 'N/A';
            const correctCode = correctAnswer[i] ? correctAnswer.charCodeAt(i) : 'N/A';
            
            console.log(`Position ${i}:`, {
                user: userChar,
                userCode: userCode,
                correct: correctChar,
                correctCode: correctCode,
                match: userChar === correctChar
            });
        }
        
        // So sánh từng block/word
        console.log('\n--- Word by Word ---');
        const userWords = selectedWords.map(item => item.word.trim());
        const correctWords = currentData.correctOrder.map(word => word.trim());
        
        correctWords.forEach((correctWord, index) => {
            const userWord = userWords[index] || '(missing)';
            console.log(`Word ${index}:`, {
                user: userWord,
                userBytes: Array.from(userWord).map(c => c.charCodeAt(0)),
                correct: correctWord,
                correctBytes: Array.from(correctWord).map(c => c.charCodeAt(0)),
                match: userWord === correctWord
            });
        });
        console.log('=== END DEBUG ===\n');
        // ===== DEBUG CODE - KẾT THÚC =====
        
        isCorrect = userAnswer === correctAnswer;
    } else {
        // Fallback for multiple choice questions
        const correctAnswerText = currentData.options[currentData.correctAnswer];
        isCorrect = userAnswer === correctAnswerText;
    }
    
    if (isCorrect) {
        handleCorrectAnswer();
    } else {
        handleIncorrectAnswer();
    }
}

function handleCorrectAnswer() {
    score += 100;
    streak++;

    const currentData = kaiwaData[currentQuestionIndex];
    const correctAnswer = currentData.correctOrder.join(' ');

    elements.result.className = 'result show correct';
    elements.result.innerHTML = `
        <i class="fas fa-check-circle"></i> Chính xác! +100 điểm
        <button class="btn-speak" id="speak-answer-btn"><i class="fas fa-volume-up"></i></button>
    `;

    document.getElementById('speak-answer-btn').addEventListener('click', () => {
        speak(correctAnswer);
    });

    // Disable further selection
    const allBlocks = elements.wordBlocksContainer.querySelectorAll('.word-block');
    allBlocks.forEach(block => {
        block.style.pointerEvents = 'none';
    });

    updateScoreBoard();

    setTimeout(() => {
        nextQuestion();
    }, 1000);
}

function handleIncorrectAnswer() {
    streak = 0;

    const currentData = kaiwaData[currentQuestionIndex];
    const correctAnswer = currentData.correctOrder.join(' ');

    elements.result.className = 'result show incorrect';
    elements.result.innerHTML = `
        <i class="fas fa-times-circle"></i> Sai rồi!<br>Đáp án đúng: <strong>${correctAnswer}</strong>
        <button class="btn-speak" id="speak-answer-btn"><i class="fas fa-volume-up"></i></button>
    `;

    document.getElementById('speak-answer-btn').addEventListener('click', () => {
        speak(correctAnswer);
    });

    // Disable further selection
    const allBlocks = elements.wordBlocksContainer.querySelectorAll('.word-block');
    allBlocks.forEach(block => {
        block.style.pointerEvents = 'none';
        if (currentData.correctOrder.includes(block.textContent)) {
            block.classList.add('correct');
        }
    });

    updateScoreBoard();
    elements.nextBtn.style.display = 'flex';
}

function nextQuestion() {
    if (currentQuestionIndex < kaiwaData.length - 1) {
        currentQuestionIndex++;
        selectedWords = [];
        currentAnswerStructure = [];
        loadQuestion();
    } else {
        showFinalScore();
    }
}

function showFinalScore() {
    elements.result.className = 'result show correct';
    elements.result.innerHTML = `
        <i class="fas fa-trophy"></i> Hoàn thành!<br>
        Điểm cuối cùng: <strong>${score}</strong><br>
        <button class="btn btn-next" onclick="restartGame()" style="margin-top: 10px;">
            <i class="fas fa-redo"></i> Chơi lại
        </button>
    `;
    elements.nextBtn.style.display = 'none';
    elements.checkBtn.style.display = 'none';
}

function restartGame() {
    currentQuestionIndex = 0;
    score = 0;
    streak = 0;
    selectedWords = [];
    currentAnswerStructure = [];
    updateScoreBoard();
    loadQuestion();
    elements.checkBtn.style.display = 'flex';
    elements.nextBtn.style.display = 'flex';
}

function updateScoreBoard() {
    elements.score.textContent = score;
    elements.streak.textContent = streak;
}

function updateProgressBar() {
    if (kaiwaData.length === 0) {
        elements.progressFill.style.width = '0%';
        return;
    }
    const progressPercentage = ((currentQuestionIndex + 1) / kaiwaData.length) * 100;
    elements.progressFill.style.width = `${progressPercentage}%`;
}

function loadCharacterSelection() {
    const characterSelection = document.getElementById('character-selection');
    if (characters && characterSelection) {
        characters.forEach((char, index) => {
            const card = document.createElement('div');
            card.className = 'character-card';
            if (index === getCharacterIndexFromURL()) {
                card.classList.add('selected');
            }
            card.innerHTML = `
                <div class="character-avatar">${char.avatar}</div>
                <div class="character-name">${char.name.replace(/\s*\(.*\)/, '')}</div>
            `;
            card.addEventListener('click', () => {
                // Giữ nguyên bài hiện tại (lesson) và chỉ thay đổi nhân vật
                const url = new URL(window.location.href);
                url.searchParams.set('character', index);
                window.location.href = url.toString();
            });
            characterSelection.appendChild(card);
        });
    }
}

// init() sẽ được gọi từ Kaiwa.html sau khi tất cả data scripts đã load xong
// Không tự động gọi ở đây để tránh race condition