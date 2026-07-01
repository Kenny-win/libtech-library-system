const FilterBuku = ({ filters, onFilterChange, kategoriList, onReset, sortOrder, onSortChange }) => {
  return (
    <div className="bg-white p-5 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 dark:text-white">
          🔍 Filter & Urutkan
        </h3>
        
        {/* BAGIAN KANAN: PENGURUTAN & RESET */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-200 uppercase">Urutkan:</span>
            <select
              value={sortOrder}
              onChange={(e) => onSortChange(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-hidden cursor-pointer"
            >
              <option value="asc">A - Z (Judul)</option>
              <option value="desc">Z - A (Judul)</option>
              <option value="terbaru">Buku Terbaru</option>
            </select>
          </div>
          
          <button
            onClick={onReset}
            className="text-xs text-slate-500 dark:text-slate-200 hover:text-blue-600 font-semibold underline hover:no-underline cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Filter Judul */}
        <div>
          <label className="block dark:text-slate-200 text-[10px] font-bold uppercase text-slate-500 mb-1">Judul Buku</label>
          <input
            type="text"
            name="judul"
            value={filters.judul}
            onChange={onFilterChange}
            className="w-full dark:text-slate-200 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500"
            placeholder="Cari judul..."
          />
        </div>

        {/* Filter Penulis */}
        <div>
          <label className="block dark:text-slate-200 text-[10px] font-bold uppercase text-slate-500 mb-1">Penulis</label>
          <input
            type="text"
            name="penulis"
            value={filters.penulis}
            onChange={onFilterChange}
            className="w-full dark:text-slate-200 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500"
            placeholder="Cari penulis..."
          />
        </div>

        {/* Filter Penerbit */}
        <div>
          <label className="block dark:text-slate-200 text-[10px] font-bold uppercase text-slate-500 mb-1">Penerbit</label>
          <input
            type="text"
            name="penerbit"
            value={filters.penerbit}
            onChange={onFilterChange}
            className="w-full dark:text-slate-200 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500"
            placeholder="Cari penerbit..."
          />
        </div>

        {/* Filter ISBN */}
        <div>
          <label className="block dark:text-slate-200 text-[10px] font-bold uppercase text-slate-500 mb-1">ISBN</label>
          <input
            type="text"
            name="isbn"
            value={filters.isbn}
            onChange={onFilterChange}
            className="w-full dark:text-slate-200 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500"
            placeholder="Cari ISBN..."
          />
        </div>

        {/* Filter Kategori */}
        <div>
          <label className="block dark:text-slate-200 text-[10px] font-bold uppercase text-slate-500 mb-1">Kategori</label>
          <select
            name="id_kategori"
            value={filters.id_kategori}
            onChange={onFilterChange}
            className="w-full dark:text-slate-200 dark:bg-slate-800 px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-hidden focus:border-blue-500"
          >
            <option className="dark:bg-slate-800" value="">Semua Kategori</option>
            {kategoriList && kategoriList.map((kat) => (
              <option key={kat.id_kategori} value={kat.id_kategori}>
                {kat.nama_kategori} ({kat.jumlah || 0})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBuku;