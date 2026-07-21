import { useState, useEffect } from "react";
const BookDetailModal = ({
  isOpen,
  buku,
  onClose,
  role,
  onEditClick,
  onDeleteClick,
  onPinjamClick,
  currentUser,
  showAlert,
  URL,
}) => {
  const [ulasanList, setUlasanList] = useState([]);
  const [rataRata, setRataRata] = useState(0);
  const [totalUlasan, setTotalUlasan] = useState(0);

  // State untuk form ulasan baru
  const [ratingInput, setRatingInput] = useState(5);
  const [komentarInput, setKomentarInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshUlasan, setRefreshUlasan] = useState(0);

  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);

  const [isEditingReview, setIsEditingReview] = useState(false);
  const [editUlasanId, setEditUlasanId] = useState(null);

  const handleCloseModal = () => {
    setIsEditingReview(false);
    setEditUlasanId(null);
    setRatingInput(5);
    setKomentarInput("");
    onClose(); // Panggil fungsi asli dari parent
  };

  // Ambil ulasan setiap kali buku dibuka
  useEffect(() => {
    if (isOpen && buku) {
      const fetchUlasan = async () => {
        try {
          const res = await fetch(`${URL}/api/ulasan/buku/${buku.id_buku}`, {
            headers: { "ngrok-skip-browser-warning": "true" },
          });
          const result = await res.json();
          if (result.success) {
            setUlasanList(result.data);
            setRataRata(result.rataRata);
            setTotalUlasan(result.totalUlasan);
          }
          // eslint-disable-next-line no-unused-vars
        } catch (err) {
          console.error("Gagal memuat ulasan");
        }
      };
      fetchUlasan();
    }
  }, [isOpen, buku, refreshUlasan, URL]);

  const handleSubmitUlasan = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setIsSubmitting(true);
      const url = isEditingReview
        ? `${URL}/api/ulasan/${editUlasanId}`
        : `${URL}/api/ulasan`;
      const method = isEditingReview ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          id_buku: buku.id_buku,
          id_user: currentUser.id_user,
          rating: ratingInput,
          komentar: komentarInput,
        }),
      });
      const result = await res.json();

      if (result.success) {
        if (showAlert) showAlert("success", "Berhasil", result.message);
        setIsEditingReview(false);
        setEditUlasanId(null);
        setKomentarInput("");
        setRatingInput(5);
        setRefreshUlasan((prev) => prev + 1); // Refresh daftar ulasan
      } else {
        if (showAlert) showAlert("error", "Gagal", result.message);
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      if (showAlert) showAlert("error", "Error", "Gagal mengirim ulasan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUlasan = (ulasan) => {
    setIsEditingReview(true);
    setEditUlasanId(ulasan.id_ulasan);
    setRatingInput(ulasan.rating);
    setKomentarInput(ulasan.komentar);
  };

  if (!isOpen || !buku) return null;

  // Cek apakah user sudah mereview
  const hasReviewed =
    currentUser && ulasanList.some((u) => u.id_user === currentUser.id_user);

  // Urutkan agar ulasan milik User yang login selalu berada di urutan pertama
  const sortedUlasanList = [...ulasanList].sort((a, b) => {
    if (currentUser) {
      if (a.id_user === currentUser.id_user) return -1;
      if (b.id_user === currentUser.id_user) return 1;
    }
    return 0; // Biarkan urutan sisanya sesuai dari backend (terbaru)
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-5">
          <div className="md:col-span-2 bg-slate-100 h-64 md:h-full min-h-80 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-100">
            {buku.cover_drive_id ? (
              <img
                src={`https://lh3.googleusercontent.com/d/${buku.cover_drive_id}`}
                alt={buku.judul}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <span className="text-6xl block mb-2">📖</span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  No Cover
                </span>
              </div>
            )}
          </div>
          <div className="md:col-span-3 p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center gap-2 mb-4">
                <span className="bg-blue-50 text-blue-600 font-extrabold text-[11px] px-2.5 py-1 rounded-md border border-blue-100 uppercase tracking-wider">
                  {buku.nama_kategori || "Kategori Umum"}
                </span>
                <div className="flex items-center gap-2">
                  <div className="font-mono text-[11px] bg-slate-100 px-2 py-1 rounded-md text-slate-500 font-semibold">
                    ISBN: {buku.isbn || "Tidak Ada"}
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-slate-400 hover:text-slate-600 text-2xl font-bold p-1 leading-none cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 leading-snug mb-2 wrap-break-word">
                {buku.judul}
              </h3>
              <p className="text-sm text-slate-500 mb-6 wrap-break-word">
                Ditulis oleh{" "}
                <span className="font-bold text-slate-800">{buku.penulis}</span>
              </p>
              <div className="space-y-3 text-sm border-t border-b border-slate-100 py-4 mb-6">
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400 font-medium">Penerbit</span>
                  <span className="col-span-2 font-semibold text-slate-700 wrap-break-word">
                    : {buku.penerbit || "-"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400 font-medium">
                    Tahun Terbit
                  </span>
                  <span className="col-span-2 font-semibold text-slate-700">
                    : {buku.tahun_terbit || "-"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400 font-medium">Tingkatan</span>
                  <span className="col-span-2 font-semibold text-slate-700 wrap-break-word">
                    : {buku.tingkatan || "Umum"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400 font-medium">Tata Letak</span>
                  <span className="col-span-2 font-semibold text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded-md border border-blue-100/50 w-fit text-xs">
                    🏢 Lemari {buku.no_lemari}, Rak {buku.no_rak}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col pt-4 mt-4 border-t border-slate-100 gap-4">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                  Total Ketersediaan
                </span>
                <span
                  className={`text-xl font-black block ${buku.stok > 0 ? "text-slate-900" : "text-rose-600"}`}
                >
                  {buku.stok} Eksemplar
                </span>
              </div>

              {/* ---> BLOK ULASAN & RATING <--- */}
              <div className="mt-6 border-t border-slate-100 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold text-slate-800">
                    Ulasan Pembaca
                  </h4>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                    <span className="text-amber-500">⭐</span>
                    <span className="text-xs font-bold text-amber-700">
                      {rataRata} ({totalUlasan} Ulasan)
                    </span>
                  </div>
                </div>

                {/* Form Tambah Ulasan */}
                {/* Form HANYA muncul jika: belum direview ATAU sedang mode edit. Dan yang login bukan admin */}
                {currentUser && (!hasReviewed || isEditingReview) && (
                  <form
                    onSubmit={handleSubmitUlasan}
                    className="mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        {isEditingReview
                          ? "Edit Penilaian Anda:"
                          : "Beri Penilaian Anda:"}
                      </p>
                      {isEditingReview && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingReview(false);
                            setRatingInput(5);
                            setKomentarInput("");
                          }}
                          className="text-[10px] text-slate-400 hover:text-rose-500 font-bold underline"
                        >
                          Batal Edit
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingInput(star)}
                          className={`text-xl transition-transform hover:scale-110 cursor-pointer ${star <= ratingInput ? "text-amber-400" : "text-slate-300 dark:text-slate-600 grayscale"}`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows="2"
                      value={komentarInput}
                      onChange={(e) => setKomentarInput(e.target.value)}
                      placeholder="Bagaimana pendapat Anda tentang buku ini?"
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-hidden focus:border-blue-500 dark:bg-slate-700 dark:text-white mb-2 resize-none transition-colors"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer transition-colors"
                      >
                        {isSubmitting
                          ? "Menyimpan..."
                          : isEditingReview
                            ? "Simpan Perubahan"
                            : "Kirim Ulasan"}
                      </button>
                    </div>
                  </form>
                )}

                {/* ---> DAFTAR ULASAN (Tampilkan HANYA 1) <--- */}
                <div className="space-y-3">
                  {sortedUlasanList.length > 0 ? (
                    <>
                      {/* Gunakan sortedUlasanList agar ulasan user selalu di atas */}
                      {sortedUlasanList.slice(0, 1).map((ulasan) => (
                        <div
                          key={ulasan.id_ulasan}
                          className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 relative transition-colors"
                        >
                          {/* Jika ulasan ini milik user, tampilkan tombol Edit */}
                          {currentUser &&
                            ulasan.id_user === currentUser.id_user &&
                            !isEditingReview && (
                              <button
                                onClick={() => handleEditUlasan(ulasan)}
                                className="absolute top-3 right-3 text-[10px] font-bold text-amber-600 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-800/50 px-2 py-1 rounded-md transition-colors cursor-pointer"
                              >
                                ✏️ Edit
                              </button>
                            )}

                          <div className="flex justify-between items-start mb-1 pr-16">
                            <div>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                                {ulasan.nama}{" "}
                                <span className="font-normal text-[10px] text-slate-400">
                                  ({ulasan.peran})
                                </span>
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(ulasan.created_at).toLocaleDateString(
                                "id-ID",
                              )}
                            </span>
                          </div>
                          <div className="flex text-xs mb-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={
                                  i < ulasan.rating
                                    ? "text-amber-400"
                                    : "grayscale opacity-50"
                                }
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {ulasan.komentar}
                          </p>
                        </div>
                      ))}

                      {/* Tombol Lihat Semua (Muncul jika ulasan lebih dari 1) */}
                      {ulasanList.length > 1 && (
                        <button
                          onClick={() => setIsReviewsModalOpen(true)}
                          className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-blue-100"
                        >
                          Lihat Semua {totalUlasan} Ulasan
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4 text-xs text-slate-400 font-medium">
                      Belum ada ulasan. Jadilah yang pertama!
                    </div>
                  )}
                </div>
              </div>

              {/* ---> POPUP KHUSUS SEMUA ULASAN <--- */}
              {isReviewsModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-60 animate-fadeIn">
                  <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 border border-slate-100 flex flex-col max-h-[85vh]">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Semua Ulasan
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          {buku.judul}
                        </p>
                      </div>
                      <button
                        onClick={() => setIsReviewsModalOpen(false)}
                        className="text-slate-400 hover:text-slate-600 text-2xl font-bold leading-none cursor-pointer"
                      >
                        &times;
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mb-6 bg-amber-50 p-4 rounded-xl border border-amber-100">
                      <span className="text-3xl">⭐</span>
                      <div>
                        <span className="text-2xl font-black text-amber-600 block leading-none">
                          {rataRata}
                        </span>
                        <span className="text-xs font-bold text-amber-700">
                          Dari total {totalUlasan} penilaian
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                      {ulasanList.map((ulasan) => (
                        <div
                          key={ulasan.id_ulasan}
                          className="bg-slate-50 p-4 rounded-xl border border-slate-100"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="text-sm font-bold text-slate-800 block">
                                {ulasan.nama}
                              </span>
                              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                                {ulasan.peran}
                              </span>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-400">
                              {new Date(ulasan.created_at).toLocaleDateString(
                                "id-ID",
                              )}
                            </span>
                          </div>
                          <div className="flex text-sm mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={
                                  i < ulasan.rating
                                    ? "text-amber-400"
                                    : "grayscale opacity-50"
                                }
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {ulasan.komentar}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* ---> AKHIR BLOK ULASAN <--- */}
              <div className="flex items-center gap-2 justify-end w-full">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Tutup
                </button>

                {role === "admin" && (
                  <>
                    <button
                      onClick={() => onEditClick(buku)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-xs transition-all cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteClick(buku.id_buku)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-all cursor-pointer"
                    >
                      Hapus
                    </button>
                  </>
                )}

                <button
                  disabled={buku.stok <= 0}
                  onClick={() => onPinjamClick(buku)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all cursor-pointer ${
                    buku.stok > 0
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {buku.stok > 0 ? "Pinjam" : "Habis"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailModal;
