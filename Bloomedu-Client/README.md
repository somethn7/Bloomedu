# BloomEdu - React Native Client

Otizmli çocuklar için eğitsel oyun platformu.

## 🚀 Hızlı Başlangıç

### Gereksinimler:
- Node.js 16+
- React Native CLI
- Android Studio / Xcode
- **Railway Backend URL'si otomatik kullanılıyor** ✅

### Kurulum Adımları:

```bash
# 1. Repository'yi klonla
git clone https://github.com/[username]/Bloomedu.git
cd Bloomedu

# 2. Client bağımlılıklarını yükle
cd Bloomedu-Client
npm install

# 3. Android için çalıştır
npx react-native run-android

# 4. iOS için çalıştır (Mac gerekli)
cd ios && pod install && cd ..
npx react-native run-ios
```

## 🌐 Backend Yapılandırması

### ✅ Production (Varsayılan)

**Tüm işlemler otomatik olarak Railway production backend'e bağlanır:**
- URL: `https://bloomedu-production.up.railway.app`
- Dosya: `Bloomedu-Client/config/api.ts`
- **Herhangi bir değişiklik gerektirmez!**

### 🔧 Local Development (Opsiyonel)

Sadece backend geliştiriyorsanız:

```bash
# 1. Backend'i yerel olarak çalıştır
cd Bloomedu-Backend
npm install
npm start

# 2. API config'i değiştir (Bloomedu-Client/config/api.ts)
# Şu satırı yorum satırından çıkar:
# export const API_BASE_URL = 'http://10.0.2.2:3000'; // Android Emulator
# export const API_BASE_URL = 'http://localhost:3000'; // iOS Simulator
```

## 🎮 Yeni Özellikler

### Merkezi API Yönetimi
- ✅ Tüm API çağrıları `config/api.ts` üzerinden yapılır
- ✅ Oyun sonuçları otomatik Railway database'e kaydedilir
- ✅ Video session'lar kaldırıldı (her şey `game_sessions` tablosunda)

### Level 3 Oyunlar
- ✅ **Shape Match** (Objects kategorisi)

### Oyun Geliştirmeleri
- ✅ TTS (Text-to-Speech) tüm oyunlarda yavaş (0.3 rate)
- ✅ Dinamik skorlama (yanlış cevaplar skoru düşürür)
- ✅ Oyun bitişinde "Play Again" ve "Next Game" butonları
- ✅ Otomatik animasyonlu oyunlar iyileştirildi

## 🐛 Sorun Giderme

### "Network request failed" hatası:

1. ✅ Backend çalışıyor mu kontrol et
2. ✅ IP adresi doğru mu kontrol et
3. ✅ Firewall backend'i engelliyor mu kontrol et

### Fiziksel Cihaz Kullanıyorsan:

1. IP adresini öğren:
```bash
# Windows
ipconfig

# Mac/Linux  
ifconfig
```

2. Tüm `http://10.0.2.2:3000` yerlerini `http://[SENIN-IP]:3000` yap

## 📝 Development

### Console Logs:

- Development modda tüm log'lar görünür
- Production build'de sadece error'lar görünür
- `utils/logger.ts` dosyasını kullanabilirsiniz

## 📱 Build

### Android APK:

```bash
cd android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

### iOS:

```bash
# Xcode'da açıp Archive edin
```

## 🎮 Oyunlar

- **Level 1:** 7 oyun
- **Level 2:** 6 oyun
- **Kategoriler:** Colors, Numbers, Objects, Animals, Family

## 📊 Database

Backend PostgreSQL (Supabase) kullanıyor.

Oyun skorları otomatik kaydediliyor.

## 🤝 Ekip İçin

Projeyi çalıştırmadan önce:
1. Backend'i çalıştır
2. .env dosyasını kontrol et (Backend'de)
3. npm install yap

---

Made with ❤️ for children with autism
