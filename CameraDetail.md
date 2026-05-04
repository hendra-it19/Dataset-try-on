# Camera & Bounding Box Configuration Detail

Dokumen ini merangkum seluruh konfigurasi kamera dan bounding box yang digunakan dalam aplikasi pengumpulan dataset VTON (Virtual Try-On). Gunakan referensi ini untuk memastikan konsistensi saat deploy model virtual try-on di aplikasi Python.

---

## 1. Konfigurasi Kamera

### Jenis Kamera

| Parameter    | Nilai                                                                |
| ------------ | -------------------------------------------------------------------- |
| `facingMode` | `"user"` (kamera depan / front camera)                               |
| `mirrored`   | `true` (tampilan seperti cermin)                                     |
| `audio`      | `false` (tanpa audio)                                                |
| Zoom         | Tidak ada zoom tambahan, menggunakan FOV natural kamera              |
| Resolusi     | Menggunakan resolusi default/native kamera (tanpa constraint khusus) |

### Posisi Kamera

- Kamera dipegang/ditempatkan **sejajar tinggi perut** pengguna
- Orientasi: **portrait (tegak)**

### Mirroring (Pencerminan)

- **Preview di layar**: Di-mirror (`mirrored: true`) — berperilaku seperti cermin
- **Video yang direkam**: Menggunakan stream asli dari `MediaRecorder` (tidak di-mirror)
- **Penting untuk Python**: Video hasil rekaman (`video/webm`) **TIDAK di-mirror**. Jika Anda perlu mirror, lakukan `cv2.flip(frame, 1)` di OpenCV

### Format Video

| Parameter        | Nilai                                                |
| ---------------- | ---------------------------------------------------- |
| MIME Type        | `video/webm`                                         |
| Codec            | WebM default (VP8/VP9, tergantung browser)           |
| Object fit (CSS) | `object-contain` (tidak ada cropping, tampilan utuh) |

---

## 2. Bounding Box Layout

Bounding box menggunakan **absolute positioning** relatif terhadap fullscreen viewport.

### Dimensi Area (dalam persen viewport)

```
┌─────────────────────────────────┐
│        TOP DARK AREA (8%)       │
├────┬───────────────────────┬────┤
│    │  ▼ Batas Kepala ▼     │    │
│ L  │───────────────────────│ R  │
│ E  │                       │ I  │
│ F  │                       │ G  │
│ T  │    AREA TUBUH         │ H  │
│    │    (body area)        │ T  │
│10% │                       │10% │
│    │                       │    │
│    │───────────────────────│    │
│    │  ▲ Batas Bawah Kaki ▲ │    │
├────┴───────────────────────┴────┤
│       BOTTOM DARK AREA (8%)     │
└─────────────────────────────────┘
```

### Nilai Persentase

| Area             | CSS Class / Nilai                             | Deskripsi                                 |
| ---------------- | --------------------------------------------- | ----------------------------------------- |
| Dark area atas   | `h-[8%]`                                      | 8% dari tinggi viewport                   |
| Dark area bawah  | `h-[8%]`                                      | 8% dari tinggi viewport                   |
| Dark area kiri   | `w-[10%]`                                     | 10% dari lebar viewport                   |
| Dark area kanan  | `w-[10%]`                                     | 10% dari lebar viewport                   |
| **Bounding box** | `top-[8%] bottom-[8%] left-[10%] right-[10%]` | **Lebar: 80%, Tinggi: 84%** dari viewport |

### Konversi ke Piksel (contoh resolusi umum)

Untuk menerapkan bounding box yang sama di Python/OpenCV:

```python
def get_bounding_box(frame_width, frame_height):
    """
    Menghitung koordinat bounding box berdasarkan settingan aplikasi web.

    Returns:
        (x1, y1, x2, y2) - koordinat bounding box
    """
    # Persentase dari konfigurasi CSS
    top_pct = 0.08       # 8% dari atas
    bottom_pct = 0.08    # 8% dari bawah
    left_pct = 0.10      # 10% dari kiri
    right_pct = 0.10     # 10% dari kanan

    x1 = int(frame_width * left_pct)
    y1 = int(frame_height * top_pct)
    x2 = int(frame_width * (1 - right_pct))
    y2 = int(frame_height * (1 - bottom_pct))

    return (x1, y1, x2, y2)


# Contoh penggunaan:
# Resolusi 1080x1920 (portrait)
# x1=108, y1=154, x2=972, y2=1766
# Bounding box: 864x1612 piksel

# Resolusi 720x1280 (portrait)
# x1=72, y1=102, x2=648, y2=1178
# Bounding box: 576x1076 piksel
```

| Resolusi Input | BB x1 | BB y1 | BB x2 | BB y2 | BB Width | BB Height |
| -------------- | ----- | ----- | ----- | ----- | -------- | --------- |
| 1080×1920      | 108   | 154   | 972   | 1766  | 864      | 1612      |
| 720×1280       | 72    | 102   | 648   | 1178  | 576      | 1076      |
| 480×854        | 48    | 68    | 432   | 786   | 384      | 718       |

---

## 3. Garis Batas (Boundary Lines)

### Batas Kepala (Top Boundary)

- Posisi: **Tepi atas** bounding box
- Fungsi: Ujung atas kepala pengguna harus berada di bawah garis ini
- Label: `"▼ Batas Kepala ▼"`
- Memiliki padding area (~24px) dengan background semi-transparan `bg-black/40`

### Batas Bawah Kaki (Bottom Boundary)

- Posisi: **Tepi bawah** bounding box
- Fungsi: Ujung bawah kaki pengguna harus berada di atas garis ini
- Label: `"▲ Batas Bawah Kaki ▲"`
- Memiliki padding area (~24px) dengan background semi-transparan `bg-black/40`

