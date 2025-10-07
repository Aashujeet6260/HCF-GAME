'use strict';

// ------------------------------------
// State and element references
// ------------------------------------
let number1, number2, correctAnswer;

const num1Text = document.getElementById('num1-text');
const num2Text = document.getElementById('num2-text');
const userAnswerInput = document.getElementById('user-answer');
const checkBtn = document.getElementById('check-btn');
const nextBtn = document.getElementById('next-btn');
const feedbackContainer = document.getElementById('feedback-container');
const nextQuestionContainer = document.getElementById('next-question-container');
const showExplanationBtn = document.getElementById('show-explanation-btn');
const explanationContainer = document.getElementById('explanation-container');

// Animal emojis for variety
const animals = ['🐒', '🦁', '🐘', '🦓', '🦒', '🐅', '🦜', '🐍'];

// Tunables
const MIN_A = 5; // inclusive
const MAX_A = 24; // inclusive (5..24 yields ~20 values)
const MIN_B = 5; // inclusive
const MAX_B = 34; // inclusive (5..34 yields ~30 values)
const EXPLANATION_STEP_DELAY_MS = 1800;

// ------------------------------------
// Utilities
// ------------------------------------
function randomInt(minInclusive, maxInclusive) {
    return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

// Euclidean algorithm for GCD
function computeGreatestCommonDivisor(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y !== 0) {
        const temp = y;
        y = x % y;
        x = temp;
    }
    return x;
}

// Returns all positive factors in ascending order
function listFactorsAscending(num) {
    const upper = Math.floor(Math.sqrt(num));
    const small = [];
    const large = [];
    for (let i = 1; i <= upper; i++) {
        if (num % i === 0) {
            small.push(i);
            const pair = num / i;
            if (pair !== i) large.push(pair);
        }
    }
    large.reverse();
    return small.concat(large);
}

// ------------------------------------
// Game flow
// ------------------------------------
function generateQuestion() {
    // Choose two numbers and ensure they are not identical
    number1 = randomInt(MIN_A, MAX_A);
    number2 = randomInt(MIN_B, MAX_B);
    while (number2 === number1) {
        number2 = randomInt(MIN_B, MAX_B);
    }

    // Pick two distinct animals
    const animal1 = animals[Math.floor(Math.random() * animals.length)];
    let animal2 = animals[Math.floor(Math.random() * animals.length)];
    while (animal1 === animal2) {
        animal2 = animals[Math.floor(Math.random() * animals.length)];
    }

    // Update the problem statement
    num1Text.innerHTML = `${number1} ${animal1}`;
    num2Text.innerHTML = `${number2} ${animal2}`;

    // Compute the correct answer
    correctAnswer = computeGreatestCommonDivisor(number1, number2);

    // Reset UI
    resetUI();
}

function resetUI() {
    userAnswerInput.value = '';
    userAnswerInput.disabled = false;
    checkBtn.disabled = false;
    checkBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    feedbackContainer.innerHTML = '';
    nextQuestionContainer.classList.add('hidden');
    explanationContainer.classList.add('hidden');
    explanationContainer.innerHTML = '';
    showExplanationBtn.disabled = false;
    userAnswerInput.focus();
}

// ------------------------------------
// Event handlers
// ------------------------------------
function handleCheckAnswer() {
    const userAnswer = parseInt(String(userAnswerInput.value).trim(), 10);

    if (Number.isNaN(userAnswer) || userAnswer < 1) {
        showFeedback('Please enter a positive number.', 'bg-gray-200', 'text-gray-700', 'border-gray-400');
        return;
    }

    if (userAnswer === correctAnswer) {
        const animal1Emoji = (num1Text.innerText.split(' ')[1]) || '🐒';
        const animal2Emoji = (num2Text.innerText.split(' ')[1]) || '🦁';
        const successMessage = `Correct! 🎉 You can form <strong>${correctAnswer}</strong> groups.
            <br><span class="text-sm">Each group will have ${number1 / correctAnswer} ${animal1Emoji} and ${number2 / correctAnswer} ${animal2Emoji}.</span>`;
        showFeedback(successMessage, 'bg-green-100', 'text-green-800', 'border-green-500', 'feedback-correct');
        userAnswerInput.disabled = true;
        checkBtn.disabled = true;
        checkBtn.classList.add('opacity-50', 'cursor-not-allowed');
        nextQuestionContainer.classList.remove('hidden');
        // Move focus to next action for keyboard users
        document.getElementById('show-explanation-btn').focus();
    } else {
        const factors1 = listFactorsAscending(number1);
        const factors2 = listFactorsAscending(number2);
        const hintHtml = `
            <p class="font-semibold text-lg">Not quite! Let's look at the factors:</p>
            <p class="mt-2 text-sm md:text-base">Factors of ${number1}: <span class="font-mono text-blue-600">${factors1.join(', ')}</span></p>
            <p class="mt-1 text-sm md:text-base">Factors of ${number2}: <span class="font-mono text-red-600">${factors2.join(', ')}</span></p>
            <p class="mt-3 font-semibold">Try to find the biggest number that's in both lists!</p>`;
        showFeedback(hintHtml, 'bg-red-100', 'text-red-800', 'border-red-500', 'feedback-incorrect');
    }
}

