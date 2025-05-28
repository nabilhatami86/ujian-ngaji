import { useState } from "react";

const dataQuiz = {
  makharij: [
    "د",
    "خ",
    "ح",
    "ج",
    "ث",
    "ت",
    "ب",
    "ا",
    "ط",
    "ض",
    "ص",
    "ش",
    "س",
    "ز",
    "ر",
    "ذ",
    "م",
    "ل",
    "ك",
    "ق",
    "ف",
    "غ",
    "ع",
    "ظ",
    "ــُ",
    "ــِـ",
    "ــَـ",
    "ي",
    "ء",
    "هـ",
    "و",
    "ن",
    "ــّـ",
    "ــٌـ",
    "ــٍـ",
    "ــًـ",
    "ــْـ",
  ],

  shifat: [
    "د",
    "خ",
    "ح",
    "ج",
    "ث",
    "ت",
    "ب",
    "ا",
    "ط",
    "ض",
    "ص",
    "ش",
    "س",
    "ز",
    "ر",
    "ذ",
    "م",
    "ل",
    "ك",
    "ق",
    "ف",
    "غ",
    "ع",
    "ظ",

    "ي",
    "ء",
    "هـ",
    "و",
    "ن",
  ],
  ahkamHuruf: [
    "Izhhar",
    "Izhhar Syafawi",
    "Idzgham Bighunnah",
    "Ikhfa’ Syafawi",
    "Idzgham Bilaghunnah",
    "Idzgham Mimi",
    "Ikhfa’",
    "Idzgham Mutajannisain",
    "Iqlab",
    "Idzgham Mutaqarribain",
  ],
  ahkamMad: [
    "Mad Thabi’i",
    "Mad Lazim Kilmi Mutsaqqal",
    "Mad Wajib Muttashil",
    "Mad Lazim Kilmi Mukhaffaf",
    "Mad Jaiz Munfashil",
    "Mad Lazim Harfi Mutsaqqal",
    "Mad Iwadz",
    "Mad Lazim Harfi Mukhaffaf",
    "Mad Lin",
    "Mad Badal",
    "Mad Aridlissukun",
    "Mad Shilah Qashirah",
    "Mad Tamkin",
    "Mad Shilah Thawilah",
    "Mad Farq",
  ],
};

const jawabanBenar = {
  makharij: ["ذ", "ح", "ع", "ر", "ظ", "ــّـ"],
  shifat: ["ذ", "د", "ر", "ظ"],
  ahkamHuruf: ["Idzgham Bighunnah", "Idzgham Mimi", "Ikhfa’"],
  ahkamMad: ["Mad Lazim Harfi Mutsaqqal"],
};

