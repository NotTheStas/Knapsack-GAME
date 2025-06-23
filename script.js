const startBtn = document.getElementById('start-btn');
const intro = document.getElementById('intro');
const gameContent = document.getElementById('game-content');
const itemsPool = document.getElementById('items-pool');
const backpack = document.getElementById('backpack');

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

let backpackCapacity = 15;


function generateItems() {
    const existingItems = itemsPool.querySelectorAll('.item');
    existingItems.forEach(item => item.remove());
	
    ITEM_TEMPLATES.forEach((template, index) => {
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

startBtn.addEventListener('click', () => {
    intro.classList.add('hidden');
    startBtn.classList.add('hidden');
    gameContent.classList.remove('hidden');
    
    generateItems();
});