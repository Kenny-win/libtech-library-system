import * as XLSX from "xlsx";

const AddBookModal = ({
  isOpen,
  onClose,
  modalTab,
  setModalTab,
  formData,
  handleInputChange,
  handleSubmit,
  handleExcelUpload,
  kategoriList,
  lokasiList, // <-- PROPS BARU UNTUK DAFTAR LOKASI
  isEditMode,
}) => {
  if (!isOpen) return null;
  const tahunSekarang = new Date().getFullYear();

  const handleDownloadTemplate = () => {
    // Template sudah memuat kolom Lokasi
    const headers = [
      "Judul",
      "Penulis",
      "Penerbit",
      "Tahun Terbit",
      "Stok",
      "ISBN",
      "ID Kategori",
      "No Lemari",
      "No Rak",
      "Lokasi",
      "Tingkatan",
      "Cover Drive ID",
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    XLSX.utils.book_append_sheet(wb, ws, "Template Import Buku");
    XLSX.writeFile(wb, "template_import_buku.xlsx");
  };

  // Fungsi pembantu untuk mengelola centang Checkbox Lokasi
  const handleLokasiCheckboxChange = (idLokasi) => {
    // Jika formData.lokasi belum berupa array, kita inisialisasi sebagai array kosong
    const currentLokasi = Array.isArray(formData.lokasi) ? formData.lokasi : [];
    
    // Jika lokasi yang dicentang sudah ada di dalam array, kita keluarkan (uncheck)
    if (currentLokasi.includes(idLokasi)) {
      handleInputChange({
        target: {
          name: "lokasi",
          value: currentLokasi.filter((id) => id !== idLokasi),
        },
      });
    } else {
      // Jika belum ada, kita tambahkan ke dalam array (check)
      handleInputChange({
        target: {
          name: "lokasi",
          value: [...currentLokasi, idLokasi],
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-900">
            {isEditMode ? "Edit Info Buku" : "Tambah Koleksi Buku"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl font-bold cursor-pointer"
          >
            ×
          </button>
        </div>
        <div className="flex border-b border-slate-200 mb-5">
          <button
            type="button"
            onClick={() => setModalTab("manual")}
            className={`flex-1 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              modalTab === "manual"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            ✏️ Input Manual
          </button>
          <button
            type="button"
            onClick={() => setModalTab("excel")}
            className={`flex-1 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              modalTab === "excel"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            📊 Import File Excel
          </button>
        </div>

        {modalTab === "manual" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Judul Buku *
              </label>
              <input
                type="text"
                name="judul"
                value={formData.judul}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500"
                placeholder="Aku Anak Hebat"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Google Drive Cover ID
              </label>
              <input
                type="text"
                name="cover_drive_id"
                value={formData.cover_drive_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500"
                placeholder="Paste ID file gambar dari Google Drive"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Penulis *
                </label>
                <input
                  type="text"
                  name="penulis"
                  value={formData.penulis}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500"
                  placeholder="Nama penulis"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Penerbit *
                </label>
                <input
                  type="text"
                  name="penerbit"
                  value={formData.penerbit}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500"
                  placeholder="Nama penerbit"
                />
              </div>
            </div>

            {/* BARIS LOKASI CHECKBOX */}
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2 border-b border-slate-200 pb-2">
                Lokasi Perpustakaan (Bisa Pilih &gt; 1)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {lokasiList && lokasiList.map((lokasi) => (
                  <label key={lokasi.id_lokasi} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      // Periksa apakah id lokasi ini ada di dalam array formData.lokasi
                      checked={Array.isArray(formData.lokasi) && formData.lokasi.includes(lokasi.id_lokasi)}
                      onChange={() => handleLokasiCheckboxChange(lokasi.id_lokasi)}
                      className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded-sm focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                      {lokasi.nama_lokasi}
                    </span>
                  </label>
                ))}
                {(!lokasiList || lokasiList.length === 0) && (
                  <span className="text-xs text-slate-400 italic">Memuat data lokasi...</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Kategori *
                </label>
                <select
                  name="id_kategori"
                  value={formData.id_kategori}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-hidden focus:border-blue-500"
                >
                  <option value="" disabled>
                    Pilih Kategori
                  </option>
                  {kategoriList &&
                    kategoriList.map((kat) => (
                      <option key={kat.id_kategori} value={kat.id_kategori}>
                        {kat.nama_kategori}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  ISBN
                </label>
                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500"
                  placeholder="978..."
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Tahun Terbit *
                </label>
                <input
                  type="number"
                  name="tahun_terbit"
                  value={formData.tahun_terbit}
                  onChange={handleInputChange}
                  placeholder="2010"
                  required
                  max={tahunSekarang}
                  min="1000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Stok
                </label>
                <input
                  type="number"
                  name="stok"
                  value={formData.stok}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Tingkatan
                </label>
                <select
                  name="tingkatan"
                  value={formData.tingkatan}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-hidden focus:border-blue-500"
                >
                  <option value="Umum">Umum</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  No Lemari
                </label>
                <input
                  type="text"
                  name="no_lemari"
                  value={formData.no_lemari}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  No Rak
                </label>
                <input
                  type="text"
                  name="no_rak"
                  value={formData.no_rak}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-2/3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer shadow-xs"
              >
                {isEditMode ? "Perbaharui" : "Simpan Buku"}
              </button>
            </div>
          </form>
        ) : (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <span className="text-3xl">📊</span>
            </div>
            <div className="max-w-xs mx-auto">
              <h4 className="text-sm font-bold text-slate-800">
                Unggah Sekaligus via Excel
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Pastikan susunan kolom berkas Excel Anda sudah sesuai dengan
                format pustakawan.
              </p>
            </div>
            <div className="pt-1">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer hover:no-underline transition-colors"
              >
                📥 Download Template Format Excel (.xlsx)
              </button>
            </div>
            <div className="pt-2">
              <label className="inline-flex items-center px-5 py-2.5 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs">
                📁 Pilih File Excel (.xlsx)
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddBookModal;