document.addEventListener('DOMContentLoaded', () => {
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

    let vocabulary = [];
    let currentIndex = 0;
    let wrongWords = [];
    let currentCycle = 1;
    const totalCycles = 1; // Hardcoded for simplicity
    let isChecking = false;
    let currentVocabSet = '';

    function getLessonFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('lesson');
    }

    // Function to start learning
    function startLearning(vocabSet) {
        currentVocabSet = vocabSet;
        const vocabData = window[vocabSet];

        if (typeof vocabData === 'undefined') {
            alert(`Lỗi: Dữ liệu từ vựng '${vocabSet}' không được tải.`);
            return;
        }

        vocabulary = vocabData.map(line => {
            const parts = line.split('=');
            return {
                kanji: parts[0].trim(),
                hiragana: parts[1].trim(),
                meaning: parts.length > 2 ? parts[2].trim() : ''
            };
        });

        if (vocabulary.length === 0) {
            alert('Không có từ vựng nào được tìm thấy!');
            return;
        }

        // Shuffle vocabulary
        shuffleArray(vocabulary);

        currentIndex = 0;
        currentCycle = 1;
        wrongWords = [];
        isChecking = false;

        updateProgressUI();
        showCurrentWord();
        answerInput.focus();
    }

    // Function to check answer
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
            speak(currentWord.hiragana); // Speak the word
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

    // Function to move to the next word
    function moveToNextWord() {
        currentIndex++;
        if (currentIndex >= vocabulary.length) {
            currentIndex = 0;
            currentCycle++;
            if (currentCycle > totalCycles) {
                finishLearning();
                return;
            }
        }
        resultDisplay.classList.add('hidden');
        meaningDisplay.textContent = '';
        answerInput.value = '';
        updateProgressUI();
        showCurrentWord();
        answerInput.focus();
    }

    // Function to show the current word
    function showCurrentWord() {
        if (currentIndex < vocabulary.length) {
            kanjiText.textContent = vocabulary[currentIndex].kanji;
        } else {
            kanjiText.textContent = '';
        }
    }

    // Function to update progress UI
    function updateProgressUI() {
        const total = vocabulary.length;
        const percentage = total > 0 ? (currentIndex / total) * 100 : 0;
        progressText.textContent = `${currentIndex + 1}/${total}`;
        cycleText.textContent = `Chu kỳ: ${currentCycle}/${totalCycles}`;
        progressBarFill.style.width = `${percentage}%`;
    }

    // Function to finish learning
    function finishLearning() {
        let message = 'Chúc mừng! Bạn đã hoàn thành bài học.';
        if (wrongWords.length > 0) {
            message += '\n\nCác từ bạn đã sai:\n' + wrongWords.map(word => `${word.kanji} (${word.hiragana})`).join('\n');
        }
        alert(message);
        // Redirect back to home page after finishing
        window.location.href = 'index.html';
    }

    // Function to skip a word
    function skipWord() {
        if (isChecking) return;
        const currentWord = vocabulary[currentIndex];
        if (!wrongWords.some(word => word.kanji === currentWord.kanji)) {
            wrongWords.push(currentWord);
        }
        moveToNextWord();
    }

    // Function to shuffle an array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Function to speak text
    function speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Trình duyệt của bạn không hỗ trợ phát âm.');
        }
    }

    // Initial load
    const lesson = getLessonFromURL();
    if (lesson) {
        startLearning(lesson);
    } else {
        alert('Không có bài học nào được chọn!');
        window.location.href = 'index.html';
    }

    // Event Listeners
    checkAnswerBtn.addEventListener('click', checkAnswer);
    skipWordBtn.addEventListener('click', skipWord);
    restartLearningBtn.addEventListener('click', () => {
        if (currentVocabSet) {
            startLearning(currentVocabSet);
        }
    });
    answerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            checkAnswer();
        }
    });

    speakBtn.addEventListener('click', () => {
        const currentWord = vocabulary[currentIndex];
        if (currentWord) {
            speak(currentWord.hiragana);
        }
    });
});
