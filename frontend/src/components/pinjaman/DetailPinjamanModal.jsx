import { useState } from "react";

const DetailPinjamanModal = ({ isOpen, pinjaman, onClose, onUpdateStatus, showAlert }) => {
  // BUAT FUNGSI HELPER UNTUK ZONA WAKTU LOKAL
  const getLocalDateString = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Mengimbangi perbedaan zona waktu (offset) agar akurat dengan waktu lokal browser
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - tzOffset);
    return localDate.toISOString().split("T")[0];
  };
  // Ambil tanggal default secara langsung saat komponen pertama kali dimuat
  const defaultDate = pinjaman
    ? getLocalDateString(pinjaman.tanggal_harus_kembali)
    : "";
  const minDate = pinjaman ? getLocalDateString(pinjaman.tanggal_pinjam) : "";

  const [tenggatKembali, setTenggatKembali] = useState(defaultDate);

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

  if (!isOpen || !pinjaman) return null;

  const isPending =
    pinjaman.status === "pending" || pinjaman.status === "menunggu";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col md:flex-row">
        {/* KOLOM KIRI: Foto Buku & Identitas Peminjam */}
        <div className="w-full md:w-2/5 bg-slate-50 p-6 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col gap-6">
          <div className="h-64 bg-slate-200 rounded-xl flex items-center justify-center overflow-hidden relative shadow-inner">
            {pinjaman.cover_drive_id ? (
              <img
                src={`https://lh3.googleusercontent.com/d/${pinjaman.cover_drive_id}`}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <span className="text-6xl block mb-2">📖</span>
                <span className="text-xs text-slate-400 font-bold">
                  No Cover
                </span>
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">
              Informasi Peminjam
            </h4>
            <div className="font-extrabold text-slate-900 text-lg">
              {pinjaman.nama}
            </div>
            <div className="text-xs text-slate-500 font-mono mt-1">
              NIS/NIP: {pinjaman.nis_nip}
            </div>
            <div className="inline-block mt-2 px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded-md border border-blue-100">
              {pinjaman.peran} {pinjaman.kelas ? ` - ${pinjaman.kelas}` : ""}
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Detail Buku, Form Tenggat, dan Aksi */}
        <div className="w-full md:w-3/5 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  isPending
                    ? "bg-amber-100 text-amber-700"
                    : pinjaman.status === "dipinjam"
                      ? "bg-blue-100 text-blue-700"
                      : pinjaman.status === "kembali"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                }`}
              >
                STATUS: {pinjaman.status}
              </span>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 leading-snug mb-2">
              {pinjaman.judul}
            </h3>

            <div className="grid grid-cols-2 gap-y-3 text-sm border-y border-slate-100 py-4 my-4">
              <div>
                <span className="text-slate-400 block text-xs">Penulis</span>
                <span className="font-semibold text-slate-800">
                  {pinjaman.penulis || "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Penerbit</span>
                <span className="font-semibold text-slate-800">
                  {pinjaman.penerbit || "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">
                  Tgl Mengajukan
                </span>
                <span className="font-semibold text-slate-800">
                  {new Date(pinjaman.tanggal_pinjam).toLocaleDateString(
                    "id-ID",
                  )}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">
                  Sisa Stok Buku
                </span>
                <span className="font-semibold text-slate-800">
                  {pinjaman.stok} Eks
                </span>
              </div>
            </div>

            {/* BLOK INFO DENDA DI SINI*/}
            {pinjaman.status === "kembali" && pinjaman.denda > 0 && (
              <div className="mb-4 bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-rose-700">
                    Denda Keterlambatan ({pinjaman.jumlah_hari_terlambat} hari)
                  </span>
                  <span className="block text-[10px] text-rose-500">
                    Buku dikembalikan pada{" "}
                    {new Date(pinjaman.tanggal_kembali_asli).toLocaleDateString(
                      "id-ID",
                    )}
                  </span>
                </div>
                <span className="text-lg font-black text-rose-700">
                  Rp {pinjaman.denda.toLocaleString("id-ID")}
                </span>
              </div>
            )}

            {pinjaman.status === "dipinjam" &&
              hitungHariTerlambat(pinjaman.tanggal_harus_kembali) > 0 && (
                <div className="mb-4 bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold text-amber-700">
                      ⚠️ Peringatan !! <br /> Keterlambatan Pengembalian Buku
                    </span>
                    <span className="block text-[11px] text-amber-600">
                      Terlewat{" "}
                      {hitungHariTerlambat(pinjaman.tanggal_harus_kembali)} hari
                      dari tenggat waktu.
                    </span>
                  </div>
                  {/* HANYA TAMPILKAN NOMINAL ESTIMASI DENDA JIKA PERAN = SISWA */}
                  {pinjaman.peran === "siswa" && (
                    <div className="text-right">
                      <span className="block text-[10px] text-amber-600 uppercase font-bold">
                        Estimasi Denda
                      </span>
                      <span className="text-lg font-black text-amber-700">
                        Rp{" "}
                        {(
                          hitungHariTerlambat(pinjaman.tanggal_harus_kembali) *
                          1000
                        ).toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                </div>
              )}

            {/* FORM TENGGAT WAKTU (Hanya aktif jika status Pending) */}
            <div
              className={`p-4 rounded-xl border ${isPending ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"}`}
            >
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Tenggat Waktu Kembali:
              </label>
              <input
                type="date"
                min={minDate}
                value={tenggatKembali}
                onChange={(e) => setTenggatKembali(e.target.value)}
                disabled={!isPending}
                className={`w-full px-3 py-2 border rounded-xl text-sm font-semibold focus:outline-hidden ${isPending ? "border-blue-300 bg-white" : "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"}`}
              />
              {isPending && (
                <p className="text-[10px] text-blue-600 mt-1">
                  *Anda bisa menyesuaikan tenggat waktu ini sebelum menyetujui.
                </p>
              )}
            </div>
          </div>

          {/* BAGIAN TOMBOL AKSI */}
          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-5 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Tutup
            </button>

            {isPending && (
              <>
                <button
                  onClick={() =>
                    onUpdateStatus(pinjaman.id_peminjaman, "ditolak")
                  }
                  className="px-5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                >
                  Tolak Pinjaman
                </button>
                <button
                  onClick={() => {
                    if (tenggatKembali < minDate) {
                      showAlert("warning",
                        "Tenggat kembali tidak boleh lebih awal dari tanggal pinjam!",
                      );
                      return;
                    }
                    onUpdateStatus(
                      pinjaman.id_peminjaman,
                      "dipinjam",
                      tenggatKembali,
                    );
                  }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Setujui Pinjaman
                </button>
              </>
            )}

            {pinjaman.status === "dipinjam" && (
              <button
                onClick={() =>
                  onUpdateStatus(pinjaman.id_peminjaman, "kembali")
                }
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-xs transition-colors cursor-pointer"
              >
                Tandai Sudah Kembali
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPinjamanModal;
