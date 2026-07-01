const BookDetailModal = ({
  isOpen,
  buku,
  onClose,
  role,
  onEditClick,
  onDeleteClick,
  onPinjamClick,
}) => {
  if (!isOpen || !buku) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-100">
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
                    onClick={onClose}
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
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                  Total Ketersediaan
                </span>
                <span
                  className={`text-lg font-black ${buku.stok > 0 ? "text-slate-900" : "text-rose-600"}`}
                >
                  {buku.stok} Eksemplar
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                {/* LOGIKA TOMBOL BERDASARKAN ROLE */}
                {role === "admin" ? (
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
                ) : (
                  <button
                    disabled={buku.stok <= 0}
                    onClick={() => onPinjamClick(buku)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all cursor-pointer ${
                      buku.stok > 0
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Proses Pinjam
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailModal;
