const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
const axios = require('axios')
const path = require('path');

require('dotenv').config();
const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('ffmpeg-static')
const fs = require('fs')
const { Buffer } = require('buffer')

ffmpeg.setFfmpegPath(ffmpegPath)

app.use(cors())
app.use(express.json())

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  // Örnek veriler (bu veriler ESP32'den alınabilir)
  const datas = {
    led: true,  // LED'in açık olduğunu varsayalım
    fan: false, // Fan kapalı
    ledSpeed: 'slow', // LED hızını 'slow' olarak ayarlayalım
    fanSpeed: 'fast' // Fan hızını 'fast' olarak ayarlayalım
  };

  // Veriyi index.ejs dosyasına gönderme
  res.render('index', { datas });
});

var datas = {
  led_speed   : false,
  led         : true,
  fan         : true,
  fan_speed   : true,
  sg90        : true,
  voice_text  : " "
}

var sensorDatas = {
  ldr         : 1000,
  gas         : 100,
  rain        : 1,
  temperature : 30
}

app.post('/updateDatas', (req, res) => {
  datas = req.body.newDatas
  console.log(datas)
  res.status(200).json({message:"successful"})
})

app.get('/getDatas', (req,res) => {
  res.status(200).json({message:"successful", sensorDatas})
})

app.post('/data', (req, res) => {
  //console.log(req.body)
  sensorDatas = req.body
  res.status(200).json(datas)
});

app.post('/tts', async (req, res) => {
  console.log("tts");
  const text = req.body.text;

  if (!text) return res.status(400).send("Text parametresi gerekli");

  const requestBody = {
    input: { text },
    voice: {
      languageCode: "tr-TR",
      name: "tr-TR-Wavenet-A"
    },
    audioConfig: {
      audioEncoding: "MP3"
    }
  };

  try {
    const response = await axios.post(
      `https://texttospeech.googleapis.com/v1/text:synthesize?alt=json&key=${process.env.secretKey}`,
      requestBody,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const audioContent = response.data.audioContent;
    if (!audioContent) return res.status(500).send("Ses verisi alınamadı.");

    // MP3 dosyasını yaz
    const mp3Buffer = Buffer.from(audioContent, 'base64');
    fs.writeFileSync('temp.mp3', mp3Buffer);

    ffmpeg('temp.mp3')
    .audioCodec('pcm_s16le')
    .audioChannels(1)
    .audioFrequency(16000)
    .format('s16le')
    .on('end', () => {
      const pcmBuffer = fs.readFileSync('output.pcm');
      res.setHeader("Content-Type", "application/octet-stream");
      res.send(pcmBuffer); // Base64 değil, direkt binary
      console.log(pcmBuffer.length)
      
    })
    .on('error', err => {
      console.error('FFmpeg hatası:', err);
      res.status(500).send("Ses dönüştürmede hata oluştu.");
    })
    .save('output.pcm');

  } catch (error) {
    console.error('API hatası:', error);
    res.status(500).send("Bir hata oluştu.")
  }
});

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
