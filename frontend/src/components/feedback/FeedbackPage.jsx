import { useState, useEffect } from "react";

const FeedbackPage = ({ role, currentUser, showAlert, showConfirm, URL }) => {
  // State untuk Form (Siswa/Pegawai)
  const [kategori, setKategori] = useState("saran");
  const [rating, setRating] = useState(5);
  const [pesan, setPesan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk Daftar (Admin)
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Jika Admin, fetch data feedback
  useEffect(() => {
    if (role === "admin") {
      const fetchFeedback = async () => {
        try {
          setLoading(true);
          const res = await fetch(`${URL}/api/feedback`, {
            headers: { "ngrok-skip-browser-warning": "true" },
          });
          const result = await res.json();
          if (result.success) setFeedbackList(result.data);
          // eslint-disable-next-line no-unused-vars
        } catch (err) {
          showAlert("error", "Error", "Gagal memuat data feedback.");
        } finally {
          setLoading(false);
        }
      };
      fetchFeedback();
    }
    // else { setLoading(false); }  <--- BAGIAN INI DIHAPUS
  }, [role, refreshTrigger, URL, showAlert]);
  // Fungsi Submit (Siswa/Pegawai)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pesan.trim()) {
      showAlert("warning", "Pesan Kosong", "Mohon isi detail feedback Anda.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${URL}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          id_user: currentUser.id_user,
          kategori,
          rating,
          pesan,
        }),
      });
      const result = await res.json();

      if (result.success) {
        showAlert("success", "Terkirim!", result.message);
        setPesan("");
        setRating(5);
        setKategori("saran");
      } else {
        showAlert("error", "Gagal", result.message);
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      showAlert("error", "Error", "Gagal mengirim feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi Update Status (Admin)
  const handleUpdateStatus = async (id, statusBaru) => {
    try {
      const res = await fetch(`${URL}/api/feedback/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ status: statusBaru }),
      });
      const result = await res.json();
      if (result.success) {
        setRefreshTrigger((prev) => prev + 1);
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      showAlert("error", "Error", "Gagal mengubah status.");
    }
  };

  // Memuat data hanya berlaku untuk Admin, jika Siswa/Pegawai langsung tampilkan Form
  if (loading && role === "admin")
    return (
      <div className="text-center py-20 animate-pulse text-slate-500 font-bold">
        Memuat...
      </div>
    );

  // ---> TAMPILAN UNTUK ADMIN <---
  if (role === "admin") {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Kotak Feedback
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-white">
            Lihat masukan, saran, dan laporan bug dari pengguna website.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">
                  Pengirim
                </th>
                <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">
                  Rating
                </th>
                <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 w-1/2">
                  Pesan
                </th>
                <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {feedbackList.length > 0 ? (
                feedbackList.map((fb) => (
                  <tr
                    key={fb.id_feedback}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {fb.nama}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-blue-600">
                        {fb.peran}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {new Date(fb.created_at).toLocaleDateString("id-ID")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < fb.rating
                                ? "text-amber-400"
                                : "text-slate-300 dark:text-slate-600"
                            }
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold uppercase mt-1 block text-slate-500">
                        Kategori: {fb.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs leading-relaxed">
                      {fb.pesan}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select
                        value={fb.status}
                        onChange={(e) =>
                          handleUpdateStatus(fb.id_feedback, e.target.value)
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border focus:outline-hidden cursor-pointer ${
                          fb.status === "baru"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : fb.status === "dibaca"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        <option value="baru">Baru</option>
                        <option value="dibaca">Sedang Diproses</option>
                        <option value="selesai">Selesai</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-10">
                    Belum ada feedback yang masuk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ---> TAMPILAN UNTUK SISWA/PEGAWAI <---
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Beri Umpan Balik
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Bantu kami meningkatkan kualitas website perpustakaan ini!
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700"
      >
        <div className="mb-5">
          <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
            Seberapa puaskah Anda dengan website ini?
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-3xl transition-transform hover:scale-110 cursor-pointer ${star <= rating ? "text-amber-400" : "text-slate-200 dark:text-slate-600 grayscale"}`}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
            Kategori Feedback
          </label>
          <div className="flex flex-wrap gap-3">
            {["saran", "bug", "pujian", "lainnya"].map((kat) => (
              <label
                key={kat}
                className={`px-4 py-2 rounded-xl text-sm font-bold border cursor-pointer transition-colors ${kategori === kat ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600"}`}
              >
                <input
                  type="radio"
                  name="kategori"
                  value={kat}
                  checked={kategori === kat}
                  onChange={(e) => setKategori(e.target.value)}
                  className="hidden"
                />
                {kat === "bug"
                  ? "🐞 Laporkan Error"
                  : kat === "saran"
                    ? "💡 Beri Saran"
                    : kat === "pujian"
                      ? "❤️ Pujian"
                      : "💬 Lainnya"}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
            Tulis Pesan Anda
          </label>
          <textarea
            required
            rows="5"
            value={pesan}
            onChange={(e) => setPesan(e.target.value)}
            placeholder="Ketik detail saran, masalah yang Anda alami, atau masukan lainnya di sini..."
            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white resize-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md cursor-pointer transition-colors"
        >
          {isSubmitting ? "Mengirim..." : "Kirim Feedback"}
        </button>
      </form>
    </div>
  );
};

export default FeedbackPage;