### Estimasi Area Tubuh Efektif

Dengan memperhitungkan padding label atas dan bawah (~2-3% masing-masing), area tubuh efektif:

```python
def get_effective_body_area(frame_width, frame_height):
    """
    Area efektif di mana tubuh pengguna seharusnya berada,
    setelah memperhitungkan padding label atas/bawah.
    """
    label_padding_pct = 0.03  # ~3% untuk label padding

    x1 = int(frame_width * 0.10)
    y1 = int(frame_height * (0.08 + label_padding_pct))   # 11% dari atas
    x2 = int(frame_width * 0.90)
    y2 = int(frame_height * (0.92 - label_padding_pct))   # 89% dari bawah

    return (x1, y1, x2, y2)
```

---

## 4. Alur Penggunaan Kamera

> **Catatan**: Pada aplikasi web pengumpulan dataset, perekaman menggunakan countdown dan durasi terbatas. Namun pada saat deploy model VTON, kamera berjalan **real-time tanpa batas waktu** — hasil virtual try-on langsung ditampilkan secara live.

### Settingan untuk Deploy Real-Time

- Kamera berjalan terus-menerus (streaming)
- Setiap frame diproses langsung oleh model VTON
- Bounding box dan area tubuh tetap menggunakan persentase yang sama seperti di atas
- Tidak ada countdown atau durasi rekaman

---

## 5. Instruksi untuk Pengguna

Berikut instruksi yang ditampilkan di aplikasi:

1. **Posisi kamera**: "Simpan kamera sejajar tinggi perut Anda"
2. **Pakaian Before**: "Harap gunakan pakaian ketat/fitting (seperti kaos dalam)"
3. **Pakaian After**: "Harap gunakan pakaian kemeja"
4. **Posisi tubuh**: "Pastikan seluruh tubuh dari kepala hingga kaki masuk dalam area garis putus-putus"

---

## 6. Referensi Kode Implementasi Python

Berikut template lengkap untuk memproses video dengan bounding box yang konsisten:

```python
import cv2
import numpy as np


class VTONVideoProcessor:
    """
    Processor video VTON yang konsisten dengan settingan kamera web app.
    """

    # Konfigurasi bounding box (dari CSS web app)
    TOP_PCT = 0.08
    BOTTOM_PCT = 0.08
    LEFT_PCT = 0.10
    RIGHT_PCT = 0.10
    LABEL_PADDING_PCT = 0.03

    def __init__(self, video_path: str):
        self.cap = cv2.VideoCapture(video_path)
        self.frame_width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.frame_height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        self.fps = self.cap.get(cv2.CAP_PROP_FPS)

    def get_bounding_box(self) -> tuple[int, int, int, int]:
        """Koordinat bounding box keseluruhan (x1, y1, x2, y2)."""
        x1 = int(self.frame_width * self.LEFT_PCT)
        y1 = int(self.frame_height * self.TOP_PCT)
        x2 = int(self.frame_width * (1 - self.RIGHT_PCT))
        y2 = int(self.frame_height * (1 - self.BOTTOM_PCT))
        return (x1, y1, x2, y2)

    def get_body_area(self) -> tuple[int, int, int, int]:
        """Area tubuh efektif setelah padding label (x1, y1, x2, y2)."""
        x1 = int(self.frame_width * self.LEFT_PCT)
        y1 = int(self.frame_height * (self.TOP_PCT + self.LABEL_PADDING_PCT))
        x2 = int(self.frame_width * (1 - self.RIGHT_PCT))
        y2 = int(self.frame_height * (1 - self.BOTTOM_PCT - self.LABEL_PADDING_PCT))
        return (x1, y1, x2, y2)

    def crop_body(self, frame: np.ndarray) -> np.ndarray:
        """Crop frame ke area tubuh efektif."""
        x1, y1, x2, y2 = self.get_body_area()
        return frame[y1:y2, x1:x2]

    def extract_frames(self, interval_ms: int = 1000) -> list[np.ndarray]:
        """Ekstrak frame pada interval tertentu."""
        frames = []
        while self.cap.isOpened():
            ret, frame = self.cap.read()
            if not ret:
                break

            pos_ms = self.cap.get(cv2.CAP_PROP_POS_MSEC)
            if pos_ms % interval_ms < (1000 / self.fps):
                cropped = self.crop_body(frame)
                frames.append(cropped)

        return frames

    def release(self):
        self.cap.release()


# === Contoh Penggunaan ===
# processor = VTONVideoProcessor("video_before.webm")
# bbox = processor.get_bounding_box()
# body = processor.get_body_area()
# frames = processor.extract_frames(interval_ms=500)
# processor.release()
```

---

## 7. Catatan Penting

> **Video Mirroring**: Preview di web app di-mirror (seperti cermin), tetapi video yang tersimpan menggunakan stream asli dari `MediaRecorder`. Artinya video yang disimpan di server **TIDAK di-mirror**. Pastikan Anda tidak melakukan flip tambahan saat memproses video di Python, kecuali memang diperlukan oleh model VTON Anda.

> **Format Video**: Video disimpan dalam format `video/webm`. Jika model VTON Anda memerlukan format lain (mp4, avi), lakukan konversi menggunakan `ffmpeg` atau `moviepy` sebelum diproses.

> **Aspect Ratio**: Tidak ada constraint aspect ratio yang dipaksakan pada kamera. Resolusi tergantung pada perangkat pengguna. Selalu gunakan persentase (bukan piksel tetap) untuk menghitung bounding box agar tetap konsisten di berbagai resolusi.
