const startBtn = document.getElementById('start-btn');
const intro = document.getElementById('intro');
const gameContent = document.getElementById('game-content');

startBtn.addEventListener('click', () => {
    intro.classList.add('hidden');
    startBtn.classList.add('hidden');
    gameContent.classList.remove('hidden');
});