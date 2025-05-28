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

const namaRegex = /^[a-zA-Z\s]{3,}$/;
const noHpRegex = /^(\+62|08)[0-9]{8,13}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [noHp, setNoHp] = useState("");
  const [email, setEmail] = useState("");

  const [errorNama, setErrorNama] = useState("");
  const [errorNoHp, setErrorNoHp] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  function toggleJawaban(kategori, item) {
    setJawabanUser((prev) => {
      const sudahPilih = prev[kategori].includes(item);
      let updated = sudahPilih
        ? prev[kategori].filter((x) => x !== item)
        : [...prev[kategori], item];
      return { ...prev, [kategori]: updated };
    });
  }

  function cekJawaban() {
    const totalSoal =
      dataQuiz.makharij.length +
      dataQuiz.shifat.length +
      dataQuiz.ahkamHuruf.length +
      dataQuiz.ahkamMad.length;

    let skor = 0;

    for (const kategori in jawabanUser) {
      jawabanUser[kategori].forEach((item) => {
        if (jawabanBenar[kategori].includes(item)) {
          skor += 7.2;
        } else {
          skor -= 2;
        }
      });
    }

    const maxScore = totalSoal * 7.3;
    const nilaiPersen = Math.round((skor / maxScore) * 100);

    setHasil({ skor, totalSoal, nilaiPersen, nilaiMentah: skor });
    return skor;
  }

  const handleSubmit = async () => {
    setError(null);
    setSuccessMsg(null);

    if (errorNama || errorNoHp || errorEmail || !nama || !noHp || !email)
      return;

    const nilai = cekJawaban();
    setLoading(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          noHp,
          email,
          jawaban: jawabanUser,
          score: nilai,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal submit");

      setSuccessMsg("Jawaban berhasil disimpan ke database!");
      setNama("");
      setNoHp("");
      setEmail("");
      setJawabanUser({
        makharij: [],
        shifat: [],
        ahkamHuruf: [],
        ahkamMad: [],
      });
      setHasil(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (kategori, judul, items, columns) => (
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
                        dipilih ? "Klik untuk batal pilih" : "Klik untuk pilih"
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
        onChange={(e) => {
          setNama(e.target.value);
          setErrorNama(
            namaRegex.test(e.target.value)
              ? ""
              : "Minimal 3 huruf. Huruf saja ya!"
          );
        }}
        style={{ marginBottom: 5, width: "100%", padding: 10, fontSize: 16 }}
      />
      {errorNama && (
        <div style={{ color: "red", marginBottom: 10 }}>{errorNama}</div>
      )}

      <input
        type="text"
        placeholder="Masukkan nomor hp kamu"
        value={noHp}
        onChange={(e) => {
          setNoHp(e.target.value);
          setErrorNoHp(
            noHpRegex.test(e.target.value)
              ? ""
              : "Gunakan format +62 atau 08..."
          );
        }}
        style={{ marginBottom: 5, width: "100%", padding: 10, fontSize: 16 }}
      />
      {errorNoHp && (
        <div style={{ color: "red", marginBottom: 10 }}>{errorNoHp}</div>
      )}

      <input
        type="email"
        placeholder="Masukkan email kamu"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setErrorEmail(
            emailRegex.test(e.target.value) ? "" : "Format email tidak valid."
          );
        }}
        style={{ marginBottom: 5, width: "100%", padding: 10, fontSize: 16 }}
      />
      {errorEmail && (
        <div style={{ color: "red", marginBottom: 10 }}>{errorEmail}</div>
      )}

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

      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
      {hasil && (
        <div style={{ marginTop: 20 }}>
          <p>Skor Mentah: {hasil.nilaiMentah}</p>
          <p>Persentase Nilai: {hasil.nilaiPersen}%</p>
        </div>
      )}
    </div>
  );
}
