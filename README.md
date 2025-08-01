# Çağrı Analitiği Dashboard 📊

Gerçek zamanlı AI destekli çağrı merkezi analitik dashboard'u. ElevenLabs Conversational AI ve Gemini 2.5 Flash Lite ile entegre çalışarak, çağrı ses kayıtlarını analiz eder ve anında içgörüler sunar.

## 🚀 Özellikler

### Gerçek Zamanlı İzleme
- **Canlı Çağrı Takibi**: Aktif çağrıları gerçek zamanlı ses dalgası görselleştirmesi ile izleyin
- **Otomatik Transkripsiyon**: ElevenLabs ile anlık konuşma metni dönüşümü
- **Duygu Durumu Analizi**: Konuşmanın pozitif/negatif/nötr tonunu anlık takip

### Gelişmiş Analitik
- **Gemini 2.5 Flash Lite Entegrasyonu**: Çağrı sonrası otomatik ses analizi
- **Duygu Durumu Zaman Çizelgesi**: Çağrı boyunca duygu durumu değişimlerini görselleştirme
- **Emotion Radar**: 7 farklı duygu tipinin detaylı analizi
- **Konu Analizi**: Konuşulan konuların otomatik tespiti ve sınıflandırması

### Performans Metrikleri
- **Temsilci Performansı**: Empati, netlik, çözüm odaklılık ve profesyonellik skorları
- **Müşteri Memnuniyeti**: Otomatik memnuniyet skoru hesaplama
- **Risk Değerlendirmesi**: Kayıp riski, yükseltme riski gibi faktörlerin tespiti
- **Aksiyon Maddeleri**: Takip edilmesi gereken görevlerin otomatik oluşturulması

### Modern UI/UX
- **Minimalist Tasarım**: Apple, Notion ve Linear'dan ilham alan temiz arayüz
- **Smooth Animasyonlar**: Framer Motion ile akıcı geçişler
- **Dark Mode Desteği**: Göz yormayan karanlık tema
- **Responsive Tasarım**: Her ekran boyutuna uyumlu

## 🛠️ Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- ElevenLabs API anahtarı
- Google Gemini API anahtarı

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone <repo-url>
cd scaleup-demo
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **API anahtarlarını yapılandırın**
```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin ve API anahtarlarınızı ekleyin:
```env
VITE_ELEVENLABS_API_KEY=your-elevenlabs-api-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

4. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

5. **Tarayıcınızda açın**
```
http://localhost:5173
```

## 🔑 API Anahtarları

### ElevenLabs API
1. [ElevenLabs](https://elevenlabs.io) hesabı oluşturun
2. Dashboard'dan API anahtarınızı alın
3. Conversational AI özelliğinin aktif olduğundan emin olun

### Google Gemini API
1. [Google AI Studio](https://makersuite.google.com) hesabı oluşturun
2. API anahtarı oluşturun
3. Gemini 2.5 Flash Lite modelinin erişilebilir olduğundan emin olun

## 📱 Kullanım

### Dashboard Görünümleri

1. **Sidebar**: Tüm çağrıları listeler, arama ve filtreleme özellikleri
2. **Canlı Çağrı Monitörü**: Aktif çağrıların gerçek zamanlı takibi
3. **Çağrı Detayları**: Tamamlanan çağrıların detaylı analizi
4. **Analitik Dashboard**: Genel performans metrikleri

### Sekme Yapısı

- **Genel Bakış**: Çağrı özeti, konular, ses kaydı
- **Analitik**: Duygu durumu grafikleri, emotion radar
- **Transkript**: Tam konuşma metni, arama özelliği
- **Performans**: Temsilci performans metrikleri
- **Aksiyonlar**: Takip edilecek görevler
- **Riskler**: Tespit edilen risk faktörleri

## 🏗️ Teknik Yapı

### Frontend Stack
- **React 18**: Modern React özellikleri
- **TypeScript**: Tip güvenliği
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Yeniden kullanılabilir UI bileşenleri
- **Framer Motion**: Animasyon kütüphanesi
- **Vite**: Hızlı build aracı

### API Entegrasyonları
- **ElevenLabs WebSocket**: Gerçek zamanlı çağrı verileri
- **Gemini 2.5 Flash Lite**: Ses analizi ve içgörüler

## 🎨 Özelleştirme

### Tema Renkleri
`src/index.css` dosyasındaki CSS değişkenlerini düzenleyerek renk temasını özelleştirebilirsiniz.

### Dil Desteği
Tüm metin içerikleri `src/lib/translations.ts` dosyasında bulunur. Yeni dil eklemek için bu dosyayı düzenleyin.

## 📈 Performans

- Lazy loading ile optimize edilmiş bileşenler
- WebSocket bağlantısı ile düşük gecikme
- Canvas tabanlı grafikler ile yüksek performans
- Efficient re-render stratejisi

## 🤝 Katkıda Bulunma

Pull request'ler kabul edilir. Büyük değişiklikler için önce bir issue açarak neyi değiştirmek istediğinizi tartışın.

## 📄 Lisans

MIT

## 🆘 Destek

Sorunlar için GitHub Issues kullanın veya destek@example.com adresine e-posta gönderin.

---

**Not**: Bu dashboard production kullanımı için API anahtarlarının güvenli bir şekilde saklanması ve rate limiting uygulanması önerilir.