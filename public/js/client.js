document.addEventListener('DOMContentLoaded', function() {
  // Kontrol durumunu izleyen değişkenler
  let controlState = {
      led: false,
      led_speed: false,  // false: yavaş, true: hızlı
      fan: false,
      fan_speed: false,  // false: yavaş, true: hızlı
      sg90: false,
      voice_text: ""
  };

  // DOM elementlerini seçme
  const ledToggle = document.getElementById('led-toggle');
  const ledSlow = document.getElementById('led-slow');
  const ledFast = document.getElementById('led-fast');
  const fanToggle = document.getElementById('fan-toggle');
  const fanSlow = document.getElementById('fan-slow');
  const fanFast = document.getElementById('fan-fast');
  const sg90Toggle = document.getElementById('sg90-toggle');
  const voiceText = document.getElementById('voice-text');
  const sendVoice = document.getElementById('send-voice');

  // Sensör değeri göstergeleri
  const ldrValue = document.getElementById('ldr-value');
  const gasValue = document.getElementById('gas-value');
  const rainValue = document.getElementById('rain-value');
  const tempValue = document.getElementById('temp-value');

  // Toggle label'ları
  const toggleLabels = document.querySelectorAll('.toggle-label');

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

  // Toggle durumlarını güncelleyen fonksiyon
  function updateToggleLabels() {
      document.querySelectorAll('.switch input').forEach(input => {
          const label = input.parentElement.nextElementSibling;
          if (label && label.classList.contains('toggle-label')) {
              label.textContent = input.checked ? 'Açık' : 'Kapalı';
          }
      });
  }

  // Hız butonlarının durumlarını güncelleyen fonksiyon
  function updateSpeedButtons() {
      // LED hızı butonları
      ledSlow.classList.toggle('active', !controlState.led_speed);
      ledFast.classList.toggle('active', controlState.led_speed);
      
      // Fan hızı butonları
      fanSlow.classList.toggle('active', !controlState.fan_speed);
      fanFast.classList.toggle('active', controlState.fan_speed);
  }

  // Event listener'ları ayarlama
  ledToggle.addEventListener('change', function() {
      controlState.led = this.checked;
      updateToggleLabels();
      sendControlData();
  });

  ledSlow.addEventListener('click', function() {
      controlState.led_speed = false;
      updateSpeedButtons();
      sendControlData();
  });

  ledFast.addEventListener('click', function() {
      controlState.led_speed = true;
      updateSpeedButtons();
      sendControlData();
  });

  fanToggle.addEventListener('change', function() {
      controlState.fan = this.checked;
      updateToggleLabels();
      sendControlData();
  });

  fanSlow.addEventListener('click', function() {
      controlState.fan_speed = false;
      updateSpeedButtons();
      sendControlData();
  });

  fanFast.addEventListener('click', function() {
      controlState.fan_speed = true;
      updateSpeedButtons();
      sendControlData();
  });

  sg90Toggle.addEventListener('change', function() {
      controlState.sg90 = this.checked;
      updateToggleLabels();
      sendControlData();
  });

  sendVoice.addEventListener('click', function() {
      const text = voiceText.value;
      if (text) {
          controlState.voice_text = text;
          sendControlData();
          voiceText.value = '';
      }
  });

  // İlk yükleme
  updateToggleLabels();
  updateSpeedButtons();
  
  // Periyodik olarak sensör verilerini güncelle (her 2 saniyede bir)
  setInterval(updateSensorData, 500);
  
  // Sayfa ilk yüklendiğinde bir kez sensör verilerini al
  updateSensorData();
});