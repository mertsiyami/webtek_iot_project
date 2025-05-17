document.addEventListener('DOMContentLoaded', function() {
    // Kontrol durumunu izleyen değişkenler (güncellenmiş - peltier eklendi)
    let controlState = {
        led: 0,           // 0: kapalı, 1: açık
        led_speed: 0,     // 0: yavaş, 1: orta, 2: hızlı
        fan: 0,           // 0: kapalı, 1: açık
        fan_speed: 0,     // 0: yavaş, 1: orta, 2: hızlı
        sg90: 0,          // 0: kapalı, 1: açık
        sg90_angle: 0,    // 0: 0 derece, 1: 90 derece, 2: 180 derece
        peltier: 0,       // 0: kapalı, 1: açık
        peltier_speed: 0, // 0: düşük, 1: orta, 2: yüksek
        voice_text: ""
    };
  
    // DOM elementlerini seçme
    const ledToggle = document.getElementById('led-toggle');
    const ledSlow = document.getElementById('led-slow');
    const ledMedium = document.getElementById('led-medium');
    const ledFast = document.getElementById('led-fast');
    
    const fanToggle = document.getElementById('fan-toggle');
    const fanSlow = document.getElementById('fan-slow');
    const fanMedium = document.getElementById('fan-medium');
    const fanFast = document.getElementById('fan-fast');
    
    const sg90Toggle = document.getElementById('sg90-toggle');
    const sg90_0 = document.getElementById('sg90-0');
    const sg90_90 = document.getElementById('sg90-90');
    const sg90_180 = document.getElementById('sg90-180');
    
    // Yeni eklenen peltier kontrolleri
    const peltierToggle = document.getElementById('peltier-toggle');
    const peltierSlow = document.getElementById('peltier-slow');
    const peltierMedium = document.getElementById('peltier-medium');
    const peltierFast = document.getElementById('peltier-fast');
    
    const voiceText = document.getElementById('voice-text');
    const sendVoice = document.getElementById('send-voice');
  
    // Sensör değeri göstergeleri
    const ldrValue = document.getElementById('ldr-value');
    const gasValue = document.getElementById('gas-value');
    const rainValue = document.getElementById('rain-value');
    const tempValue = document.getElementById('temp-value');
  
    // Sensör verilerini güncelleyen fonksiyon
    function updateSensorData() {
        fetch('/getDatas')
            .then(response => response.json())
            .then(data => {
                if (data && data.message === "successful" && data.sensorDatas) {
                    const sensorDatas = data.sensorDatas;
                    ldrValue.textContent = sensorDatas.ldr;
                    gasValue.textContent = sensorDatas.gas;
                    rainValue.textContent = sensorDatas.rain;
                    tempValue.textContent = sensorDatas.temperature + " °C";
                    
                    // Sensör kutularının renklerini değerlere göre güncelle
                    updateSensorColors(sensorDatas);
                }
            })
            .catch(error => console.error('Sensör verileri alınamadı:', error));
    }
  
    // Sensör kutularının renklerini değerlere göre güncelleyen fonksiyon
    function updateSensorColors(data) {
        // LDR kutusu rengini güncelle (düşük değer = karanlık)
        const ldrBox = document.getElementById('ldr-box');
        const ldrVal = parseInt(data.ldr);
        if (ldrVal < 300) {
            ldrBox.style.backgroundColor = '#e6f2ff'; // Koyu mavi (karanlık)
        } else if (ldrVal < 600) {
            ldrBox.style.backgroundColor = '#ffffcc'; // Açık sarı (orta)
        } else {
            ldrBox.style.backgroundColor = '#ffffb3'; // Koyu sarı (aydınlık)
        }
  
        // Gaz kutusu rengini güncelle (yüksek değer = tehlikeli)
        const gasBox = document.getElementById('gas-box');
        const gasVal = parseInt(data.gas);
        if (gasVal > 700) {
            gasBox.style.backgroundColor = '#ffcccc'; // Kırmızı (tehlikeli)
        } else if (gasVal > 400) {
            gasBox.style.backgroundColor = '#fff2cc'; // Turuncu (dikkat)
        } else {
            gasBox.style.backgroundColor = '#ccffcc'; // Yeşil (güvenli)
        }
  
        // Yağmur kutusu rengini güncelle (düşük değer = ıslak)
        const rainBox = document.getElementById('rain-box');
        const rainVal = parseInt(data.rain);
        if (rainVal < 300) {
            rainBox.style.backgroundColor = '#ccf2ff'; // Mavi (ıslak)
        } else if (rainVal < 700) {
            rainBox.style.backgroundColor = '#e6e6ff'; // Açık mavi (nemli)
        } else {
            rainBox.style.backgroundColor = '#f9f9f9'; // Normal (kuru)
        }
  
        // Sıcaklık kutusu rengini güncelle
        const tempBox = document.getElementById('temp-box');
        const tempVal = parseInt(data.temperature);
        if (tempVal > 30) {
            tempBox.style.backgroundColor = '#ffcccc'; // Kırmızı (sıcak)
        } else if (tempVal > 20) {
            tempBox.style.backgroundColor = '#ffffcc'; // Sarı (ılık)
        } else {
            tempBox.style.backgroundColor = '#ccf2ff'; // Mavi (soğuk)
        }
    }
  
    // Sunucuya kontrol verilerini gönderen fonksiyon
    function sendControlData() {
        fetch('/updateDatas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newDatas: controlState })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "successful") {
                console.log('Kontrol verileri başarıyla gönderildi');
            }
        })
        .catch(error => {
            console.error('Kontrol verilerini gönderirken hata:', error);
        });
    }
  
    // Hız butonlarının durumlarını güncelleyen fonksiyon
    function updateSpeedButtons() {
        // LED hızı butonları
        ledSlow.classList.toggle('active', controlState.led_speed === 0);
        ledMedium.classList.toggle('active', controlState.led_speed === 1);
        ledFast.classList.toggle('active', controlState.led_speed === 2);
        
        // Fan hızı butonları
        fanSlow.classList.toggle('active', controlState.fan_speed === 0);
        fanMedium.classList.toggle('active', controlState.fan_speed === 1);
        fanFast.classList.toggle('active', controlState.fan_speed === 2);
        
        // SG90 açı butonları
        sg90_0.classList.toggle('active', controlState.sg90_angle === 0);
        sg90_90.classList.toggle('active', controlState.sg90_angle === 1);
        sg90_180.classList.toggle('active', controlState.sg90_angle === 2);
        
        // Peltier hız butonları
        peltierSlow.classList.toggle('active', controlState.peltier_speed === 0);
        peltierMedium.classList.toggle('active', controlState.peltier_speed === 1);
        peltierFast.classList.toggle('active', controlState.peltier_speed === 2);
    }
    
    // Toggle butonlarının durumlarını güncelleyen fonksiyon
    function updateToggleButtons() {
        ledToggle.checked = controlState.led === 1;
        fanToggle.checked = controlState.fan === 1;
        sg90Toggle.checked = controlState.sg90 === 1;
        peltierToggle.checked = controlState.peltier === 1;
    }
  
    // Event listener'ları ayarlama - Toggle switchler
    ledToggle.addEventListener('change', function() {
        controlState.led = this.checked ? 1 : 0;
        sendControlData();
    });
    
    fanToggle.addEventListener('change', function() {
        controlState.fan = this.checked ? 1 : 0;
        sendControlData();
    });
    
    sg90Toggle.addEventListener('change', function() {
        controlState.sg90 = this.checked ? 1 : 0;
        sendControlData();
    });
    
    peltierToggle.addEventListener('change', function() {
        controlState.peltier = this.checked ? 1 : 0;
        sendControlData();
    });
  
    // Event listener'ları ayarlama - LED hız butonları
    ledSlow.addEventListener('click', function() {
        controlState.led_speed = 0;
        updateSpeedButtons();
        sendControlData();
    });
  
    ledMedium.addEventListener('click', function() {
        controlState.led_speed = 1;
        updateSpeedButtons();
        sendControlData();
    });
  
    ledFast.addEventListener('click', function() {
        controlState.led_speed = 2;
        updateSpeedButtons();
        sendControlData();
    });
  
    // Event listener'ları ayarlama - Fan hız butonları
    fanSlow.addEventListener('click', function() {
        controlState.fan_speed = 0;
        updateSpeedButtons();
        sendControlData();
    });
  
    fanMedium.addEventListener('click', function() {
        controlState.fan_speed = 1;
        updateSpeedButtons();
        sendControlData();
    });
  
    fanFast.addEventListener('click', function() {
        controlState.fan_speed = 2;
        updateSpeedButtons();
        sendControlData();
    });
  
    // Event listener'ları ayarlama - SG90 açı butonları
    sg90_0.addEventListener('click', function() {
        controlState.sg90_angle = 0;
        updateSpeedButtons();
        sendControlData();
    });
  
    sg90_90.addEventListener('click', function() {
        controlState.sg90_angle = 1;
        updateSpeedButtons();
        sendControlData();
    });
  
    sg90_180.addEventListener('click', function() {
        controlState.sg90_angle = 2;
        updateSpeedButtons();
        sendControlData();
    });
    
    // Event listener'ları ayarlama - Peltier hız butonları
    peltierSlow.addEventListener('click', function() {
        controlState.peltier_speed = 0;
        updateSpeedButtons();
        sendControlData();
    });
    
    peltierMedium.addEventListener('click', function() {
        controlState.peltier_speed = 1;
        updateSpeedButtons();
        sendControlData();
    });
    
    peltierFast.addEventListener('click', function() {
        controlState.peltier_speed = 2;
        updateSpeedButtons();
        sendControlData();
    });
  
    // Event listener'ları ayarlama - Ses metni gönderme
    sendVoice.addEventListener('click', function() {
        const text = voiceText.value;
        if (text) {
            controlState.voice_text = text;
            sendControlData();
            voiceText.value = '';
        }
    });
  
    // İlk yükleme
    updateSpeedButtons();
    updateToggleButtons();
    
    // Periyodik olarak sensör verilerini güncelle (her yarım saniyede bir)
    setInterval(updateSensorData, 500);
    
    // Sayfa ilk yüklendiğinde bir kez sensör verilerini al
    updateSensorData();
});