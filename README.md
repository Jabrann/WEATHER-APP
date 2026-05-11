# WeatherNow — Live Forecast 🌤

WeatherNow adalah aplikasi cuaca real-time yang ringan, modern, dan cantik. Dibuat dengan HTML, CSS, dan JavaScript vanilla (tanpa framework), menggunakan data dari OpenWeatherMap.

> **Tema terbaru:** Pastel Pink-Blue — terinspirasi dari gradient lembut pink `#e9c5cb` ke lavender `#afb0cf`

![WeatherNow Preview](https://via.placeholder.com/1200x600/fdf4f7/3b3447?text=WeatherNow+Pastel+Preview)

---

## ✨ Fitur

- **Lokasi otomatis** — deteksi GPS, fallback ke Mamuju
- **Current weather** — suhu, feels like, deskripsi, icon dinamis
- **Hourly forecast** — chart Chart.js + scroll 9 jam ke depan
- **7-Day forecast** — hi/lo, pop hujan
- **Peta interaktif** — Leaflet + layer OpenWeatherMap (Clouds, Rain, Wind, Temp)
- **Minute precipitation** — visual bar 60 menit
- **Statistik lengkap:** UV Index, Wind + kompas, Pressure, Sunrise/Sunset dengan arc animasi
- **Air Quality Index (AQI)** — PM2.5, PM10, O₃, NO₂, SO₂, CO
- **Unit toggle** — °C / °F instan
- **Search kota** — cari kota mana pun
- **Responsive** — mobile, tablet, desktop
- **Tema Pastel** — soft pink-blue, glassmorphism, shadow halus

## 🗂️ Struktur Project

```
weathernow/
├── index.html          # versi dark original
├── styles.css
├── script.js
├── index.html   # versi pastel (rekomendasi)
├── styles.css
├── script.js
└── README.md
```

Pilih salah satu:
- Pakai `index.html` untuk tema dark navy
- Pakai `index.html` untuk tema pastel pink-blue

## 🚀 Cara Pakai

1. **Clone repo**
   ```bash
   git clone https://github.com/username/weathernow.git
   cd weathernow
   ```

2. **Dapatkan API Key OpenWeatherMap (gratis)**
   - Daftar di https://openweathermap.org/api
   - Copy API key

3. **Pasang API key**
   Buka `script.js` atau `script.js`, ganti baris:
   ```js
   const API_KEY = 'e0b0aa54b0f13ee7f0f887447464a590';
   ```
   dengan key kamu.

4. **Jalankan**
   - Cukup double-click `index.html`, atau
   - Serve dengan live server: `npx serve`

## 🌐 Deploy ke GitHub Pages

1. Push ke GitHub
2. Settings → Pages → Source: `main` / `root`
3. Akses di `https://username.github.io/weathernow/index.html`

## 🎨 Kustomisasi Warna

Tema pastel menggunakan variabel CSS di `:root` (file `styles.css`):

```css
:root {
  --bg:#fffafc;
  --accent:#a3aed3;      /* lavender blue */
  --accent2:#e9b8c2;     /* soft pink */
  --text:#3b3447;
  --glow:rgba(233,197,203,0.35);
}
```

Ganti nilai ini untuk membuat palet kamu sendiri. Gradient hero diatur di `script.js` → `WBGS`.

## 🧩 Teknologi

- HTML5 + CSS3 (custom properties, grid, flex)
- JavaScript ES6 (fetch, async/await)
- [Chart.js 4.4](https://www.chartjs.org/) — grafik hourly
- [Leaflet 1.9.4](https://leafletjs.com/) — peta
- [OpenWeatherMap API](https://openweathermap.org/) — weather, forecast, air pollution, tiles

## 📝 Lisensi

MIT License — bebas pakai, modifikasi, dan share. Jangan lupa cantumkan credit ke OpenWeatherMap.

## 🙌 Credit

Dibuat dengan ❤️ di Mamuju, Sulawesi Barat.
Desain warna terinspirasi dari gradient pastel pink-blue.

---
**Butuh bantuan?** Buka issue atau DM. Mau versi React, PWA offline, atau toggle dark/light? Bilang aja!
