const startBtn = document.getElementById('start-btn');
const intro = document.getElementById('intro');
const gameContent = document.getElementById('game-content');
const itemsPool = document.getElementById('items-pool');
const backpack = document.getElementById('backpack-items');

const checkBtn = document.getElementById('check-btn');
const nextLevelBtn = document.getElementById('next-level-btn');
const levelTitle = document.getElementById('level-title');
const capacitySpan = document.getElementById('capacity');
const resultMessage = document.getElementById('result-message');

const ITEM_TEMPLATES = [
    { name: "Золотой самородок", icon: "✨" },
    { name: "Древний свиток", icon: "📜" },
    { name: "Хрустальный шар", icon: "🔮" },
    { name: "Меч богомола", icon: "️⚔️" },
    { name: "Кобальтовый щит", icon: "🛡️" },
    { name: "Эликсир жизни", icon: "🧪" },
    { name: "Карта сокровищ", icon: "🗺️" },
    { name: "Драконье яйцо", icon: "🥚" },
    { name: "Перо пегаса", icon: "🪶" },
    { name: "Сердце моря", icon: "💙" },
    { name: "Грозовой молот", icon: "🔨" },
    { name: "Драконья чешуя", icon: "🐉" },
    { name: "Золотая корона", icon: "👑" },
    { name: "Древняя ваза", icon: "🏺" },
    { name: "Амулет удачи", icon: "🍀" }
	
];

const LEVEL_CONFIG = [
    { capacity: 10, numItems: 4 },
    { capacity: 15, numItems: 7 },
    { capacity: 20, numItems: 10 } 
];

let currentLevel = 1;
let backpackCapacity;

function generateItems(numItems) {
    itemsPool.innerHTML = '';
	backpack.innerHTML = '';
	
	const shuffledTemplates = ITEM_TEMPLATES.sort(() => 0.5 - Math.random());
	const levelItems = shuffledTemplates.slice(0, numItems);
	
    levelItems.forEach((template, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
		itemElement.id = 'item-' + index;
        itemElement.draggable = true; 
		
        const randomWeight = Math.floor((Math.random() * (backpackCapacity / 2) + 1));
        const randomValue = Math.floor(Math.random() * 451) + 50;

        itemElement.innerHTML = `
            <div class="item-icon">${template.icon}</div>
            <div class="item-details">
                <strong>${template.name}</strong><br>
                Вес: ${randomWeight} кг<br>
                Стоимость: ${randomValue} 💲
            </div>
        `;
        
        itemsPool.appendChild(itemElement);
    });
	setupDragAndDrop();
}

function setupDragAndDrop() {
    const items = document.querySelectorAll('.item');

    items.forEach(item => {
        item.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', event.target.id);
        });
    });

    const dropzones = [itemsPool, backpack];

    dropzones.forEach(zone => {
        zone.addEventListener('dragover', (event) => {
            event.preventDefault();
        });

        zone.addEventListener('drop', (event) => {
            event.preventDefault();
            
            const id = event.dataTransfer.getData('text/plain');
            const draggableElement = document.getElementById(id);

            const dropzone = event.target.closest('.dropzone');
            if (dropzone) {
                dropzone.appendChild(draggableElement);
            }
        });
    });
}

function startLevel() {
    resultMessage.classList.add('hidden');
    nextLevelBtn.classList.add('hidden');
    checkBtn.classList.remove('hidden');

    const config = LEVEL_CONFIG[currentLevel - 1];
    backpackCapacity = config.capacity;

    levelTitle.textContent = `Уровень ${currentLevel}`;
    capacitySpan.textContent = backpackCapacity;

    generateItems(config.numItems);
}

function showVictoryScreen() {
    gameContent.classList.add('hidden');
    checkBtn.classList.add('hidden');
    resultMessage.textContent = "Поздравляю! Вы прошли все уровни!";
    resultMessage.classList.remove('hidden');
    startBtn.textContent = 'Начать заново';
    startBtn.classList.remove('hidden');
}


startBtn.addEventListener('click', () => {
    intro.classList.add('hidden');
    startBtn.classList.add('hidden');
    gameContent.classList.remove('hidden');

    currentLevel = 1;
    startLevel();
});

checkBtn.addEventListener('click', () => {
    checkBtn.classList.add('hidden');

    if (currentLevel < LEVEL_CONFIG.length) {
        resultMessage.textContent = "Отлично! Готов к следующему испытанию?";
        resultMessage.classList.remove('hidden');
        nextLevelBtn.classList.remove('hidden');
    } else {
        showVictoryScreen();
    }
});

nextLevelBtn.addEventListener('click', () => {
    currentLevel++;
    startLevel();
});