const BookCard = ({ buku, onDetailClick, role, onPinjamClick }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group h-full">
      <div
        onClick={() => onDetailClick(buku)}
        className="h-56 bg-slate-100 flex items-center justify-center overflow-hidden relative cursor-pointer border-b border-slate-100"
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
                <div class="text-center p-4 text-slate-400">
                  <span class="text-3xl block mb-1">🖼️</span>
                  <span class="text-xs font-semibold">Gagal Memuat Gambar</span>
                </div>
              `;
            }}
          />
        ) : (
          <div className="text-center p-4 transition-transform duration-500 group-hover:scale-105">
            <span className="text-4xl block mb-2 opacity-60">📖</span>
            <span className="text-[11px] text-slate-400 font-bold tracking-wider uppercase">
              Belum Ada Cover
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-slate-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="cursor-pointer" onClick={() => onDetailClick(buku)}>
          <h3
            className="text-sm dark:text-white font-bold text-slate-900 leading-snug mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors"
            title={buku.judul}
          >
            {buku.judul}
          </h3>
          <p className="text-xs dark:text-slate-200 text-slate-500" title={buku.penulis}>
            Oleh:{" "}
            <span className="font-semibold dark:text-slate-300 text-slate-700">{buku.penulis}</span>
          </p>
        </div>
        <div className="bg-slate-50 p-2 rounded-xl text-xs text-slate-600 flex justify-between items-center border border-slate-100 font-medium mt-3">
          <span>📍 Lemari {buku.no_lemari}</span>
          <span className="text-slate-300 px-1">|</span>
          <span>Rak {buku.no_rak}</span>
        </div>
      </div>
      <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-800 border-t border-slate-100 flex items-center justify-between">
        <div className="flex-1 pr-2">
          <span className="text-[10px] text-slate-400 dark:text-slate-200 font-bold uppercase tracking-wider block">
            Stok
          </span>
          <span
            className={`text-sm dark:text-white font-black block ${buku.stok > 0 ? "text-slate-900" : "text-rose-600"}`}
          >
            {buku.stok} Eks
          </span>
        </div>
        {/* LOGIKA ROLE: Jika role bukan admin, tampilkan tombol pinjam */}
        {role !== "admin" && (
          <button
            disabled={buku.stok <= 0}
            onClick={(e) => {
              e.stopPropagation(); // Mencegah klik tombol agar tidak memicu klik pada kartunya
              onPinjamClick(buku);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              buku.stok > 0
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {buku.stok > 0 ? "Pinjam" : "Habis"}
          </button>
        )}
        {/* Jika admin, bagian kanan ini dibiarkan kosong, karena tombol pindah ke dalam popup */}
      </div>
    </div>
  );
};

export default BookCard;
