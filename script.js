const startBtn = document.getElementById('start-btn');
const intro = document.getElementById('intro');
const gameContent = document.getElementById('game-content');
const itemsPool = document.getElementById('items-pool');
const backpack = document.getElementById('backpack-items');
const currentWeightStat = document.getElementById('current-weight');
const currentValueStat = document.getElementById('current-value');

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
    { name: "Перо Феникса", icon: "🐦‍🔥" },
    { name: "Сердце моря", icon: "💙" },
    { name: "Грозовой молот", icon: "🔨" },
    { name: "Драконья чешуя", icon: "🐉" },
    { name: "Золотая корона", icon: "👑" },
    { name: "Древняя ваза", icon: "🏺" },
	{ name: "Лук Артемиды", icon: "🏹" },
	{ name: "Роза ветров", icon: "🌹" },
	{ name: "Маска тайн", icon: "🎭" },
	{ name: "Жезл природы", icon: "🌿" },
	{ name: "Кинжал тени", icon: "🗡️" },
	{ name: "Слеза небес", icon: "💧" },
	{ name: "Древний плод", icon: "🌱" },
	{ name: "Упавшая звезда", icon: "⭐" },
	{ name: "Раковина Наутилуса", icon: "🐚" },
	{ name: "Лунный камень", icon: "🌑" },
	{ name: "Хрустальные крылья", icon: "🦋" },
	{ name: "Серебряное кольцо", icon: "💍" },
	{ name: "Каменный идол", icon: "🗿" },
    { name: "Амулет удачи", icon: "🍀" },
	{ name: "Всевидящее око", icon: "👁️" },
	{ name: "Морской требузец", icon: "🔱" },
    { name: "Рог единорога", icon: "🦄" }
	
];

const LEVEL_CONFIG = [
    { capacity: 10, numItems: 4 },
	{ capacity: 15, numItems: 5 },
    { capacity: 15, numItems: 6 },
	{ capacity: 20, numItems: 7 },
	{ capacity: 55, numItems: 8 },
];

let currentLevel = 1;
let backpackCapacity;
let optimalValue = 0;
let moving = null;

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

function updateStats() {
	let totalWeight = 0;
	let totalValue = 0;
    const itemsInBackpack = backpack.querySelectorAll('.item');

    itemsInBackpack.forEach(item => {
        const detailsText = item.querySelector('.item-details').textContent;
        
        const weightMatch = detailsText.match(/Вес: (\d+)/); 
        const valueMatch = detailsText.match(/Стоимость: (\d+)/);

        if (weightMatch) {
            totalWeight += parseInt(weightMatch[1], 10);
        }
        if (valueMatch) {
            totalValue += parseInt(valueMatch[1], 10);
        }
    });

    currentWeightStat.textContent = totalWeight;
    currentValueStat.textContent = totalValue;
	return totalWeight; 
}



function setupDragAndDrop() {
    const items = document.querySelectorAll('.item');

    items.forEach(item => {
        item.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', event.target.id);
        });

        item.addEventListener('touchstart', (event) => {
            moving = item;
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
            if (dropzone === backpack) {
                const itemDetails = draggableElement.querySelector('.item-details').textContent;
                const itemWeightMatch = itemDetails.match(/Вес: (\d+)/);
                const itemWeight = itemWeightMatch ? parseInt(itemWeightMatch[1], 10) : 0;

                const currentBackpackWeight = updateStats();
                
                if (currentBackpackWeight + itemWeight <= backpackCapacity) {
                    dropzone.appendChild(draggableElement);
                }
            } else {
                dropzone.appendChild(draggableElement);
            }

            updateStats();
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
	updateStats();
	solveKnapsack();
}

function solveKnapsack() {
    const availableItems = [];
    itemsPool.querySelectorAll('.item').forEach(item => {
        const detailsText = item.querySelector('.item-details').textContent;
        const weightMatch = detailsText.match(/Вес: (\d+)/);
        const valueMatch = detailsText.match(/Стоимость: (\d+)/);

        if (weightMatch && valueMatch) {
            availableItems.push({
                weight: parseInt(weightMatch[1], 10),
                value: parseInt(valueMatch[1], 10)
            });
        }
    });

    const n = availableItems.length;
    const W = backpackCapacity;

    const dp = Array(n + 1).fill(0).map(() => Array(W + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        const currentItem = availableItems[i - 1];
        for (let w = 1; w <= W; w++) {
            if (currentItem.weight > w) {
                dp[i][w] = dp[i - 1][w];
            } else {

                dp[i][w] = Math.max(
                    dp[i - 1][w],
                    currentItem.value + dp[i - 1][w - currentItem.weight]
                );
            }
        }
    }

    const maxVal = dp[n][W];
    optimalValue = maxVal;
}

function showVictoryScreen() {
    gameContent.classList.add('hidden');
    checkBtn.classList.add('hidden');
    resultMessage.textContent = "Поздравляю! Вы прошли игру!";
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
    const playerValue = parseInt(currentValueStat.textContent, 10);

    checkBtn.classList.add('hidden');
    
    if (playerValue === optimalValue) {
        
        if (currentLevel < LEVEL_CONFIG.length) {
            resultMessage.textContent = `Отлично! Максимальная выгода ${optimalValue} 💲 достигнута!`;
            resultMessage.classList.remove('hidden');
            nextLevelBtn.classList.remove('hidden');
        } else {
            showVictoryScreen();
        }
    } else {

        resultMessage.textContent = `Не оптимальный результат! Ты набрал ${playerValue} 💲, а мог бы ${optimalValue} 💲. Попробуй еще раз!`;
        resultMessage.classList.remove('hidden');

        setTimeout(() => {
            startLevel(); 
        }, 5000);
    }
});

nextLevelBtn.addEventListener('click', () => {
    currentLevel++;
    startLevel();
});

document.addEventListener("touchmove", (event) => {
    if (moving) {
        event.preventDefault();
        event.stopPropagation();
        let touch = event.targetTouches[0];
        moving.style.position = "absolute";
        moving.style.left = `${touch.pageX}px`;
        moving.style.top = `${touch.pageY}px`;
    }
})

document.addEventListener('touchend', (event) => {
    if (moving) {
        moving.style.position = "static";
        let touch = event.changedTouches[0];
        let coordBackpack = backpack.getBoundingClientRect().left;

        if (coordBackpack < touch.pageX) {
            const itemDetails = moving.textContent;
            const itemWeightMatch = itemDetails.match(/Вес: (\d+)/);
            const itemWeight = itemWeightMatch ? parseInt(itemWeightMatch[1], 10) : 0;

            const currentBackpackWeight = updateStats();

            if (currentBackpackWeight + itemWeight <= backpackCapacity) {
                backpack.appendChild(moving);
            }
        }
        
        else {
            itemsPool.appendChild(moving);
        }
        updateStats();
        moving = null;
    }
});