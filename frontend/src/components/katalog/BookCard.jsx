const BookCard = ({ buku, onDetailClick, role, onPinjamClick }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group h-full">
      <div
        onClick={() => onDetailClick(buku)}
        className="h-56 bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden relative cursor-pointer border-b border-slate-100 dark:border-slate-700"
      >
        {buku.cover_drive_id ? (
          <img
            src={`https://lh3.googleusercontent.com/d/${buku.cover_drive_id}`}
            alt={buku.judul}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.parentNode.innerHTML = `
                <div class="text-center p-4 text-slate-400 dark:text-slate-500">
                  <span class="text-3xl block mb-1">🖼️</span>
                  <span class="text-xs font-semibold">Gagal Memuat Gambar</span>
                </div>
              `;
            }}
          />
        ) : (
          <div className="text-center p-4 transition-transform duration-500 group-hover:scale-105">
            <span className="text-4xl block mb-2 opacity-60">📖</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold tracking-wider uppercase">
              Belum Ada Cover
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-slate-900/10 dark:from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="cursor-pointer" onClick={() => onDetailClick(buku)}>
          <h3
            className="text-sm dark:text-white font-bold text-slate-900 leading-snug mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            title={buku.judul}
          >
            {buku.judul}
          </h3>
          <p
            className="text-xs text-slate-500 dark:text-slate-400 truncate"
            title={buku.penulis}
          >
            Oleh:{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {buku.penulis}
            </span>
          </p>
        </div>

        {/* --- MULAI MODIFIKASI LOKASI --- */}
        <div className="mt-3 flex flex-col gap-1.5">
          {/* Label Lokasi (Misal: "Perpustakaan, Smart Corner") */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1.5 rounded-lg text-[11px] text-emerald-700 dark:text-emerald-400 flex items-start gap-1 border border-emerald-100/50 dark:border-emerald-800/50 font-semibold leading-tight">
            <span className="shrink-0 mt-0.5 opacity-80">📍</span>
            <span>{buku.daftar_lokasi || "Lokasi belum ditentukan"}</span>
          </div>

          {/* Kotak Info Lemari & Rak */}
          <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg text-[10px] text-slate-600 dark:text-slate-400 flex justify-between items-center border border-slate-100 dark:border-slate-700 font-medium">
            <span>Lemari {buku.no_lemari || "-"}</span>
            <span className="text-slate-300 dark:text-slate-600 px-1">|</span>
            <span>Rak {buku.no_rak || "-"}</span>
          </div>
        </div>
        {/* --- AKHIR MODIFIKASI LOKASI --- */}

      </div>

      <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex-1 pr-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
            Stok & Rating
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-black block ${buku.stok > 0 ? "text-slate-900 dark:text-slate-100" : "text-rose-600 dark:text-rose-400"}`}
            >
              {buku.stok} Eks
            </span>
            {buku.total_ulasan > 0 && (
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-md border border-amber-100 dark:border-amber-800/50 shrink-0 transition-colors">
                <span className="text-[10px]">⭐</span>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                  {Number(buku.rating_rata).toFixed(1)}
                </span>
              </div>
            )}
            {buku.total_ulasan == 0 && (
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-md border border-amber-100 dark:border-amber-800/50 shrink-0 transition-colors">
                <span className="text-[10px]">⭐</span>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                  0
                </span>
              </div>
            )}
          </div>
        </div>
        
        {role !== "admin" && (
          <button
            disabled={buku.stok <= 0}
            onClick={(e) => {
              e.stopPropagation(); 
              onPinjamClick(buku);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              buku.stok > 0
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
            }`}
          >
            {buku.stok > 0 ? "Pinjam" : "Habis"}
          </button>
        )}
      </div>
    </div>
  );
};

export default BookCard;