export default function Home() {
  const [jawabanUser, setJawabanUser] = useState({
    makharij: [],
    shifat: [],
    ahkamHuruf: [],
    ahkamMad: [],
  });

  const [hasil, setHasil] = useState(null);
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  function toggleJawaban(kategori, item) {
    setJawabanUser((prev) => {
      const sudahPilih = prev[kategori].includes(item);
      let updated;
      if (sudahPilih) {
        updated = prev[kategori].filter((x) => x !== item);
      } else {
        updated = [...prev[kategori], item];
      }
      return { ...prev, [kategori]: updated };
    });
  }

  function cekJawaban() {
    let totalSoal =
      dataQuiz.makharij.length +
      dataQuiz.shifat.length +
      dataQuiz.ahkamHuruf.length +
      dataQuiz.ahkamMad.length;

    let benar = 0;

    for (const kategori in jawabanUser) {
      jawabanUser[kategori].forEach((item) => {
        if (jawabanBenar[kategori].includes(item)) benar++;
      });
      jawabanUser[kategori].forEach((item) => {
        if (!jawabanBenar[kategori].includes(item)) benar--;
      });
    }

    if (benar < 0) benar = 0;
    if (benar > totalSoal) benar = totalSoal;

    const nilai = Math.round((benar / totalSoal) * 100);

    setHasil({ benar, totalSoal, nilai });

    return nilai;
  }
  async function handleSubmit() {
    setError(null);
    setSuccessMsg(null);

    if (!nama.trim()) {
      setError("Nama harus diisi!");
      return;
    }

    const nilai = cekJawaban();

    console.log("Mengirim data ke backend:", {
      nama,
      jawaban: jawabanUser,
      score: nilai,
    });

    setLoading(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama,
          jawaban: jawabanUser,
          score: nilai,
        }),
      });

      console.log("Response status:", res.status);

      const data = await res.json();
      console.log("Response data:", data);

      if (!res.ok) throw new Error(data.error || "Gagal submit");

      setSuccessMsg("Jawaban berhasil disimpan ke database!");
      setNama("");
      setJawabanUser({
        makharij: [],
        shifat: [],
        ahkamHuruf: [],
        ahkamMad: [],
      });
      setHasil(null);
    } catch (e) {
      console.error("Error submit:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function renderTable(kategori, judul, items, columns) {
    return (
      <div style={{ marginBottom: 40 }}>
        <h2>{judul}</h2>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            textAlign: "center",
          }}
        >
          <tbody>
            {[...Array(Math.ceil(items.length / columns))].map((_, rowIdx) => (
              <tr key={rowIdx}>
                {items
                  .slice(rowIdx * columns, rowIdx * columns + columns)
                  .map((item) => {
                    const dipilih = jawabanUser[kategori].includes(item);
                    return (
                      <td
                        key={item}
                        onClick={() => toggleJawaban(kategori, item)}
                        style={{
                          border: "1px solid #999",
                          padding: "10px",
                          cursor: "pointer",
                          backgroundColor: dipilih ? "#90ee90" : "white",
                          userSelect: "none",
                        }}
                        title={
                          dipilih
                            ? "Klik untuk batal pilih"
                            : "Klik untuk pilih"
                        }
                      >
                        {item}
                      </td>
                    );
                  })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "auto",
        padding: 20,
        fontFamily: "LPMQ",
        fontSize: 20,
      }}
    >
      <h1>TES SELEKSI 300 ASESOR BACA AL-QUR'AN</h1>

      <input
        type="text"
        placeholder="Masukkan nama kamu"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        style={{ marginBottom: 20, width: "100%", padding: 10, fontSize: 16 }}
      />
      <input
        type="text"
        placeholder="Masukkan nomor hp kamu"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        style={{ marginBottom: 20, width: "300px", padding: 10, fontSize: 16 }}
      />
      <input
        type="text"
        placeholder="Masukkan email kamu"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        style={{ marginBottom: 20, width: "100%", padding: 10, fontSize: 16 }}
      />

      {renderTable("makharij", "Makharijul Huruf", dataQuiz.makharij, 8)}
      {renderTable("shifat", "Shifatul Huruf", dataQuiz.shifat, 8)}
      {renderTable("ahkamHuruf", "Ahkamul Huruf", dataQuiz.ahkamHuruf, 3)}
      {renderTable("ahkamMad", "Ahkamul Mad Wal Qashr", dataQuiz.ahkamMad, 3)}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: "15px 30px",
          fontSize: 18,
          cursor: "pointer",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: 5,
        }}
      >
        {loading ? "Mengirim..." : "Kirim Jawaban"}
      </button>

      {error && <p style={{ color: "red", marginTop: 15 }}>{error}</p>}
      {successMsg && (
        <p style={{ color: "green", marginTop: 15 }}>{successMsg}</p>
      )}

      {hasil && (
        <div style={{ marginTop: 20 }}>
          <h3>Hasil:</h3>
          <p>
            Benar: {hasil.benar} / {hasil.totalSoal}
          </p>
          <p>Nilai: {hasil.nilai}</p>
        </div>
      )}
    </div>
  );
}
