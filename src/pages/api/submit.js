import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log(
  "Supabase KEY:",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 10) + "..."
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { nama, jawaban, score } = req.body;

    // Validasi dasar
    if (!nama || !jawaban || typeof score !== "number") {
      return res
        .status(400)
        .json({ error: "Data tidak lengkap atau format salah" });
    }

    // Insert ke Supabase
    const { data, error } = await supabase
      .from("ujian") // GANTI dengan nama tabelmu di Supabase
      .insert([
        {
          nama,
          jawaban, // pastikan kolom ini di Supabase bertipe JSON
          score,
        },
      ]);

    if (error) {
      console.error("Supabase insert error:", error.message, error.details);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: "Data berhasil disimpan", data });
  } catch (err) {
    console.error("Error di try-catch API submit:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
