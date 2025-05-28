import { supabase } from "../../utils/supabaseClient";
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { nama, noHp, email, jawaban, score } = req.body;
    console.log("Data yang diterima:", req.body);

    if (!nama || !noHp || !email || !jawaban || typeof score !== "number") {
      return res
        .status(400)
        .json({ error: "Data tidak lengkap atau format salah" });
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
