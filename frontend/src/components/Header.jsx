const Header = ({ onAddBookClick, role }) => {
  return (
    <div className="md:flex md:items-center md:justify-between mb-8 md:mb-10 mt-4 md:mt-0">
      {/* BAGIAN TEKS: Rata tengah di HP (text-center), Rata Kiri di Laptop (md:text-left) */}
      <div className="flex-1 min-w-0 text-center md:text-left">
        <h2 className="text-2xl dark:text-white md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Katalog Koleksi Perpustakaan
        </h2>
        <p className="mt-2 dark:text-white md:mt-1 text-xs md:text-sm text-slate-500 max-w-xl mx-auto md:mx-0">
          Kelola entri data buku fisik, lokasi penyimpanan rak, dan peminjaman
          dalam satu dasbor terpadu.
        </p>
      </div>

      {/* BAGIAN TOMBOL: Rata tengah di HP (justify-center), Rata Kanan di Laptop (md:justify-end) */}
      {/* Tampilkan tombol HANYA jika rolenya adalah admin */}
      {role === "admin" && (
        <div className="mt-6 flex justify-center md:mt-0 md:ml-4 md:justify-end">
          <button
            onClick={onAddBookClick}
            className="inline-flex items-center px-6 py-3 md:px-5 md:py-2.5 rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden transition-all transform hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto justify-center"
          >
            + Tambah Buku Baru
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;
