import { supabase } from "../../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { nama, noHp, email, jawaban, score } = req.body;

    if (!nama || !noHp || !email || !jawaban || typeof score !== "number") {
      return res
        .status(400)
        .json({ error: "Data tidak lengkap atau format salah" });
    }

    // 🔍 Cek apakah kombinasi nama + email sudah pernah submit
    const { data: existing, error: checkError } = await supabase
      .from("ujian")
      .select("id")
      .eq("nama", nama)
      .eq("email", email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // Error selain "no rows"
      console.error("Error saat cek data:", checkError);
      return res.status(500).json({ error: "Gagal mengecek data sebelumnya" });
    }

    if (existing) {
      return res
        .status(400)
        .json({
          error: "Kamu sudah pernah mengisi, tidak bisa mengisi dua kali.",
        });
    }

    const { data, error } = await supabase
      .from("ujian")
      .insert([{ noHp, email, nama, jawaban, score }]);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: "Data berhasil disimpan", data });
  } catch (err) {
    console.error("Error di API /submit:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
