import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const KategoriPage = ({ showAlert, showConfirm, URL }) => {
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [isUploading, setIsUploading] = useState(false);
  const [modalTab, setModalTab] = useState("manual");

  // State untuk Filter & Modal
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("nama_asc");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State untuk Form CRUD
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ nama_kategori: "" });

  const [batasTampil, setBatasTampil] = useState(10);

  // Fetch Data Kategori
  useEffect(() => {
    const fetchKategori = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${URL}/api/kategori`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        const result = await res.json();
        if (result.success) setKategoriList(result.data);
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        showAlert("error", "Terjadi kesalahan koneksi saat menyimpan data.");
      } finally {
        setLoading(false);
      }
    };
    fetchKategori();
  }, [URL, refreshTrigger, showAlert]);

  // Submit Form (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_kategori.trim()) return;

    try {
      const url = isEditMode
        ? `${URL}/api/kategori/${editId}`
        : `${URL}/api/kategori`;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      if (result.success) {
        showAlert("success", "Sukses Tersimpan!", result.message);
        setIsModalOpen(false);
        setRefreshTrigger((prev) => prev + 1);
      } else {
        showAlert("warning", result.message);
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      showAlert("error", "Terjadi kesalahan server");
    }
  };

  // Delete Kategori
  const handleDelete = async (id_kategori, jumlah_buku) => {
    if (jumlah_buku > 0) {
      showAlert(
        "warning",
        "Kategori Terpakai",
        `Gagal! Masih ada ${jumlah_buku} buku di kategori ini. Hapus atau pindahkan buku terlebih dahulu.`,
      );
      return;
    }

    showConfirm(
      "Hapus Kategori?",
      "Yakin ingin menghapus kategori ini secara permanen?",
      async () => {
        // SELURUH LOGIKA FETCH DIMASUKKAN KE DALAM SINI
        try {
          const res = await fetch(`${URL}/api/kategori/${id_kategori}`, {
            method: "DELETE",
            headers: { "ngrok-skip-browser-warning": "true" },
          });
          const result = await res.json();

          if (result.success) {
            showAlert("success", "Berhasil Dihapus", result.message);
            setRefreshTrigger((prev) => prev + 1);
          } else {
            showAlert("error", "Gagal Menghapus", result.message);
          }
          // eslint-disable-next-line no-unused-vars
        } catch (err) {
          showAlert(
            "error",
            "Koneksi Terputus",
            "Terjadi kesalahan koneksi saat menghapus kategori.",
          );
        }
      },
    );
  };

  // Buka form untuk tambah
  const handleOpenAdd = () => {
    setIsEditMode(false);
    setEditId(null);
    setFormData({ nama_kategori: "" });
    setModalTab("manual"); // <-- Tambahkan ini
    setIsModalOpen(true);
  };

  // Buka form untuk edit
  const handleOpenEdit = (kat) => {
    setIsEditMode(true);
    setEditId(kat.id_kategori);
    setFormData({ nama_kategori: kat.nama_kategori });
    setIsModalOpen(true);
  };

  // Logika Filter
  const filteredKategori = kategoriList.filter((kat) =>
    kat.nama_kategori.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // LOGIKA SORTING
  // Kita buat copy array dengan [...filteredKategori] agar array asli tidak rusak
  const sortedKategori = [...filteredKategori].sort((a, b) => {
    if (sortOrder === "nama_asc") {
      return a.nama_kategori.localeCompare(b.nama_kategori); // A - Z
    } else if (sortOrder === "nama_desc") {
      return b.nama_kategori.localeCompare(a.nama_kategori); // Z - A
    } else if (sortOrder === "jumlah_desc") {
      return b.jumlah_buku - a.jumlah_buku; // Terbanyak ke Sedikit
    } else if (sortOrder === "jumlah_asc") {
      return a.jumlah_buku - b.jumlah_buku; // Sedikit ke Terbanyak
    }
    return 0;
  });

  // ---> FUNGSI DOWNLOAD TEMPLATE KATEGORI <---
  const handleDownloadTemplate = () => {
    const headers = ["Nama Kategori"];
    const dummyData = [["Fiksi Ilmiah"], ["Sejarah Dunia"], ["Buku Anak-Anak"]];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dummyData]);
    ws["!cols"] = [{ wch: 30 }]; // Melebarkan kolom A agar rapi

    XLSX.utils.book_append_sheet(wb, ws, "Template Kategori");
    XLSX.writeFile(wb, "template_import_kategori.xlsx");
  };

  // ---> FUNGSI UPLOAD EXCEL <---
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showConfirm(
      "Upload Excel?",
      `Anda akan mengimpor data kategori dari file ${file.name}. Lanjutkan?`,
      async () => {
        const formData = new FormData();
        formData.append("file", file);

        try {
          setIsUploading(true);
          // Pastikan Anda menyesuaikan URL-nya jika menggunakan variabel `${URL}`
          const response = await fetch(`${URL}/api/kategori/upload`, {
            method: "POST",
            headers: { "ngrok-skip-browser-warning": "true" },
            body: formData,
          });
          const result = await response.json();

          if (result.success) {
            showAlert("success", "Import Selesai", result.message);
            setRefreshTrigger((prev) => prev + 1);
          } else {
            showAlert("error", "Gagal Impor", result.message);
          }
          // eslint-disable-next-line no-unused-vars
        } catch (err) {
          showAlert(
            "error",
            "Terjadi Kesalahan",
            "Gagal menghubungi server saat upload.",
          );
        } finally {
          setIsUploading(false);
          e.target.value = ""; // Reset input file agar bisa pilih file yang sama lagi
        }
      },
    );
  };

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8 mt-4 md:mt-0">
        <div className="flex-1 min-w-0 text-center md:text-left">
          <h2 className="text-2xl dark:text-white md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Daftar Kategori Buku
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-white">
            Kelola daftar klasifikasi kategori buku di perpustakaan.
          </p>
        </div>
        <div className="mt-6 flex justify-center md:mt-0 md:ml-4 md:justify-end">
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
          >
            + Kategori Baru
          </button>
        </div>
      </div>

      {/* FILTER SEARCH */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center gap-4 transition-colors">
        {/* Kotak Pencarian */}
        <div className="w-full md:flex-1">
          <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
            Cari Kategori
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setBatasTampil(10);
            }}
            placeholder="Ketik nama kategori..."
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-hidden focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-colors"
          />
        </div>

        {/* Dropdown Sort */}
        <div className="w-full md:w-auto">
          <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
            Urutkan Berdasarkan
          </label>
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setBatasTampil(10);
            }}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer transition-colors"
          >
            <option value="nama_asc">A - Z (Nama Kategori)</option>
            <option value="nama_desc">Z - A (Nama Kategori)</option>
            <option value="jumlah_desc">Buku Terbanyak</option>
            <option value="jumlah_asc">Buku Paling Sedikit</option>
          </select>
        </div>
      </div>

      {/* TABEL KATEGORI */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto transition-colors">
        {loading ? (
          <div className="text-center py-20 animate-pulse text-slate-500 font-bold">
            Memuat data kategori...
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300 min-w-125">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 w-16 whitespace-nowrap">
                  ID
                </th>
                <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                  Nama Kategori
                </th>
                <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 text-center whitespace-nowrap">
                  Jumlah Buku
                </th>
                <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 text-center whitespace-nowrap">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {sortedKategori.length > 0 ? (
                sortedKategori.slice(0, batasTampil).map((kat) => (
                  <tr
                    key={kat.id_kategori}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      #{kat.id_kategori}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {kat.nama_kategori}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                        {kat.jumlah_buku} Buku
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleOpenEdit(kat)}
                          className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-800/50 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(kat.id_kategori, kat.jumlah_buku)
                          }
                          className="px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 dark:hover:bg-rose-800/50 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-slate-500">
                    Tidak ada kategori yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {/* TOMBOL LOAD MORE DI BAWAH TABEL KATEGORI */}
      {batasTampil < sortedKategori.length && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Menampilkan {batasTampil} dari {sortedKategori.length} kategori
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setBatasTampil(batasTampil + 10)}
              className="px-6 py-2.5 bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              Lebih Banyak ⬇️
            </button>
            <button
              onClick={() => setBatasTampil(sortedKategori.length)}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              Tampilkan Semua
            </button>
          </div>
        </div>
      )}

      {/* MODAL FORM KATEGORI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg p-6 border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {isEditMode ? "Edit Kategori" : "Tambah Kategori Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* ---> TAB MENU (Hanya muncul jika bukan mode edit) <--- */}
            {!isEditMode && (
              <div className="flex border-b border-slate-200 dark:border-slate-700 mb-5">
                <button
                  type="button"
                  onClick={() => setModalTab("manual")}
                  className={`flex-1 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                    modalTab === "manual"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
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
                      : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                >
                  📊 Import File Excel
                </button>
              </div>
            )}

            {/* ---> KONTEN TAB MANUAL (Atau Mode Edit) <--- */}
            {modalTab === "manual" || isEditMode ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    autoFocus
                    required
                    value={formData.nama_kategori}
                    onChange={(e) =>
                      setFormData({ nama_kategori: e.target.value })
                    }
                    placeholder="Misal: Fiksi, Sejarah..."
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-hidden focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-sm cursor-pointer transition-colors"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            ) : (
              /* ---> KONTEN TAB EXCEL <--- */
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-800">
                  <span className="text-3xl">📊</span>
                </div>
                <div className="max-w-xs mx-auto">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Unggah Sekaligus via Excel
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Pastikan susunan kolom berkas Excel Anda sudah sesuai dengan
                    format.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline cursor-pointer hover:no-underline transition-colors"
                  >
                    📥 Download Template Format Excel (.xlsx)
                  </button>
                </div>

                <div className="pt-4">
                  <label
                    className={`inline-flex items-center px-6 py-3 border border-emerald-200 dark:border-emerald-700 rounded-xl text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-sm ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {isUploading
                      ? "⏳ Mengunggah..."
                      : "📁 Pilih File Excel (.xlsx)"}
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleExcelUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KategoriPage;
