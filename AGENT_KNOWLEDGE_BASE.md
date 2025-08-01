# Agent Knowledge Base - Turkcell Bilgi Bankası

Agent'ların akıllı cevap verebilmesi için her birine knowledge base eklememiz lazım. 

## 1. Support Agent Knowledge Base

```
TURKCELL PAKET BİLGİLERİ:
- Faturalı Platin Plus: 50GB, sınırsız konuşma, 399 TL
- Faturalı Süper 20GB: 20GB, 1000dk, 249 TL  
- Faturalı Eko 5GB: 5GB, 250dk, 149 TL
- Faturasız Rahat 10GB: 10GB, 500dk, 199 TL

FATURA BİLGİLERİ:
- Son ödeme tarihi: Her ayın 15'i
- Gecikme faizi: Günlük %0.1
- Fatura kesim tarihi: Her ayın 1'i
- Online ödeme: turkcell.com.tr veya Turkcell Hesabım app

ÖDEME YÖNTEMLERİ:
- Kredi kartı (taksit imkanı)
- Banka havalesi/EFT
- Turkcell mağazaları
- PTT şubeleri
- Otomatik ödeme talimatı (tüm bankalar)

KAMPANYALAR:
- Yeni müşteri: İlk 3 ay %50 indirim
- Portla gel: 6 ay %25 indirim + 20GB hediye
- Öğrenci: %40 indirim (belge ile)
- 65+ yaş: %30 indirim

KALAN KULLANIM SORGULAMA:
- SMS: KALAN yazıp 2222'ye gönder
- Turkcell Hesabım uygulaması
- *123# tuşla
- 532'yi ara (ücretsiz)
```

## 2. Technical Agent Knowledge Base

```
İNTERNET AYARLARI:
- APN: internet
- Kullanıcı adı: (boş bırak)
- Şifre: (boş bırak)
- MMS APN: mms
- MMS proxy: 212.252.168.012
- Port: 8080

MODEM SORUN ÇÖZME:
1. Modem restart: Güç kablosunu 10 sn çek
2. Factory reset: Reset butonuna 15 sn bas
3. WiFi şifresi: Modem altında yazan şifre
4. Admin panel: 192.168.1.1 (admin/admin)

ŞEBEKE SORUNLARI:
- 4.5G aktivasyon: AKILLI yazıp 2222'ye
- Şebeke ayarı: Ayarlar > Mobil Ağ > Otomatik seç
- Uçak modu aç/kapa
- SIM kartı çıkar/tak

TV+ SORUNLARI:
- Minimum hız: 16 Mbps
- Cihaz limiti: 5 cihaz
- Çözünürlük: Full HD (Premium), HD (Standart)
- Uygulamayı sil/yükle
- Cache temizle

ARIZA DURUMLARI:
- Fiber kopması: 24-48 saat içinde çözüm
- Bölgesel arıza: turkcell.com.tr/ariza-sorgulama
- Planlı bakım: SMS ile bildirilir
- Acil durum: 532 (7/24)
```

## 3. Sales Agent Knowledge Base

```
YENİ HAT KAMPANYALARI:
- Platin Plus Hoşgeldin: 399 TL yerine ilk 3 ay 199 TL
- Süper 20 Başlangıç: 249 TL + 10GB hediye
- Genç Turkcell: 25 yaş altı %50 indirim
- Aile paketi: 4 hat al, 1'i bedava

FİBER + MOBİL AVANTAJLARI:
- Fiber 100 Mbps + Mobil: Toplam 499 TL (ayrı ayrı 650 TL)
- Fiber 200 Mbps + Mobil: Toplam 599 TL
- TV+ hediye (ilk 6 ay)
- Modem ücretsiz

EK PAKETLER:
- Ek 5GB: 29 TL
- Ek 10GB: 49 TL
- Sosyal Medya Paketi: 19 TL (Instagram, Twitter, TikTok)
- YouTube Paketi: 29 TL

TAAHHÜT AVANTAJLARI:
- 24 ay taahhüt: %30 indirim + telefon
- 12 ay taahhüt: %20 indirim
- Taahhütsüz: Liste fiyatı

KURUMSAL ÇÖZÜMLER:
- 10+ hat: %40 indirim
- Özel müşteri temsilcisi
- Fatura tek elden
- Yurt dışı roaming indirimi
```

## 4. Orchestrator Agent Knowledge Base

```
DEPARTMAN YÖNLENDİRMELERİ:

DESTEK DEPARTMANI:
- Fatura sorguları
- Ödeme sorunları
- Paket değişiklikleri
- TL yükleme
- Hat iptali/dondurma
- Kimlik bilgisi güncelleme

TEKNİK DEPARTMAN:
- İnternet bağlantı sorunları
- Şebeke/kapsama problemleri
- Modem arızaları
- TV+ sorunları
- Cihaz ayarları
- Hız problemleri

SATIŞ DEPARTMANI:
- Yeni hat başvurusu
- Kampanya bilgileri
- Ek paket satışı
- Tarife yükseltme
- Kurumsal geçiş
- Cihaz kampanyaları

ANAHTAR KELİMELER:
Fatura kelimesi → Destek
İnternet kelimesi → Teknik
Kampanya kelimesi → Satış
Arıza kelimesi → Teknik
Ödeme kelimesi → Destek
Yeni hat kelimesi → Satış
```

## Agent'lara Ekleme

1. Her agent'ı aç
2. "Agent knowledge base" bölümüne git
3. "Add document" tıkla
4. İlgili bilgileri yapıştır
5. Save

## Alternatif: Sistem Promptuna Ekle

Eğer knowledge base çalışmazsa, bu bilgileri doğrudan system prompt'un sonuna ekleyebilirsin:

```
TEMEL BİLGİLER:
[Yukarıdaki bilgileri buraya yapıştır]
```

## Test Soruları

Support Agent:
- "Faturalı Platin Plus paketi ne kadar?"
- "Faturamın son ödeme tarihi ne zaman?"

Technical Agent:
- "İnternetim yok ne yapmalıyım?"
- "TV+ donuyor, nasıl düzelir?"

Sales Agent:
- "En ucuz paket hangisi?"
- "Fiber + mobil kampanyanız var mı?"
```