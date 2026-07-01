/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const ManajemenUserPage = ({ showAlert, showConfirm, URL }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [batasTampil, setBatasTampil] = useState(10);

  // STATE KELAS PADA FILTER
  const [filters, setFilters] = useState({
    nama: "",
    email: "",
    nis_nip: "",
    peran: "",
    kelas: "",
    tanggal: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    nis_nip: "",
    nama: "",
    email: "",
    password: "",
    peran: "siswa",
    kelas: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${URL}/api/users`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        const result = await res.json();
        if (result.success) setUsers(result.data);
      } catch (err) {
        showAlert(
          "error",
          "Koneksi Gagal",
          "Tidak dapat memuat data pengguna.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [URL, refreshTrigger, showAlert]);

  // RESET FILTER KELAS OTOMATIS SAAT PERAN DIUBAH
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "peran" && value !== "siswa") {
      setFilters({ ...filters, [name]: value, kelas: "" });
    } else {
      setFilters({ ...filters, [name]: value });
    }
    setBatasTampil(10);
  };

  const handleResetFilter = () => {
    setFilters({
      nama: "",
      email: "",
      nis_nip: "",
      peran: "",
      kelas: "",
      tanggal: "",
    });
    setBatasTampil(10);
  };

  // LOGIKA FILTER KELAS
  const filteredUsers = users.filter((u) => {
    const matchNama =
      u.nama?.toLowerCase().includes(filters.nama.toLowerCase()) ?? false;
    const matchEmail =
      u.email?.toLowerCase().includes(filters.email.toLowerCase()) ?? false;
    const matchNis =
      u.nis_nip?.toLowerCase().includes(filters.nis_nip.toLowerCase()) ?? false;
    const matchPeran = filters.peran === "" || u.peran === filters.peran;

    // Logika pencarian kelas
    const matchKelas =
      filters.kelas === "" ||
      (u.kelas?.toLowerCase().includes(filters.kelas.toLowerCase()) ?? false);

    const userTgl = new Date(u.created_at).toISOString().split("T")[0];
    const matchTanggal = filters.tanggal === "" || userTgl === filters.tanggal;

    // Masukkan matchKelas ke pengembalian nilai
    return (
      matchNama &&
      matchEmail &&
      matchNis &&
      matchPeran &&
      matchKelas &&
      matchTanggal
    );
  });

  const handleExportExcel = () => {
    if (filteredUsers.length === 0) {
      showAlert(
        "warning",
        "Data Kosong",
        "Tidak ada data yang bisa di-export.",
      );
      return;
    }

    const dataExport = filteredUsers.map((u, index) => ({
      No: index + 1,
      "NIS/NIP": u.nis_nip,
      "Nama Lengkap": u.nama,
      Email: u.email,
      Peran: u.peran.toUpperCase(),
      Kelas: u.kelas || "-",
      "Tanggal Daftar": new Date(u.created_at).toLocaleDateString("id-ID"),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataExport);
    ws["!cols"] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 25 },
      { wch: 25 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Data Pengguna");
    XLSX.writeFile(wb, "Laporan_Data_Pengguna.xlsx");
  };

  // FUNGSI MENGHAPUS USER
  const handleDelete = (id_user, nama_user) => {
    showConfirm(
      "Hapus Pengguna?",
      `Apakah Anda yakin ingin menghapus data pengguna "${nama_user}" secara permanen?`,
      async () => {
        try {
          const response = await fetch(`${URL}/api/users/${id_user}`, {
            method: "DELETE",
            headers: { "ngrok-skip-browser-warning": "true" }
          });
          const result = await response.json();

          if (result.success) {
            showAlert("success", "Berhasil Dihapus", result.message);
            setRefreshTrigger((prev) => prev + 1);
          } else {
            showAlert("error", "Gagal Menghapus", result.message);
          }
        } catch (err) {
          showAlert("error", "Koneksi Terputus", "Terjadi kesalahan koneksi.");
        }
      },
    );
  };

  // FUNGSI BUKA MODAL EDIT
  const handleEditClick = (user) => {
    setIsEditMode(true);
    setEditId(user.id_user);
    // Masukkan data lama ke form. Password dikosongkan agar Admin tidak melihat password asli user
    setFormData({
      nis_nip: user.nis_nip,
      nama: user.nama,
      email: user.email,
      password: "", // Kosong berarti tidak ingin diubah
      peran: user.peran,
      kelas: user.kelas || "",
    });
    setIsModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditMode
        ? `${URL}/api/users/${editId}`
        : `${URL}/api/users`;
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (result.success) {
        showAlert("success", "Berhasil", result.message);
        setIsModalOpen(false);
        setFormData({
          nis_nip: "",
          nama: "",
          email: "",
          password: "",
          peran: "siswa",
          kelas: "",
        });
        setRefreshTrigger((prev) => prev + 1);
      } else {
        showAlert("error", "Gagal Menyimpan", result.message);
      }
    } catch (err) {
      showAlert("error", "Koneksi Error", "Gagal menghubungi server.");
    }
  };

  const handleDownloadTemplate = () => {
    const headers = ["NIS/NIP", "Nama", "Email", "Password", "Peran", "Kelas"];
    const dummyData = [
      ["12345", "Budi Santoso", "budi@siswa.com", "budi123", "siswa", "IX-1"],
      ["67890", "Pak Guru", "guru@sekolah.com", "guru123", "pegawai", ""],
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dummyData]);
    ws["!cols"] = [
      { wch: 15 },
      { wch: 25 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Template User");
    XLSX.writeFile(wb, "template_import_user.xlsx");
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showConfirm(
      "Upload Excel?",
      `Anda akan mengimpor data dari file ${file.name}. Lanjutkan?`,
      async () => {
        const formData = new FormData();
        formData.append("file", file);

        try {
          setIsUploading(true);
          const response = await fetch(`${URL}/api/users/upload`, {
            method: "POST",
            body: formData,
            headers: { "ngrok-skip-browser-warning": "true" }
          });
          const result = await response.json();

          if (result.success) {
            showAlert("success", "Import Selesai", result.message);
            setRefreshTrigger((prev) => prev + 1);
          } else {
            showAlert("error", "Gagal Impor", result.message);
          }
        } catch (err) {
          showAlert(
            "error",
            "Terjadi Kesalahan",
            "Gagal menghubungi server saat upload.",
          );
        } finally {
          setIsUploading(false);
          e.target.value = "";
        }
      },
    );
  };

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8 mt-4 md:mt-0">
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Manajemen User
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Kelola daftar Siswa, Pegawai, dan Admin perpustakaan.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 md:mt-0 md:ml-4">
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center px-4 py-2 border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            📥 Template
          </button>
          <label
            className={`inline-flex items-center px-4 py-2 text-emerald-700 border border-emerald-500 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isUploading ? "Mengunggah..." : "📤 Import Excel"}
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleExcelUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            📊 Export Data
          </button>
          <button
            onClick={() => {
              setIsEditMode(false);
              setEditId(null);
              setFormData({
                nis_nip: "",
                nama: "",
                email: "",
                password: "",
                peran: "siswa",
                kelas: "",
              });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            + Tambah Manual
          </button>
        </div>
      </div>

      {/* FILTER PENCARIAN */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center gap-4 transition-colors">
        {/* UBAH JUMLAH GRID AGAR MENAMPUNG KELAS */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Nama
            </label>
            <input
              type="text"
              name="nama"
              value={filters.nama}
              onChange={handleFilterChange}
              placeholder="Cari nama..."
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-xs focus:outline-hidden dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Email
            </label>
            <input
              type="text"
              name="email"
              value={filters.email}
              onChange={handleFilterChange}
              placeholder="Cari email..."
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-xs focus:outline-hidden dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              NIS/NIP
            </label>
            <input
              type="text"
              name="nis_nip"
              value={filters.nis_nip}
              onChange={handleFilterChange}
              placeholder="Cari NIS/NIP..."
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-xs focus:outline-hidden dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Peran
            </label>
            <select
              name="peran"
              value={filters.peran}
              onChange={handleFilterChange}
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-xs focus:outline-hidden dark:bg-slate-700 dark:text-white cursor-pointer"
            >
              <option value="">Semua Peran</option>
              <option value="admin">Admin</option>
              <option value="pegawai">Pegawai</option>
              <option value="siswa">Siswa</option>
            </select>
          </div>

          {/* INPUT FILTER KELAS HANYA MUNCUL JIKA SISWA */}
          {filters.peran === "siswa" && (
            <div className="animate-fadeIn">
              <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Kelas
              </label>
              <input
                type="text"
                name="kelas"
                value={filters.kelas}
                onChange={handleFilterChange}
                placeholder="Contoh: IX-4..."
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-xs focus:outline-hidden dark:bg-slate-700 dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Tgl Daftar
            </label>
            <input
              type="date"
              name="tanggal"
              value={filters.tanggal}
              onChange={handleFilterChange}
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-xs focus:outline-hidden dark:bg-slate-700 dark:text-white"
            />
          </div>
        </div>
        <button
          onClick={handleResetFilter}
          className="text-[11px] text-slate-500 hover:text-rose-600 font-bold underline whitespace-nowrap mt-4 md:mt-0 cursor-pointer"
        >
          Reset Filter
        </button>
      </div>

      {/* TABEL USER */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto transition-colors">
        {loading ? (
          <div className="text-center py-20 animate-pulse font-bold text-slate-500">
            Memuat Data Pengguna...
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300 min-w-175">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                  Nama / Email
                </th>
                <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                  NIS/NIP
                </th>
                <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 text-center whitespace-nowrap">
                  Peran
                </th>
                <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 text-center whitespace-nowrap">
                  Tanggal Daftar
                </th>
                <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 text-center whitespace-nowrap">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredUsers.length > 0 ? (
                filteredUsers.slice(0, batasTampil).map((u) => (
                  <tr
                    key={u.id_user}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {u.nama}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        {u.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                      {u.nis_nip}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.peran === "admin"
                            ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
                            : u.peran === "pegawai"
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        }`}
                      >
                        {u.peran} {u.kelas ? `(${u.kelas})` : ""}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-xs whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEditClick(u)}
                          className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(u.id_user, u.nama)}
                          className="px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-10">
                    Data tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* TOMBOL LOAD MORE DENGAN TAMPILAN LENGKAP */}
      {!loading && batasTampil < filteredUsers.length && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Menampilkan {batasTampil} dari {filteredUsers.length} data
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setBatasTampil(batasTampil + 10)}
              className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              Lebih Banyak ⬇️
            </button>
            <button
              onClick={() => setBatasTampil(filteredUsers.length)}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              Tampilkan Semua
            </button>
          </div>
        </div>
      )}

      {/* Teks indikator jika semua data sudah tertampil */}
      {!loading &&
        batasTampil >= filteredUsers.length &&
        filteredUsers.length > 10 && (
          <div className="mt-6 text-center pt-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              ✅ Semua {filteredUsers.length} pengguna telah ditampilkan
            </p>
          </div>
        )}

      {/* MODAL FORM TAMBAH MANUAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-8 border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {isEditMode ? "Edit Pengguna" : "Tambah Pengguna"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    NIS / NIP *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nis_nip}
                    onChange={(e) =>
                      setFormData({ ...formData, nis_nip: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Peran *
                  </label>
                  <select
                    value={formData.peran}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        peran: e.target.value,
                        kelas: "",
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:bg-slate-700 dark:text-white"
                  >
                    <option value="siswa">Siswa</option>
                    <option value="pegawai">Pegawai</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:bg-slate-700 dark:text-white"
                />
              </div>

              {formData.peran === "siswa" && (
                <div className="animate-fadeIn">
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Kelas (Misal: IX-4) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.kelas}
                    onChange={(e) =>
                      setFormData({ ...formData, kelas: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:bg-slate-700 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Alamat Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Kata Sandi (Password) {isEditMode ? "" : "*"}
                </label>
                <input
                  type="text"
                  required={!isEditMode}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:bg-slate-700 dark:text-white"
                  placeholder={
                    isEditMode
                      ? "Kosongkan jika tidak ingin ganti sandi"
                      : "Min. 5 karakter"
                  }
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-sm cursor-pointer"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManajemenUserPage;
