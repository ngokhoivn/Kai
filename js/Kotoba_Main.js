document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const kanjiDisplay = document.getElementById('kanjiDisplay');
    const kanjiText = document.getElementById('kanjiText');
    const answerInput = document.getElementById('answerInput');
    const checkAnswerBtn = document.getElementById('checkAnswer');
    const skipWordBtn = document.getElementById('skipWord');
    const resultDisplay = document.getElementById('result');
    const meaningDisplay = document.getElementById('meaning');
    const progressText = document.getElementById('progressText');
    const cycleText = document.getElementById('cycleText');
    const progressBarFill = document.querySelector('.progress-bar-fill');
    const restartLearningBtn = document.getElementById('restartLearning');
    const speakBtn = document.getElementById('speakBtn');
    const groupSelectorContainer = document.getElementById('groupSelectorContainer');
    const groupButtons = document.getElementById('groupButtons');
    const startGroupLearningBtn = document.getElementById('startGroupLearningBtn');
    const learningContainer = document.getElementById('learningContainer');

    // State Variables
    let vocabulary = []; // The current set of words being learned
    let allVocabulary = []; // All words for the selected lesson
    let wordGroups = []; // All words divided into groups
    let currentIndex = 0;
    let wrongWords = [];
    let currentCycle = 1;
    const totalCycles = 1;
    let isChecking = false;

    const WORDS_PER_GROUP = 5;

    // --- Initialization and Setup ---

    function getLessonFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('lesson');
    }

    function initialize() {
        const lesson = getLessonFromURL();
        if (!lesson) {
            alert('Không có bài học nào được chọn!');
            window.location.href = 'index.html';
            return;
        }

        const vocabData = window[lesson];
        if (typeof vocabData === 'undefined' || vocabData.length === 0) {
            alert(`Lỗi: Dữ liệu từ vựng '${lesson}' không được tải hoặc rỗng.`);
            return;
        }

        // Data is now an array of objects, so we just assign it
        allVocabulary = vocabData;

        // Sort by ID to ensure the order is consistent for grouping
        allVocabulary.sort((a, b) => a.id - b.id);
        
        createWordGroups();
        createGroupSelector();
        showGroupSelector();
    }

    function createWordGroups() {
        wordGroups = [];
        for (let i = 0; i < allVocabulary.length; i += WORDS_PER_GROUP) {
            wordGroups.push(allVocabulary.slice(i, i + WORDS_PER_GROUP));
        }
    }

    function createGroupSelector() {
        groupButtons.innerHTML = '';
        wordGroups.forEach((_, index) => {
            const button = document.createElement('button');
            button.textContent = index + 1;
            button.dataset.groupIndex = index;
            button.addEventListener('click', () => {
                button.classList.toggle('selected');
            });
            groupButtons.appendChild(button);
        });
    }

    // --- UI View Management ---

    function showGroupSelector() {
        groupSelectorContainer.classList.remove('hidden');
        learningContainer.classList.add('hidden');
        // Reset button selections
        document.querySelectorAll('.group-buttons button.selected').forEach(btn => {
            btn.classList.remove('selected');
        });
    }

    function showLearningContainer() {
        groupSelectorContainer.classList.add('hidden');
        learningContainer.classList.remove('hidden');
    }


    // --- Learning Logic ---

    function startLearning(selectedWords) {
        if (selectedWords.length === 0) {
            alert('Bạn phải chọn ít nhất một nhóm để học.');
            return;
        }

        vocabulary = selectedWords;
        shuffleArray(vocabulary);

        currentIndex = 0;
        currentCycle = 1;
        wrongWords = [];
        isChecking = false;

        showLearningContainer();
        updateProgressUI();
        showCurrentWord();
        answerInput.value = '';
        resultDisplay.classList.add('hidden');
        meaningDisplay.textContent = '';
        answerInput.focus();
    }

    function checkAnswer() {
        if (isChecking || currentIndex >= vocabulary.length) return;

        isChecking = true;
        const currentWord = vocabulary[currentIndex];
        const userAnswer = answerInput.value.trim();

        const normalizedUserAnswer = userAnswer.toLowerCase().replace(/\s+/g, '');
        const normalizedCorrect = currentWord.hiragana.toLowerCase().replace(/\s+/g, '');

        if (normalizedUserAnswer === normalizedCorrect) {
            resultDisplay.textContent = "✓ Chính xác!";
            resultDisplay.className = "result correct";
            if (currentWord.meaning) {
                meaningDisplay.textContent = currentWord.meaning;
            }
            speak(currentWord.hiragana);
            setTimeout(() => {
                moveToNextWord();
                isChecking = false;
            }, 800);
        } else {
            resultDisplay.textContent = `✗ Sai rồi! Đáp án đúng là: ${currentWord.hiragana}`;
            resultDisplay.className = "result incorrect";
            if (!wrongWords.some(word => word.kanji === currentWord.kanji)) {
                wrongWords.push(currentWord);
            }
            if (currentWord.meaning) {
                meaningDisplay.textContent = currentWord.meaning;
            }
            answerInput.value = '';
            answerInput.focus();
            isChecking = false;
        }
        resultDisplay.classList.remove('hidden');
    }

    function moveToNextWord() {
        currentIndex++;
        if (currentIndex >= vocabulary.length) {
            finishLearning();
            return;
        }
        resultDisplay.classList.add('hidden');
        meaningDisplay.textContent = '';
        answerInput.value = '';
        updateProgressUI();
        showCurrentWord();
        answerInput.focus();
    }

    function showCurrentWord() {
        if (currentIndex < vocabulary.length) {
            kanjiText.textContent = vocabulary[currentIndex].kanji;
        } else {
            kanjiText.textContent = '';
        }
    }

    function updateProgressUI() {
        const total = vocabulary.length;
        const percentage = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;
        progressText.textContent = `${currentIndex + 1}/${total}`;
        cycleText.textContent = `Chu kỳ: ${currentCycle}/${totalCycles}`;
        progressBarFill.style.width = `${percentage}%`;
    }

    function finishLearning() {
        let message = 'Chúc mừng! Bạn đã hoàn thành các nhóm từ này.';
        if (wrongWords.length > 0) {
            message += '\n\nCác từ bạn đã sai:\n' + wrongWords.map(word => `${word.kanji} (${word.hiragana})`).join('\n');
        }
        alert(message);
        showGroupSelector(); // Go back to group selection
    }

    function skipWord() {
        if (isChecking) return;
        const currentWord = vocabulary[currentIndex];
        if (!wrongWords.some(word => word.kanji === currentWord.kanji)) {
            wrongWords.push(currentWord);
        }
        moveToNextWord();
    }

    // --- Utility Functions ---

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function speak(text, lang = 'ja-JP') {
        if (!('speechSynthesis' in window)) {
            console.warn('Trình duyệt của bạn không hỗ trợ phát âm.');
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;
        const voices = window.speechSynthesis.getVoices();
        const japaneseVoice = voices.find(voice => voice.lang.includes('ja'));
        if (japaneseVoice) {
            utterance.voice = japaneseVoice;
        }
        window.speechSynthesis.speak(utterance);
    }

    // --- Event Listeners ---

    startGroupLearningBtn.addEventListener('click', () => {
        const selectedGroups = document.querySelectorAll('.group-buttons button.selected');
        let selectedWords = [];
        selectedGroups.forEach(button => {
            const groupIndex = parseInt(button.dataset.groupIndex, 10);
            selectedWords.push(...wordGroups[groupIndex]);
        });

        startLearning(selectedWords);
    });

    checkAnswerBtn.addEventListener('click', checkAnswer);
    skipWordBtn.addEventListener('click', skipWord);
    
    restartLearningBtn.addEventListener('click', () => {
        // This button now takes the user back to the group selection screen
        showGroupSelector();
    });

    answerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            checkAnswer();
        }
    });

    speakBtn.addEventListener('click', () => {
        if (vocabulary[currentIndex]) {
            speak(vocabulary[currentIndex].hiragana);
        }
    });

    // --- Initial Load ---
    initialize();
});