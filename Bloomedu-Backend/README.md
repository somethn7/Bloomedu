# Bloomedu Backend

## AI (Yapay Zekâ) API Key Alma ve Entegrasyon

Bu projede AI chat endpoint'i: `POST /ai-chat`

- **API key client (React Native) içine konmaz.** Güvenlik için key sadece backend'de bulunur.
- Backend, `OPENAI_API_KEY` varsa OpenAI'ye istek atar; yoksa **mock cevap** üretir.

### 1) OpenAI API key nasıl alınır?

- OpenAI hesabı açın
- Dashboard'dan bir **API key** oluşturun
- Key'i kimseyle paylaşmayın, repo'ya commit etmeyin

### 2) Local (bilgisayarında) çalıştırma

1. `Bloomedu-Backend/env.example` dosyasını `Bloomedu-Backend/.env` olarak kopyalayın
2. `.env` içine aşağıdakileri girin:
   - `FIREBASE_KEY` (Firebase service account JSON string)
   - `RESEND_API_KEY` (opsiyonel: mail için)
   - `OPENAI_API_KEY` (AI için)
   - (opsiyonel) `OPENAI_MODEL` (örnek: `gpt-4.1`)
3. Backend'i başlatın:

```bash
cd Bloomedu-Backend
npm install
npm start
```

### 3) Production (Railway) ortamında

Railway'de **Variables/Environment** kısmına şu değişkenleri ekleyin:

- `FIREBASE_KEY`
- `RESEND_API_KEY`
- `OPENAI_API_KEY`
- (opsiyonel) `OPENAI_MODEL`

Deploy/restart sonrası `/ai-chat` gerçek modele bağlanır.

