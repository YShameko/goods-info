// Ініціалізація DOM-елементів
const displayBarcode = document.getElementById('displayBarcode');
const statusSection = document.getElementById('statusSection');
const notFoundSection = document.getElementById('notFoundSection');
const productDataSection = document.getElementById('productDataSection');

// Елементи для даних товару
const productName = document.getElementById('productName');
const productSku = document.getElementById('productSku');
const productColor = document.getElementById('productColor');
const productSize = document.getElementById('productSize');
const initialPrice = document.getElementById('initialPrice');
const currentPrice = document.getElementById('currentPrice');
const carouselTrack = document.getElementById('carouselTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentPhotoIndex = 0;
let photoUrls = [];

/**
 * Симуляція запиту на сервер (замість fetch('https://example.com/api/product?barcode=...')).
 * @param {string} barcode - Штрих-код для пошуку.
 * @returns {Promise<object>} - Об'єкт з даними товару або found: false.
 */
async function fetchProductData(barcode) {
    // Приклад для демонстрації "Нічого не знайдено"
    if (barcode.includes('000') || barcode.length < 5) {
        return { found: false };
    }

    // Затримка для симуляції мережевого запиту
    await new Promise(resolve => setTimeout(resolve, 800)); 

    // Фіктивні дані товару
    return {
        found: true,
        sku: 'ART-' + barcode.slice(-5),
        name: 'Елегантна демісезонна куртка "Horizon"',
        color: 'Оливковий',
        size: 'L',
        initialPrice: 2800.00,
        currentPrice: 1999.00,
        photos: [
            'https://placehold.co/800x600/38a169/ffffff?text=Фото+1+(Фасад)', // Оливковий
            'https://placehold.co/800x600/48bb78/ffffff?text=Фото+2+(Деталь+коміра)',
            'https://placehold.co/800x600/68d391/ffffff?text=Фото+3+(На+моделі)',
            'https://placehold.co/800x600/9ae6b4/ffffff?text=Фото+4+(Спина)',
        ]
    };
}

/**
 * Обробляє дані та відображає їх на сторінці.
 * @param {object} data - Дані товару.
 */
function renderProduct(data) {
    // Приховати всі секції спочатку
    notFoundSection.classList.add('hidden');
    productDataSection.classList.add('hidden');
    
    if (!data.found) {
        notFoundSection.classList.remove('hidden');
        return;
    }

    // 4б) Повна назва товару
    productName.textContent = data.name;
    
    // 4а) Артикул, колір та розмір
    productSku.textContent = data.sku;
    productColor.textContent = data.color;
    productSize.textContent = data.size;

    // 4в) Ціна початкова та діюча в грн
    initialPrice.textContent = `${data.initialPrice.toFixed(2)}`;
    currentPrice.textContent = `${data.currentPrice.toFixed(2)}`;
    
    // 4г) Карусель з фото товару
    photoUrls = data.photos;
    currentPhotoIndex = 0;
    renderCarousel();

    // Показати секцію з даними
    productDataSection.classList.remove('hidden');
}

/* Ініціалізує карусель: створює елементи та додає обробники подій. */
function renderCarousel() {
    carouselTrack.innerHTML = ''; // Очищення
    photoUrls.forEach(url => {
        const item = document.createElement('div');
        item.className = 'carousel-item';
        const img = document.createElement('img');
        img.src = url;
        img.alt = 'Фото товару';
        img.className = 'w-full h-auto object-cover rounded-lg';
        img.onerror = () => { img.src = 'https://placehold.co/800x600/cccccc/000000?text=Помилка+завантаження+фото'; };
        item.appendChild(img);
        carouselTrack.appendChild(item);
    });

    updateCarouselPosition();
    
    // Показати навігаційні кнопки, якщо фото більше одного
    if (photoUrls.length > 1) {
        prevBtn.classList.remove('hidden');
        nextBtn.classList.remove('hidden');
    } else {
        prevBtn.classList.add('hidden');
        nextBtn.classList.add('hidden');
    }
}

/* Оновлює позицію каруселі на основі currentPhotoIndex. */
function updateCarouselPosition() {
    const offset = -currentPhotoIndex * 100;
    carouselTrack.style.transform = `translateX(${offset}%)`;
}

/* Переходить до наступного фото у каруселі. */
function showNextPhoto() {
    currentPhotoIndex = (currentPhotoIndex + 1) % photoUrls.length;
    updateCarouselPosition();
}

/* Переходить до попереднього фото у каруселі. */
function showPrevPhoto() {
    currentPhotoIndex = (currentPhotoIndex - 1 + photoUrls.length) % photoUrls.length;
    updateCarouselPosition();
}

// Обробники подій для каруселі
nextBtn.addEventListener('click', showNextPhoto);
prevBtn.addEventListener('click', showPrevPhoto);


/* Головна функція для ініціалізації сторінки. */
async function initializePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const barcode = urlParams.get('barcode');

    // 2. Напис "Штрих-код товару" і ШК із параметру
    if (barcode) {
        displayBarcode.textContent = barcode;
        statusSection.textContent = 'Завантаження даних...';
        statusSection.classList.remove('hidden');
        
        // 1. Запит на сервер (симуляція)
        try {
            const productData = await fetchProductData(barcode);
            statusSection.classList.add('hidden');
            renderProduct(productData);
        } catch (error) {
            // Обробка реальної помилки мережі
            console.error('Network or API Error:', error);
            statusSection.textContent = 'Помилка з\'єднання з сервером.';
            statusSection.classList.remove('hidden');
            statusSection.classList.replace('bg-yellow-100', 'bg-red-200');
        }
    } else {
        // Якщо штрих-код відсутній у URL
        displayBarcode.textContent = 'N/A';
        statusSection.textContent = 'Штрих-код не знайдено у параметрах URL.';
        statusSection.classList.replace('bg-yellow-100', 'bg-red-200');
        statusSection.classList.remove('hidden');
    }
}

// Запуск ініціалізації при завантаженні сторінки
window.onload = initializePage;