function showFeedback(message, bgColor, textColor, borderColor, animationClass = '') {
    feedbackContainer.innerHTML = `<div class="${animationClass} p-4 rounded-lg border-l-4 ${bgColor} ${textColor} ${borderColor}">${message}</div>`;
}

function showExplanation() {
    showExplanationBtn.disabled = true;
    explanationContainer.classList.remove('hidden');
    explanationContainer.innerHTML = '';

    const factors1 = listFactorsAscending(number1);
    const factors2 = listFactorsAscending(number2);
    const commonFactors = factors1.filter(f => factors2.includes(f));

    let delay = 0;

    // Step 1: Show factors of the first number
    setTimeout(() => {
        const step1 = document.createElement('div');
        step1.className = 'explanation-step p-4 bg-blue-50 rounded-lg mb-3';
        step1.innerHTML = `<h3 class="font-bold text-blue-800">Factors of ${number1}</h3><div class="mt-2 flex flex-wrap justify-center">${factors1.map(f => `<span class="factor-badge bg-blue-200 text-blue-800" data-factor="${f}">${f}</span>`).join('')}</div>`;
        explanationContainer.appendChild(step1);
    }, delay);

    delay += EXPLANATION_STEP_DELAY_MS;

    // Step 2: Show factors of the second number
    setTimeout(() => {
        const step2 = document.createElement('div');
        step2.className = 'explanation-step p-4 bg-red-50 rounded-lg mb-3';
        step2.innerHTML = `<h3 class="font-bold text-red-800">Factors of ${number2}</h3><div class="mt-2 flex flex-wrap justify-center">${factors2.map(f => `<span class="factor-badge bg-red-200 text-red-800" data-factor="${f}">${f}</span>`).join('')}</div>`;
        explanationContainer.appendChild(step2);
    }, delay);

    delay += EXPLANATION_STEP_DELAY_MS;

    // Step 3: Highlight common factors
    setTimeout(() => {
        const step3 = document.createElement('div');
        step3.className = 'explanation-step p-4 bg-yellow-50 rounded-lg mb-3';
        step3.innerHTML = `<h3 class="font-bold text-yellow-800">Common Factors</h3><p>These are the numbers that appear in BOTH lists.</p>`;
        explanationContainer.appendChild(step3);
        commonFactors.forEach(cf => {
            document.querySelectorAll(`[data-factor="${cf}"]`).forEach(el => el.classList.add('common-factor-highlight'));
        });
    }, delay);

    delay += EXPLANATION_STEP_DELAY_MS;

    // Step 4: Highlight the HCF
    setTimeout(() => {
        const step4 = document.createElement('div');
        step4.className = 'explanation-step p-4 bg-green-50 rounded-lg';
        step4.innerHTML = `<h3 class="font-bold text-green-800">Highest Common Factor (HCF)</h3><p>This is the BIGGEST of the common factors.</p>`;
        explanationContainer.appendChild(step4);
        document.querySelectorAll(`[data-factor="${correctAnswer}"]`).forEach(el => {
            el.classList.remove('common-factor-highlight');
            el.classList.add('hcf-highlight');
        });
    }, delay);
}

// ------------------------------------
// Wiring
// ------------------------------------
checkBtn.addEventListener('click', handleCheckAnswer);
nextBtn.addEventListener('click', generateQuestion);
showExplanationBtn.addEventListener('click', showExplanation);
userAnswerInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') handleCheckAnswer();
});

// Initial game setup
window.onload = generateQuestion;
