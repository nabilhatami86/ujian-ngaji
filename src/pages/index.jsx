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
    { simbol: "ــُ", arti: "Dlammah" },
    { simbol: "ــِـ", arti: "Kasrah" },
    { simbol: "ــَـ", arti: "Fathah" },
    "ي",
    "ء",
    "هـ",
    "و",
    "ن",
    { simbol: "ــّـ", arti: "Tasydid" },
    { simbol: "ــٌـ", arti: "Dlammatain" },
    { simbol: "ــٍـ", arti: "Kasratain" },
    { simbol: "ــًـ", arti: "Fathatain" },
    { simbol: "ــْـ", arti: "Sukun" },
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
                  const isObj = typeof item === "object" && item !== null;

                  return (
                    <td
                      key={isObj ? item.simbol : item}
                      onClick={() => toggleJawaban(kategori, item)}
                      style={{
                        border: "1px solid #999",
                        padding: "15px 10px",
                        cursor: "pointer",
                        backgroundColor: dipilih ? "#90ee90" : "white",
                        userSelect: "none",
                        fontSize: isObj ? 24 : 20,
                        verticalAlign: "middle",
                        minWidth: 60,
                        height: 70,
                      }}
                      title={
                        dipilih ? "Klik untuk batal pilih" : "Klik untuk pilih"
                      }
                    >
                      {isObj ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            lineHeight: 1.1,
                          }}
                        >
                          <span style={{ fontSize: 30 }}>{item.simbol}</span>
                          <span
                            style={{
                              fontSize: 12,
                              marginTop: 4,
                              color: "#555",
                            }}
                          >
                            {item.arti}
                          </span>
                        </div>
                      ) : (
                        item
                      )}
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
        fontSize: 15,
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: 24,
          marginBottom: 20,
        }}
      >
        TES SELEKSI 300 ASESOR BACA AL-QUR'AN
      </h1>

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
        style={{
          width: "100%",
          padding: 10,
          fontSize: 16,
          marginBottom: 5,
          border: "1px solid #ccc",
          borderRadius: 6,
          boxSizing: "border-box",
        }}
      />
      {errorNama && (
        <div
          style={{
            color: "red",
            marginBottom: 10,
            fontSize: 14,
          }}
        >
          {errorNama}
        </div>
      )}

      <input
        type="text"
        placeholder="Masukkan nomor HP (contoh: 08123456789)"
        value={noHp}
        onChange={(e) => {
          setNoHp(e.target.value);
          setErrorNoHp(
            noHpRegex.test(e.target.value)
              ? ""
              : "Nomor HP harus diawali +62 atau 08, dan 8-13 digit"
          );
        }}
        style={{
          width: "100%",
          padding: 10,
          fontSize: 16,
          marginBottom: 5,
          border: "1px solid #ccc",
          borderRadius: 6,
          boxSizing: "border-box",
        }}
      />
      {errorNoHp && (
        <div
          style={{
            color: "red",
            marginBottom: 10,
            fontSize: 14,
          }}
        >
          {errorNoHp}
        </div>
      )}

      <input
        type="email"
        placeholder="Masukkan email kamu"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setErrorEmail(
            emailRegex.test(e.target.value) ? "" : "Format email tidak valid"
          );
        }}
        style={{
          width: "100%",
          padding: 10,
          fontSize: 16,
          marginBottom: 15,
          border: "1px solid #ccc",
          borderRadius: 6,
          boxSizing: "border-box",
        }}
      />
      {errorEmail && (
        <div
          style={{
            color: "red",
            marginBottom: 10,
            fontSize: 14,
          }}
        >
          {errorEmail}
        </div>
      )}

      {renderTable(
        "makharij",
        "Makharij Huruf dan Tanda Vokal",
        dataQuiz.makharij,
        8
      )}
      {renderTable("shifat", "Shifat Huruf", dataQuiz.shifat, 8)}
      {renderTable("ahkamHuruf", "Ahkam Huruf", dataQuiz.ahkamHuruf, 5)}
      {renderTable("ahkamMad", "Ahkam Mad", dataQuiz.ahkamMad, 5)}

      <button
        onClick={handleSubmit}
        disabled={
          loading ||
          errorNama ||
          errorNoHp ||
          errorEmail ||
          !nama ||
          !noHp ||
          !email
        }
        style={{
          padding: "12px 30px",
          fontSize: 16,
          cursor: loading ? "not-allowed" : "pointer",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: 5,
          marginTop: 15,
          width: "100%",
        }}
      >
        {loading ? "Mengirim..." : "Submit Jawaban"}
      </button>

      {hasil && (
        <div style={{ marginTop: 15 }}>
          <h3>Hasil:</h3>
          <p>Skor mentah: {hasil.nilaiMentah.toFixed(2)}</p>
          <p>Persentase nilai: {hasil.nilaiPersen}%</p>
          <p>Total soal: {hasil.totalSoal}</p>
        </div>
      )}

      {successMsg && (
        <div style={{ color: "green", marginTop: 15 }}>{successMsg}</div>
      )}

      {error && <div style={{ color: "red", marginTop: 15 }}>{error}</div>}
    </div>
  );
}
