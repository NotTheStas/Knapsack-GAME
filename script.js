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
const gameContainer = document.getElementById('game-container');

const showTableBtn = document.getElementById('show-table-btn');
const dpVisualization = document.getElementById('dp-visualization');
const dpTableContainer = document.getElementById('dp-table-container');
const prevStepBtn = document.getElementById('prev-step-btn');
const nextStepBtn = document.getElementById('next-step-btn');
const stepInfo = document.getElementById('step-info');
const dpExplanation = document.getElementById('dp-explanation');

const ITEM_TEMPLATES = [
    { name: "Золотой самородок", icon: "✨" }, { name: "Древний свиток", icon: "📜" }, { name: "Хрустальный шар", icon: "🔮" }, { name: "Меч богомола", icon: "️⚔️" }, { name: "Кобальтовый щит", icon: "🛡️" }, { name: "Эликсир жизни", icon: "🧪" }, { name: "Карта сокровищ", icon: "🗺️" }, { name: "Драконье яйцо", icon: "🥚" }, { name: "Перо Феникса", icon: "🐦‍🔥" }, { name: "Сердце моря", icon: "💙" }, { name: "Грозовой молот", icon: "🔨" }, { name: "Драконья чешуя", icon: "🐉" }, { name: "Золотая корона", icon: "👑" }, { name: "Древняя ваза", icon: "🏺" }, { name: "Лук Артемиды", icon: "🏹" }, { name: "Роза ветров", icon: "🌹" }, { name: "Маска тайн", icon: "🎭" }, { name: "Жезл природы", icon: "🌿" }, { name: "Кинжал тени", icon: "🗡️" }, { name: "Слеза небес", icon: "💧" }, { name: "Древний плод", icon: "🌱" }, { name: "Упавшая звезда", icon: "⭐" }, { name: "Раковина Наутилуса", icon: "🐚" }, { name: "Лунный камень", icon: "🌑" }, { name: "Хрустальные крылья", icon: "🦋" }, { name: "Серебряное кольцо", icon: "💍" }, { name: "Каменный идол", icon: "🗿" }, { name: "Амулет удачи", icon: "🍀" }, { name: "Всевидящее око", icon: "👁️" }, { name: "Морской требузец", icon: "🔱" }, { name: "Рог единорога", icon: "🦄" }
];

const LEVEL_CONFIG = [
    { capacity: 10, numItems: 4 }, { capacity: 15, numItems: 5 }, { capacity: 15, numItems: 6 }, { capacity: 20, numItems: 7 }, { capacity: 55, numItems: 8 },
];

let currentLevel = 1;
let backpackCapacity;
let optimalValue = 0;
let moving = null;

let visualizationSteps = [];
let currentStepIndex = -1;
let levelItemsForTable = [];

function createItemDataForLevel(numItems) {
    levelItemsForTable = [];

    const shuffledTemplates = ITEM_TEMPLATES.sort(() => 0.5 - Math.random());
    const levelItems = shuffledTemplates.slice(0, numItems);

    levelItems.forEach(template => {
        const randomWeight = Math.floor((Math.random() * (backpackCapacity / 2) + 1));
        const randomValue = Math.floor(Math.random() * 451) + 50;
        levelItemsForTable.push({ ...template, weight: randomWeight, value: randomValue });
    });
}

