        const video = document.getElementById('video');
        const startButton = document.getElementById('startButton');
        const stopButton = document.getElementById('stopButton');
        const resultDiv = document.getElementById('result');
        const resultCode = document.getElementById('resultCode');
        const statusMessage = document.getElementById('statusMessage');
        const scanLine = document.getElementById('scanLine');

        let codeReader = null;
        let stream = null;

        /**
         * Ініціалізує та запускає сканер.
         */
        async function startScanning() {
            try {
                // Скидаємо попередні результати
                resultDiv.classList.add('hidden');
                resultCode.textContent = '';
                
                // 1. Запит доступу до камери
                statusMessage.textContent = 'Очікування дозволу на використання камери...';
                
                // Використовуємо 'environment' для задньої камери
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                video.srcObject = stream;
                
                // 2. Встановлення та запуск декодера
                codeReader = new ZXing.BrowserMultiFormatReader();
                
                // --- ЗМІНЕНО: Спрощення логіки запуску ---
                // Ми більше не чекаємо onloadedmetadata. 
                // Ми покладаємося на decodeFromStream, який сам відтворить відеопотік.
                
                statusMessage.textContent = 'Сканування... Наведіть камеру на штрих-код.';
                startButton.style.display = 'none';
                stopButton.style.display = 'block';
                scanLine.style.display = 'block';

                // 3. Запуск постійного декодування відеопотоку
                // decodeFromStream є більш надійним методом, коли вже є об'єкт потоку.
                codeReader.decodeFromStream(stream, video, (result, err) => {
                    if (result) {
                        // Знайдено штрих-код!
                        resultCode.textContent = result.getText();
                        resultDiv.classList.remove('hidden');
                        
                        // Зупиняємо, щоб уникнути повторного сканування
                        stopScanning(); 
                        statusMessage.textContent = 'Знайдено! Натисніть "Запустити", щоб сканувати знову.';
                    }
                    // Якщо є помилка, але результат не знайдено, сканування продовжується
                });
                // --- КІНЕЦЬ ЗМІН ---

            } catch (err) {
                // Обробка помилок (наприклад, якщо користувач відмовив у доступі)
                statusMessage.textContent = `Помилка: Не вдалося отримати доступ до камери. (${err.name})`;
                console.error(err);
                startButton.style.display = 'block';
                stopButton.style.display = 'none';
                scanLine.style.display = 'none';
            }
        }

        /**
         * Зупиняє сканування та звільняє ресурси камери.
         */
        function stopScanning() {
            if (codeReader) {
                codeReader.reset(); // Зупиняє декодування
                codeReader = null;
            }
            if (stream) {
                // Зупиняє всі треки (відео)
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }
            video.srcObject = null;
            video.pause();
            startButton.style.display = 'block';
            stopButton.style.display = 'none';
            scanLine.style.display = 'none';
            // Не змінюємо statusMessage, щоб зберегти повідомлення про результат/помилку
        }

        // Обробники подій для кнопок
        startButton.addEventListener('click', startScanning);
        stopButton.addEventListener('click', stopScanning);

        // Зупиняємо сканування при закритті сторінки (необхідно для звільнення камери)
        window.addEventListener('beforeunload', stopScanning);
