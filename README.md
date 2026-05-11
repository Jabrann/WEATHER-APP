# WeatherNow

Aplikasi cuaca real-time dengan desain pastel pink-blue. Dibangun tanpa framework — hanya HTML, CSS, dan JavaScript.

---

## Fitur
- Deteksi lokasi otomatis
- Cuaca saat ini, per jam, dan 7 hari
- Peta interaktif (Leaflet) dengan layer awan/hujan/angin
- AQI, UV Index, tekanan, sunrise/sunset
- Toggle °C / °F
- Responsive mobile

## Cepat Mulai

1. Clone repo
```bash
git clone https://github.com/username/weathernow.git
cd weathernow
```

2. Buka `script-pastel.js`, ganti API key:
```js
const API_KEY = 'MASUKKAN_KEY_ANDA';
```
Dapatkan key gratis di: https://openweathermap.org/api

3. Jalankan
- Double-click `index-pastel.html`, atau
- `npx serve`

## Struktur
```
├── index-pastel.html   # file utama (tema pastel)
├── styles-pastel.css   # styling
├── script-pastel.js    # logic
└── README.md
```

## Kustomisasi Warna
Edit variabel di `styles-pastel.css`:
```css
:root {
  --accent: #a3aed3;   /* biru lavender */
  --accent2: #e9b8c2;  /* pink soft */
}
```

## Teknologi
- Chart.js – grafik
- Leaflet – peta
- OpenWeatherMap API

## Lisensi
MIT