function renderItemsFromData() {
    itemsPool.innerHTML = '';
    backpack.innerHTML = '';

    levelItemsForTable.forEach((itemData, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        itemElement.id = 'item-' + index;
        itemElement.draggable = true;

        itemElement.innerHTML = `
            <div class="item-icon">${itemData.icon}</div>
            <div class="item-details">
                <strong>${itemData.name}</strong><br>
                Вес: ${itemData.weight} кг<br>
                Стоимость: ${itemData.value} 💲
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
        if (weightMatch) totalWeight += parseInt(weightMatch[1], 10);
        if (valueMatch) totalValue += parseInt(valueMatch[1], 10);
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
        item.addEventListener('touchstart', (event) => { moving = item; });
    });

    const dropzones = [itemsPool, backpack];
    dropzones.forEach(zone => {
        zone.addEventListener('dragover', (event) => { event.preventDefault(); });
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
    showTableBtn.classList.remove('hidden');
    hideDPTable();

    const config = LEVEL_CONFIG[currentLevel - 1];
    backpackCapacity = config.capacity;
    levelTitle.textContent = `Уровень ${currentLevel}`;
    capacitySpan.textContent = backpackCapacity;

    createItemDataForLevel(config.numItems);
    solveKnapsack();
    renderItemsFromData();
    updateStats();
}

function retryLevel() {
    resultMessage.classList.add('hidden');
    checkBtn.classList.remove('hidden');
    showTableBtn.classList.remove('hidden');
    hideDPTable();
    
    renderItemsFromData(); 
    updateStats();
}


function solveKnapsack() {
    const items = levelItemsForTable;
    const n = items.length;
    const W = backpackCapacity;
    const dp = Array(n + 1).fill(0).map(() => Array(W + 1).fill(0));

    visualizationSteps = [];

    for (let i = 1; i <= n; i++) {
        const currentItem = items[i - 1];
        for (let w = 1; w <= W; w++) {
            const step = { i, w, item: currentItem, cellsToCompare: [] };
            
            if (currentItem.weight > w) {
                dp[i][w] = dp[i - 1][w];
                step.decision = 'skip_heavy';
                step.value = dp[i][w];
                step.cellsToCompare.push({ r: i - 1, c: w });
                step.explanation = `Предмет "${currentItem.name}" (вес ${currentItem.weight}) тяжелее текущей вместимости рюкзака (${w}). Берем значение из ячейки выше: ${dp[i-1][w]} 💲.`;

            } else {
                const valueWithout = dp[i - 1][w];
                const valueWith = currentItem.value + dp[i - 1][w - currentItem.weight];

                step.cellsToCompare.push({ r: i - 1, c: w });
                step.cellsToCompare.push({ r: i - 1, c: w - currentItem.weight });

                if (valueWith > valueWithout) {
                    dp[i][w] = valueWith;
                    step.decision = 'take';
                    step.value = dp[i][w];
                    step.explanation = `Выгоднее взять предмет "${currentItem.name}". Сравниваем: не брать (${valueWithout} 💲) vs взять (${currentItem.value} 💲 + ${dp[i-1][w - currentItem.weight]} 💲 = ${valueWith} 💲).`;
                } else {
                    dp[i][w] = valueWithout;
                    step.decision = 'skip_better';
                    step.value = dp[i][w];
                    step.explanation = `Выгоднее НЕ брать предмет "${currentItem.name}". Сравниваем: не брать (${valueWithout} 💲) vs взять (${currentItem.value} 💲 + ${dp[i-1][w - currentItem.weight]} 💲 = ${valueWith} 💲).`;
                }
            }
            visualizationSteps.push(step);
        }
    }
    optimalValue = dp[n][W];
}

function showVictoryScreen() {
    gameContent.classList.add('hidden');
    checkBtn.classList.add('hidden');
    showTableBtn.classList.add('hidden');
    hideDPTable();
    resultMessage.textContent = "Поздравляю! Вы прошли игру!";
    resultMessage.classList.remove('hidden');
    startBtn.textContent = 'Начать заново';
    startBtn.classList.remove('hidden');
}

function renderDPTable() {
    dpTableContainer.innerHTML = '';
    const table = document.createElement('table');
    table.id = 'dp-table';
    const headerRow = document.createElement('tr');
    const thItem = document.createElement('th');
    thItem.textContent = 'Предмет / Вес';
    headerRow.appendChild(thItem);
    for (let w = 0; w <= backpackCapacity; w++) {
        const th = document.createElement('th');
        th.textContent = w;
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);
    for (let i = 0; i <= levelItemsForTable.length; i++) {
        const row = document.createElement('tr');
        row.id = `dp-row-${i}`;
        const cellItem = document.createElement('td');
        if (i === 0) {
            cellItem.textContent = 'Нет предметов';
        } else {
            const item = levelItemsForTable[i-1];
            cellItem.innerHTML = `${item.icon} <strong>${item.name}</strong><br><small>Вес:${item.weight}, Ц:${item.value}</small>`;
        }
        row.appendChild(cellItem);
        for (let w = 0; w <= backpackCapacity; w++) {
            const cell = document.createElement('td');
            cell.id = `dp-cell-${i}-${w}`;
            cell.textContent = '0';
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    dpTableContainer.appendChild(table);
}


function updateVisualization(index) {
    if (index < 0 || index >= visualizationSteps.length) return;

    currentStepIndex = index;

    for (let r = 0; r <= levelItemsForTable.length; r++) {
        for (let c = 0; c <= backpackCapacity; c++) {
            const cell = document.getElementById(`dp-cell-${r}-${c}`);
            if (cell) {
                cell.textContent = '0';
                cell.className = '';
            }
        }
    }
    document.querySelectorAll('#dp-table tr td:first-child').forEach(c => c.className = '');

    for (let k = 0; k <= index; k++) {
        const step = visualizationSteps[k];
        const cell = document.getElementById(`dp-cell-${step.i}-${step.w}`);
        if (cell) {
            cell.textContent = step.value;
        }
    }

    const currentStep = visualizationSteps[index];
    const { i, w, explanation, cellsToCompare } = currentStep;

    stepInfo.textContent = `Шаг: ${index + 1} / ${visualizationSteps.length}`;
    dpExplanation.innerHTML = explanation;
    prevStepBtn.disabled = index === 0;
    nextStepBtn.disabled = index === visualizationSteps.length - 1;

    cellsToCompare.forEach(cellPos => {
        const cell = document.getElementById(`dp-cell-${cellPos.r}-${cellPos.c}`);
        if(cell) cell.classList.add('dp-compare');
    });

    const currentCell = document.getElementById(`dp-cell-${i}-${w}`);
    if(currentCell) {
        currentCell.classList.add('dp-current');
    }
    
}

function hideDPTable() {
    dpVisualization.classList.add('hidden');
    showTableBtn.textContent = 'Показать таблицу';
}

function showDPTable() {
    renderDPTable();
    dpVisualization.classList.remove('hidden');
    showTableBtn.textContent = 'Скрыть таблицу';
    updateVisualization(0);
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
    showTableBtn.classList.add('hidden');

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
            retryLevel();
        }, 5000);
    }
});

nextLevelBtn.addEventListener('click', () => {
    currentLevel++;
    startLevel();
});

showTableBtn.addEventListener('click', () => {
    if (dpVisualization.classList.contains('hidden')) {
        showDPTable();
    } else {
        hideDPTable();
    }
});

prevStepBtn.addEventListener('click', () => {
    if (currentStepIndex > 0) {
        updateVisualization(currentStepIndex - 1);
    }
});

nextStepBtn.addEventListener('click', () => {
    if (currentStepIndex < visualizationSteps.length - 1) {
        updateVisualization(currentStepIndex + 1);
    }
});

document.addEventListener("touchmove", (event) => {
    if (moving) {
        let touch = event.targetTouches[0];
        moving.style.position = "absolute";
        moving.style.left = `${touch.pageX - moving.offsetWidth / 2}px`;
        moving.style.top = `${touch.pageY - moving.offsetHeight / 2}px`;
        moving.style.zIndex = 1000;
    }
});

document.addEventListener('touchend', (event) => {
    if (moving) {
        moving.style.position = "static";
        moving.style.zIndex = 'auto';
        let elementUnderPointer = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        let dropzone = elementUnderPointer.closest('.dropzone');
        
        if (dropzone === backpack) {
            const itemDetails = moving.textContent;
            const itemWeightMatch = itemDetails.match(/Вес: (\d+)/);
            const itemWeight = itemWeightMatch ? parseInt(itemWeightMatch[1], 10) : 0;
            const currentBackpackWeight = updateStats();
            if (currentBackpackWeight + itemWeight <= backpackCapacity) {
                backpack.appendChild(moving);
            }
        } else {
            itemsPool.appendChild(moving);
        }
        updateStats();
        moving = null;
    }
});