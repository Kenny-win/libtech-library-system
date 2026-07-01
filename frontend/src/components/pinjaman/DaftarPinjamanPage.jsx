import { useState, useEffect } from "react";
import DetailPinjamanModal from "./DetailPinjamanModal";

const DaftarPinjamanPage = ({ showAlert, showConfirm, URL }) => {
  const [pinjamanList, setPinjamanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [selectedPinjaman, setSelectedPinjaman] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [batasTampil, setBatasTampil] = useState(10);

  // STATE UNTUK FILTER & SORTING
  const [filters, setFilters] = useState({
    nama: "",
    nis_nip: "",
    peran: "",
    kelas: "",
    judul: "",
    tanggal_pinjam: "",
    status: "",
    hanya_terlambat: false,
  });
  const [sortOrder, setSortOrder] = useState("terbaru");

  // Fetch Data dari Backend
  useEffect(() => {
    const fetchPinjaman = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${URL}/api/peminjaman`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        const result = await res.json();

        if (result.success) {
          setPinjamanList(result.data);
        }
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        showAlert("error", "Kesalahan Teknis", "Gagal memuat data peminjaman");
      } finally {
        setLoading(false);
      }
    };

    fetchPinjaman();
  }, [URL, refreshTrigger, showAlert]);

  // Fungsi menghitung keterlambatan saat ini (berjalan) wajib di atas fungsi filteredPinjamanList
  const hitungHariTerlambat = (tenggat) => {
    if (!tenggat) return 0;
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);
    const tglTenggat = new Date(tenggat);
    tglTenggat.setHours(0, 0, 0, 0);
    const selisihHari = Math.floor(
      (hariIni - tglTenggat) / (1000 * 60 * 60 * 24),
    );
    return selisihHari > 0 ? selisihHari : 0;
  };

  // Fungsi Handler Status Peminjaman
  const handleUpdateStatus = async (
    id_peminjaman,
    statusBaru,
    tanggal_harus_kembali = null,
  ) => {
    // const confirmMsg = `Ubah status menjadi ${statusBaru.toUpperCase()}?`;
    // if (!window.confirm(confirmMsg)) return;
    showConfirm(
      "Update Status",
      `Ubah status menjadi ${statusBaru.toUpperCase()}?`,
      async () => {
        try {
          const res = await fetch(
            `${URL}/api/peminjaman/${id_peminjaman}/status`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
              },
              body: JSON.stringify({
                status: statusBaru,
                tanggal_harus_kembali,
              }),
            },
          );
          const result = await res.json();

          if (result.success) {
            showAlert("success", "Status Berhasil Diubah", result.message);

            setIsModalOpen(false); // Tutup popup otomatis setelah sukses
            setRefreshTrigger((prev) => prev + 1); // Refresh data tabel
          } else {
            showAlert("error", "Status Gagal Diubah", result.message);
          }
          // eslint-disable-next-line no-unused-vars
        } catch (err) {
          showAlert(
            "error",
            "Koneksi Terputus",
            "Terjadi kesalahan koneksi saat mengubah status.",
          );
        }
      },
    );
  };

  // HANDLER PERUBAHAN FILTER & SORT
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Deteksi jika yang diubah adalah checkbox
    const finalValue = type === "checkbox" ? checked : value;

    // Jika peran diubah dan bukan "siswa", otomatis kosongkan filter kelas
    if (name === "peran" && finalValue !== "siswa") {
      setFilters({ ...filters, [name]: finalValue, kelas: "" });
    } else {
      setFilters({ ...filters, [name]: finalValue });
    }
    setBatasTampil(10);
  };

  const handleResetFilter = () => {
    setFilters({
      nama: "",
      nis_nip: "",
      peran: "",
      kelas: "",
      judul: "",
      tanggal_pinjam: "",
      status: "",
      hanya_terlambat: false,
    });
    setSortOrder("terbaru");
    setBatasTampil(10);
  };

  // LOGIKA FILTERING DATA
  const filteredPinjamanList = pinjamanList.filter((item) => {
    const matchNama =
      item.nama?.toLowerCase().includes(filters.nama.toLowerCase()) ?? false;
    const matchNisNip =
      item.nis_nip?.toLowerCase().includes(filters.nis_nip.toLowerCase()) ??
      false;
    const matchJudul =
      item.judul?.toLowerCase().includes(filters.judul.toLowerCase()) ?? false;

    const matchPeran = filters.peran === "" || item.peran === filters.peran;
    // Logika Kelas: Cocok jika filter kosong, ATAU jika teks filter ada di dalam string kelas
    const matchKelas =
      filters.kelas === "" ||
      (item.kelas?.toLowerCase().includes(filters.kelas.toLowerCase()) ??
        false);
    const matchStatus = filters.status === "" || item.status === filters.status;

    // Konversi tanggal dari database (ISO string) ke format YYYY-MM-DD agar bisa dicocokkan dengan input type="date"
    const itemTanggal = item.tanggal_pinjam
      ? new Date(item.tanggal_pinjam).toISOString().split("T")[0]
      : "";
    const matchTanggal =
      filters.tanggal_pinjam === "" || itemTanggal === filters.tanggal_pinjam;

    // LOGIKA FILTER TERLAMBAT
    const isTerlambat =
      item.status === "dipinjam" &&
      hitungHariTerlambat(item.tanggal_harus_kembali) > 0;
    const matchTerlambat = !filters.hanya_terlambat || isTerlambat; // Lolos jika checkbox mati, ATAU jika kondisinya memang terlambat

    return (
      matchNama &&
      matchNisNip &&
      matchJudul &&
      matchPeran &&
      matchKelas &&
      matchStatus &&
      matchTanggal &&
      matchTerlambat
    );
  });

  // LOGIKA SORTING DATA
  const sortedPinjamanList = [...filteredPinjamanList].sort((a, b) => {
    if (sortOrder === "terbaru") {
      return new Date(b.tanggal_pinjam) - new Date(a.tanggal_pinjam);
    } else if (sortOrder === "terlama") {
      return new Date(a.tanggal_pinjam) - new Date(b.tanggal_pinjam);
    } else if (sortOrder === "nama_asc") {
      return a.nama.localeCompare(b.nama);
    } else if (sortOrder === "nama_desc") {
      return b.nama.localeCompare(a.nama);
    }
    return 0;
  });

  if (loading)
    return (
      <div className="text-center py-20 animate-pulse text-slate-500 font-bold">
        Memuat data peminjaman...
      </div>
    );

  return (
    <div>
      <h2 className="text-3xl dark:text-white font-extrabold text-slate-900 tracking-tight mb-2">
        Manajemen Peminjaman
      </h2>
      <p className="text-sm text-slate-500 mb-6 dark:text-white">
        Persetujuan peminjaman dan pencatatan pengembalian buku.
      </p>

      {/* UI FILTER & SORTING */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-800 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 dark:text-white">
            🔍 Filter & Urutkan
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase dark:text-white">
                Urutkan:
              </span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="text-xs dark:text-slate-200 dark:bg-slate-800 font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-hidden cursor-pointer"
              >
                <option value="terbaru">Tanggal Terbaru</option>
                <option value="terlama">Tanggal Terlama</option>
                <option value="nama_asc">A - Z (Nama Peminjam)</option>
                <option value="nama_desc">Z - A (Nama Peminjam)</option>
              </select>
            </div>
            <button
              onClick={handleResetFilter}
              className="text-xs dark:text-slate-200 text-slate-500 hover:text-blue-600 font-semibold underline hover:no-underline cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Filter Nama */}
          <div>
            <label className="block dark:text-white text-[10px] font-bold uppercase text-slate-500 mb-1">
              Nama Peminjam
            </label>
            <input
              type="text"
              name="nama"
              value={filters.nama}
              onChange={handleFilterChange}
              className="w-full dark:text-white px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
              placeholder="Cari nama..."
            />
          </div>
          {/* Filter NIS/NIP */}
          <div>
            <label className="block dark:text-white text-[10px] font-bold uppercase text-slate-500 mb-1">
              NIS/NIP
            </label>
            <input
              type="text"
              name="nis_nip"
              value={filters.nis_nip}
              onChange={handleFilterChange}
              className="w-full dark:text-white px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
              placeholder="Cari NIS/NIP..."
            />
          </div>
          {/* Filter Peran */}
          <div>
            <label className="block dark:text-white text-[10px] font-bold uppercase text-slate-500 mb-1">
              Peran
            </label>
            <select
              name="peran"
              value={filters.peran}
              onChange={handleFilterChange}
              className="w-full dark:bg-slate-800 dark:text-slate-200 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden focus:border-blue-500"
            >
              <option value="">Semua Peran</option>
              <option value="siswa">Siswa</option>
              <option value="pegawai">Pegawai</option>
            </select>
          </div>

          {/* Filter Kelas (HANYA MUNCUL JIKA PERAN = SISWA) */}
          {filters.peran === "siswa" && (
            <div className="animate-fadeIn">
              <label className="block dark:text-white text-[10px] font-bold uppercase text-slate-500 mb-1">
                Kelas
              </label>
              <input
                type="text"
                name="kelas"
                value={filters.kelas}
                onChange={handleFilterChange}
                className="w-full dark:text-white px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                placeholder="Contoh: IX-4..."
              />
            </div>
          )}

          {/* Filter Judul Buku */}
          <div>
            <label className="block dark:text-white text-[10px] font-bold uppercase text-slate-500 mb-1">
              Judul Buku
            </label>
            <input
              type="text"
              name="judul"
              value={filters.judul}
              onChange={handleFilterChange}
              className="w-full dark:text-white px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
              placeholder="Cari judul buku..."
            />
          </div>
          {/* Filter Tanggal Pinjam */}
          <div>
            <label className="block dark:text-white text-[10px] font-bold uppercase text-slate-500 mb-1">
              Tanggal Pinjam
            </label>
            <input
              type="date"
              name="tanggal_pinjam"
              value={filters.tanggal_pinjam}
              onChange={handleFilterChange}
              className="w-full dark:text-slate-200 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
            />
          </div>
          {/* Filter Status */}
          <div>
            <label className="block dark:text-white text-[10px] font-bold uppercase text-slate-500 mb-1">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full dark:bg-slate-800 dark:text-slate-200 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden focus:border-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending / Menunggu</option>
              <option value="dipinjam">Dipinjam</option>
              <option value="kembali">Kembali</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>
          {/* Filter Hanya Terlambat */}
          <div className="flex items-center mt-2 sm:mt-6">
            <label className="flex items-center gap-2 cursor-pointer bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-xl transition-colors w-full">
              <input
                type="checkbox"
                name="hanya_terlambat"
                checked={filters.hanya_terlambat}
                onChange={handleFilterChange}
                className="w-4 h-4 text-rose-600 rounded-sm border-slate-300 focus:ring-rose-500 cursor-pointer"
              />
              <span className="text-[10px] font-bold uppercase text-rose-700">
                Tampilkan Yang Telat Saja
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* UI TABEL PEMINJAMAN */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 ">
          <thead className="bg-slate-50 border-b border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-800 dark:text-white">
                Identitas Peminjam
              </th>
              <th className="px-6 py-4 font-bold text-slate-800 dark:text-white">
                Buku yang Dipinjam
              </th>
              <th className="px-6 py-4 font-bold text-slate-800 dark:text-white">
                Tanggal
              </th>
              <th className="px-6 py-4 font-bold text-slate-800 dark:text-white">
                Status
              </th>
              <th className="px-6 py-4 font-bold text-slate-800 text-center dark:text-white">
                Aksi Admin
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 ">
            {sortedPinjamanList.length > 0 ? (
              sortedPinjamanList.slice(0, batasTampil).map((item) => (
                <tr
                  key={item.id_peminjaman}
                  className="hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-600 transition dark:text-slate-200"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {item.nama}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5 dark:text-slate-200">
                      NIS/NIP: {item.nis_nip}
                    </div>
                    <div className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-md">
                      {item.peran} {item.kelas ? ` - ${item.kelas}` : ""}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 dark:text-white">
                      {item.judul}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 dark:text-slate-200">
                      Stok saat ini:{" "}
                      <span className="font-bold text-slate-700 dark:text-white">
                        {item.stok}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-xs">
                    <div>
                      <span className="font-semibold">Pinjam:</span>{" "}
                      {new Date(item.tanggal_pinjam).toLocaleDateString(
                        "id-ID",
                      )}
                    </div>

                    {/* Logika Tampilan Tenggat & Denda */}
                    {item.status === "kembali" ? (
                      <div className="mt-1">
                        <div className="text-emerald-600 dark:text-emerald-400">
                          <span className="font-semibold">Dikembalikan:</span>{" "}
                          {new Date(
                            item.tanggal_kembali_asli,
                          ).toLocaleDateString("id-ID")}
                        </div>
                        {item.denda > 0 && (
                          <div className="mt-1 inline-block bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-bold text-[10px] border border-rose-100">
                            Denda (Telat {item.jumlah_hari_terlambat} hari): Rp{" "}
                            {item.denda.toLocaleString("id-ID")}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="text-slate-600 mt-0.5 dark:text-slate-200">
                          <span className="font-semibold dark:text-slate-200">
                            Tenggat:
                          </span>{" "}
                          {new Date(
                            item.tanggal_harus_kembali,
                          ).toLocaleDateString("id-ID")}
                        </div>

                        {/* Jika sedang dipinjam dan LEWAT TENGGAT, munculkan peringatan berjalan */}
                        {item.status === "dipinjam" &&
                          hitungHariTerlambat(item.tanggal_harus_kembali) >
                            0 && (
                            <div className="mt-1 inline-block animate-pulse bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md font-bold text-[10px] border border-rose-200">
                              ⚠️ Lewat{" "}
                              {hitungHariTerlambat(item.tanggal_harus_kembali)}{" "}
                              hari
                              {/* HANYA TAMPILKAN ESTIMASI DENDA JIKA PERAN = SISWA */}
                              {item.peran === "siswa" &&
                                ` (Est. Denda: Rp ${(hitungHariTerlambat(item.tanggal_harus_kembali) * 1000).toLocaleString("id-ID")})`}
                            </div>
                          )}
                      </>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        item.status === "pending" || item.status === "menunggu"
                          ? "bg-amber-100 text-amber-700"
                          : item.status === "dipinjam"
                            ? "bg-blue-100 text-blue-700"
                            : item.status === "kembali"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* UBAH ISI KOLOM AKSI INI */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedPinjaman(item);
                        setIsModalOpen(true);
                      }}
                      className="px-4 py-2 border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
                    >
                      {item.status === "pending" || item.status === "menunggu"
                        ? "👀 Proses Permintaan"
                        : "Lihat Detail"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-10 text-center text-slate-500 font-medium"
                >
                  Tidak ada data peminjaman yang sesuai dengan filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* TOMBOL LOAD MORE DI BAWAH TABEL */}
      {batasTampil < sortedPinjamanList.length && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Menampilkan {batasTampil} dari {sortedPinjamanList.length} data
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setBatasTampil(batasTampil + 10)}
              className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              Tampilkan Lebih Banyak ⬇️
            </button>
            <button
              onClick={() => setBatasTampil(sortedPinjamanList.length)}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              Tampilkan Semua
            </button>
          </div>
        </div>
      )}
      <DetailPinjamanModal
        key={selectedPinjaman ? selectedPinjaman.id_peminjaman : "modal-kosong"}
        isOpen={isModalOpen}
        pinjaman={selectedPinjaman}
        onClose={() => setIsModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
        showAlert={showAlert}
      />
    </div>
  );
};

export default DaftarPinjamanPage;
