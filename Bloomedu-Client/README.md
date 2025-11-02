# BloomEdu - React Native Client

Otizmli çocuklar için eğitsel oyun platformu.

## 🚀 Kurulum

### Gereksinimler:
- Node.js 16+
- React Native CLI
- Android Studio / Xcode
- Backend API çalışıyor olmalı

### Adımlar:

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Android için
npx react-native run-android

# 3. iOS için (Mac gerekli)
cd ios && pod install && cd ..
npx react-native run-ios
```

## ⚙️ Backend Bağlantısı

### Backend URL'leri:

**Oyunlar için:**
- Android Emulator: `http://10.0.2.2:3000`
- iOS Simulator: `http://localhost:3000`
- Fiziksel Cihaz: `http://[BİLGİSAYARIN-IP]:3000`

**Login/Dashboard için:**
- Production: `https://bloomedu-production.up.railway.app`

### Backend'i Çalıştırma:

```bash
cd Bloomedu-Backend
npm install
npm start

# Şunu görmelisin:
# ✅ Backend is running on 0.0.0.0:3000
```

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
