import { useState, useEffect } from "react";

const DaftarPinjamankuPage = ({ role, currentUser, URL }) => {
  const [riwayatList, setRiwayatList] = useState([]);
  const [loading, setLoading] = useState(true);

  // STATE FILTER DI SINI
  const [searchJudul, setSearchJudul] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [batasTampil, setBatasTampil] = useState(6);

  // SIMULASI ID USER DARI LOGIN
  const userId = currentUser.id_user;

  useEffect(() => {
    const fetchRiwayatPinjaman = async (isBackground = false) => {
      try {
        if (!isBackground) setLoading(true);

        // Gunakan variabel userId di sini
        const res = await fetch(`${URL}/api/peminjaman/user/${userId}`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        const result = await res.json();

        if (result.success) {
          setRiwayatList(result.data);
        }
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        if (!isBackground) alert("Gagal memuat riwayat peminjaman Anda");
      } finally {
        if (!isBackground) setLoading(false);
      }
    };

    fetchRiwayatPinjaman(false);

    const intervalId = setInterval(() => {
      fetchRiwayatPinjaman(true);
    }, 5000);

    return () => clearInterval(intervalId);

    // Pastikan dependency array menggunakan userId
  }, [URL, userId]);

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

  // LOGIKA FILTERING DATA (PENCARIAN & STATUS)
  const filteredRiwayat = riwayatList.filter((item) => {
    // Cek apakah buku ini sedang telat
    const isTerlambat =
      item.status === "dipinjam" &&
      hitungHariTerlambat(item.tanggal_harus_kembali) > 0;

    // Filter Pencarian Judul Buku
    const matchJudul =
      item.judul?.toLowerCase().includes(searchJudul.toLowerCase()) ?? false;

    // Filter Status Peminjaman
    let matchStatus = true;
    if (filterStatus === "pending") {
      matchStatus = item.status === "pending" || item.status === "menunggu";
    } else if (filterStatus === "dipinjam") {
      matchStatus = item.status === "dipinjam" && !isTerlambat;
    } else if (filterStatus === "terlambat") {
      matchStatus = isTerlambat;
    } else if (filterStatus === "kembali") {
      matchStatus = item.status === "kembali";
    } else if (filterStatus === "ditolak") {
      matchStatus = item.status === "ditolak";
    }

    return matchJudul && matchStatus;
  });

  if (loading)
    return (
      <div className="text-center py-20 animate-pulse text-slate-500 font-bold">
        Memuat rak buku Anda...
      </div>
    );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2 dark:text-white">
          Rak Buku Saya
        </h2>
        <p className="text-sm text-slate-500 dark:text-white">
          Pantau status peminjaman, tenggat waktu, dan riwayat buku yang telah
          Anda baca.
        </p>
      </div>

      {/* UI KOTAK FILTER PENCARIAN & STATUS */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-1/2">
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 dark:text-white">
            Cari Judul Buku
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm ">
              🔍
            </span>
            <input
              type="text"
              value={searchJudul}
              onChange={(e) => {
                setSearchJudul(e.target.value);
                setBatasTampil(6);
              }}
              className="w-full dark:text-white pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500"
              placeholder="Ketik judul buku yang Anda pinjam..."
            />
          </div>
        </div>
        <div className="w-full sm:w-1/2">
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 dark:text-white">
            Status Pinjaman
          </label>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setBatasTampil(6);
            }}
            className="w-full px-3 py-2 border dark:text-slate-200 border-slate-200 dark:bg-slate-800 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50 focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="">📚 Semua Status</option>
            <option value="pending">⏳ Menunggu Persetujuan Admin</option>
            <option value="dipinjam">📖 Sedang Dibaca (Aman)</option>
            <option value="terlambat">
              ⚠️ Terlambat (Lewat Tenggat Waktu)
            </option>
            <option value="kembali">✅ Sudah Selesai / Dikembalikan</option>
            <option value="ditolak">❌ Dibatalkan / Ditolak</option>
          </select>
        </div>
      </div>

      {/* UBAH riwayatList.length MENJADI filteredRiwayat.length */}
      {filteredRiwayat.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-4xl block mb-3">
            {searchJudul || filterStatus ? "🧐" : "📚"}
          </span>
          <h3 className="text-lg font-bold text-slate-700">
            {searchJudul || filterStatus
              ? "Tidak ada buku yang cocok"
              : "Belum Ada Riwayat Pinjaman"}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {searchJudul || filterStatus
              ? "Coba ubah kata kunci atau status filter Anda."
              : "Anda belum meminjam buku apapun. Yuk mulai eksplorasi katalog!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* UBAH riwayatList.map MENJADI filteredRiwayat.map */}
          {filteredRiwayat.slice(0, batasTampil).map((item) => {
            const isTerlambat =
              item.status === "dipinjam" &&
              hitungHariTerlambat(item.tanggal_harus_kembali) > 0;

            return (
              <div
                key={item.id_peminjaman}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                {/* BAGIAN ATAS: Status Tag */}
                <div
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider flex justify-between items-center ${
                    item.status === "pending" || item.status === "menunggu"
                      ? "bg-amber-100 text-amber-700"
                      : item.status === "dipinjam" && !isTerlambat
                        ? "bg-blue-100 text-blue-700"
                        : item.status === "dipinjam" && isTerlambat
                          ? "bg-rose-600 text-white animate-pulse"
                          : item.status === "kembali"
                            ? "bg-slate-100 text-slate-500"
                            : "bg-slate-800 dark:bg-gray-900 text-white"
                  }`}
                >
                  <span>Status: {item.status}</span>
                  {item.status === "pending" && <span>⏳ Menunggu Admin</span>}
                  {item.status === "dipinjam" && !isTerlambat && (
                    <span>📖 Sedang Dibaca</span>
                  )}
                  {item.status === "dipinjam" && isTerlambat && (
                    <span>⚠️ SEGERA KEMBALIKAN</span>
                  )}
                  {item.status === "kembali" && <span>✅ Selesai</span>}
                  {item.status === "ditolak" && <span>❌ Dibatalkan</span>}
                </div>

                {/* BAGIAN TENGAH: Info Buku */}
                <div className="p-4 flex gap-4 flex-1">
                  <div className="w-20 h-28 shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                    {item.cover_drive_id ? (
                      <img
                        src={`https://lh3.googleusercontent.com/d/${item.cover_drive_id}`}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl opacity-50">
                        📖
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug mb-1 dark:text-white">
                      {item.judul}
                    </h4>
                    <span className="text-xs text-slate-500 mb-2 dark:text-slate-200">
                      {item.penulis || item.penerbit || "-"}
                    </span>

                    <div className="mt-auto space-y-1">
                      <div className="text-[11px] text-slate-600 dark:text-slate-200">
                        <span className="font-semibold block text-slate-400 dark:text-slate-200">
                          Tgl Pinjam:
                        </span>
                        {new Date(item.tanggal_pinjam).toLocaleDateString(
                          "id-ID",
                        )}
                      </div>

                      {/* Tanggal Kembali/Tenggat */}
                      {item.status === "kembali" ? (
                        <div className="text-[11px] text-emerald-600 font-bold">
                          Dikembalikan:{" "}
                          {new Date(
                            item.tanggal_kembali_asli,
                          ).toLocaleDateString("id-ID")}
                        </div>
                      ) : (
                        <div
                          className={`text-[11px] font-bold ${isTerlambat ? "text-rose-600" : "text-blue-600 dark:text-blue-400"}`}
                        >
                          <span className="block text-slate-400 font-semibold dark:text-slate-200">
                            Tenggat Waktu:
                          </span>
                          {item.tanggal_harus_kembali
                            ? new Date(
                                item.tanggal_harus_kembali,
                              ).toLocaleDateString("id-ID")
                            : "Menunggu Admin"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* BAGIAN BAWAH: Info Denda (Khusus Siswa) */}
                {role === "siswa" && (item.denda > 0 || isTerlambat) && (
                  <div className="px-4 py-3 bg-rose-50 border-t border-rose-100 flex justify-between items-center">
                    <div>
                      <span className="block text-[10px] font-bold text-rose-700 uppercase">
                        {item.status === "kembali"
                          ? "Total Denda"
                          : "Estimasi Denda Saat Ini"}
                      </span>
                      <span className="block text-[10px] text-rose-500">
                        Telat{" "}
                        {item.status === "kembali"
                          ? item.jumlah_hari_terlambat
                          : hitungHariTerlambat(
                              item.tanggal_harus_kembali,
                            )}{" "}
                        hari
                      </span>
                    </div>
                    <span className="text-sm font-black text-rose-700">
                      Rp{" "}
                      {item.status === "kembali"
                        ? item.denda.toLocaleString("id-ID")
                        : (
                            hitungHariTerlambat(item.tanggal_harus_kembali) *
                            1000
                          ).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                {item.status === "ditolak" && item.keterangan && (
                  <div className="px-4 py-3 bg-rose-50 border-t border-rose-100 flex flex-col justify-center transition-colors dark:bg-rose-900/20 dark:border-rose-800">
                    <span className="block text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-1">
                      Alasan Penolakan:
                    </span>
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-300 italic">
                      "{item.keterangan}"
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* TOMBOL LOAD MORE */}
      {batasTampil < filteredRiwayat.length && (
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-slate-200 pt-8">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Menampilkan {batasTampil} dari {filteredRiwayat.length} riwayat
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setBatasTampil(batasTampil + 6)}
              className="px-6 py-2.5 bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              Tampilkan Lebih Banyak ⬇️
            </button>
            <button
              onClick={() => setBatasTampil(filteredRiwayat.length)}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              Tampilkan Semua
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarPinjamankuPage;
