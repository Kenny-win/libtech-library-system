import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import BookCard from "./components/katalog/BookCard";
import BookDetailModal from "./components/katalog/BookDetailModal";
import AddBookModal from "./components/katalog/AddBookModal";
import FilterBuku from "./components/katalog/FilterBuku";
import DaftarPinjamanPage from "./components/pinjaman/DaftarPinjamanPage";
import DaftarPinjamankuPage from "./components/pinjaman/DaftarPinjamankuPage";
import KategoriPage from "./components/kategori_buku/KategoriPage";
import CustomAlert from "./components/alert/CustomAlert";
import DasborAnalitikPage from "./components/dasbor/DasborAnalitikPage";
import LoginPage from "./components/user_and_authentication/LoginPage";
import ResetPasswordPage from "./components/user_and_authentication/ResetPasswordPage";
import Footer from "./components/Footer";
import ManajemenUserPage from "./components/user_and_authentication/ManajemenUserPage";

function App() {
  // const URL = "http://127.0.0.1:5000"; // INI GUNAKAN IP LOCAL 7 PROT : 5000
  const URL = "https://shrubs-anthem-parrot.ngrok-free.dev";
  // Rumus: Jam * Menit * Detik * Milidetik (2 jam session)
  const SESSION_DURATION = 2 * 60 * 60 * 1000;
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("libtech_user");
      const savedExpiry = localStorage.getItem("libtech_expiry");

      if (savedUser && savedExpiry) {
        const waktuSekarang = new Date().getTime();
        const waktuHabis = parseInt(savedExpiry);

        // Jika waktuHabis bukan angka (NaN) atau waktu sudah lewat, tolak login!
        if (isNaN(waktuHabis) || waktuSekarang > waktuHabis) {
          localStorage.removeItem("libtech_user");
          localStorage.removeItem("libtech_expiry");
          return null;
        }
        return JSON.parse(savedUser);
      }
      return null;
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      localStorage.removeItem("libtech_user");
      localStorage.removeItem("libtech_expiry");
      return null;
    }
  });

  const role = currentUser ? currentUser.peran : null;

  // STATE UNTUK DARK MODE
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Baca dari memori browser, default: light
    return localStorage.getItem("libtech_theme") === "dark";
  });

  // SUNTIKKAN CLASS 'dark' KE HTML
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("libtech_theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("libtech_theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // State untuk mode edit
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [bukuList, setBukuList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]); // State baru untuk kategori
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kontrol Modal Tambah Buku & Data Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("manual");
  const [formData, setFormData] = useState({
    judul: "",
    penulis: "",
    penerbit: "",
    tahun_terbit: "",
    stok: 1,
    isbn: "",
    id_kategori: 1,
    no_lemari: 1,
    no_rak: 1,
    tingkatan: "Umum",
    cover_drive_id: "",
  });

  // Kontrol Modal Detail Buku
  const [selectedBuku, setSelectedBuku] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Sakelar refresh data
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // STATE BARU UNTUK FILTER
  const [filters, setFilters] = useState({
    judul: "",
    penulis: "",
    penerbit: "",
    isbn: "",
    id_kategori: "",
  });

  const [sortOrder, setSortOrder] = useState("asc"); // Default: A-Z

  const [batasTampil, setBatasTampil] = useState(12);

  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem("libtech_activePage") || "katalog";
  }); // fleksibel ketika refresh

  // STATE UNTUK CUSTOM ALERT & CONFIRM
  const [alertData, setAlertData] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
  });

  const showAlert = (type, title, message) => {
    setAlertData({ isOpen: true, type, title, message, onConfirm: null });
  };

  const showConfirm = (title, message, onConfirmCallback) => {
    setAlertData({
      isOpen: true,
      type: "confirm",
      title,
      message,
      onConfirm: onConfirmCallback,
    });
  };

  const closeAlert = () => setAlertData((prev) => ({ ...prev, isOpen: false }));

  // Ambil data buku dari Backend
  useEffect(() => {
    let isMounted = true;
    const ambilDataBuku = async () => {
      try {
        const response = await fetch(`${URL}/api/buku`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        const result = await response.json();
        if (isMounted) {
          if (result.success) {
            setBukuList(result.data);
            setError(null);
          } else {
            setError(result.message);
          }
        }
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        if (isMounted) {
          setError(
            "Gagal terhubung ke server backend. Pastikan Node.js Anda sudah menyala.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Fungsi ambil data kategori
    const ambilDataKategori = async () => {
      try {
        const response = await fetch(`${URL}/api/kategori`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        const result = await response.json();
        if (isMounted && result.success) {
          setKategoriList(result.data);
        }
      } catch (err) {
        console.error("Gagal mengambil data kategori", err);
      }
    };

    // LOGIKA BARU: Hanya ambil ulang data JIKA user sedang membuka tab Katalog
    if (activePage === "katalog") {
      ambilDataBuku();
      ambilDataKategori();
    }

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger, activePage]);

  // DIhapus karena sudah menangani penyimpanan (setItem) di dalam
  // handleLoginSuccess dan penghapusan (removeItem) di dalam handleLogout,
  // maka blok useEffect ini sebenarnya sama sekali tidak diperlukan.
  // useEffect(() => {
  //   localStorage.setItem("libtech_user", currentUser);
  // }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("libtech_activePage", activePage);
  }, [activePage]);

  const handleLoginSuccess = (userData) => {
    const waktuKedaluwarsa = new Date().getTime() + SESSION_DURATION;

    setCurrentUser(userData);
    localStorage.setItem("libtech_user", JSON.stringify(userData));
    localStorage.setItem("libtech_expiry", waktuKedaluwarsa.toString());

    setActivePage(userData.peran === "admin" ? "dasbor" : "katalog");
  };

  const performLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("libtech_user");
    localStorage.removeItem("libtech_expiry");
  };

  const handleManualLogout = () => {
    showConfirm(
      "Konfirmasi Keluar",
      "Apakah Anda yakin ingin keluar dari portal perpustakaan?",
      () => {
        performLogout();
      },
    );
  };

  // TIMER AUTO-LOGOUT JIKA TAB DIBIARKAN TERBUKA
  useEffect(() => {
    if (currentUser) {
      const savedExpiry = localStorage.getItem("libtech_expiry");

      if (savedExpiry) {
        const sisaWaktu = parseInt(savedExpiry) - new Date().getTime();

        // Pastikan sisaWaktu adalah angka yang sah dan lebih dari 0
        if (!isNaN(sisaWaktu) && sisaWaktu > 0) {
          const timeoutId = setTimeout(() => {
            performLogout();
            showAlert(
              "warning",
              "Sesi Berakhir",
              "Waktu login Anda telah habis demi keamanan. Silakan masuk kembali.",
            );
          }, sisaWaktu);

          return () => clearTimeout(timeoutId);
        } else {
          // Jika waktu sudah minus atau rusak, baru logout
          setTimeout(() => {
            performLogout();
          }, 0);
        }
      } else {
        // Jika tidak ada data waktu, logout demi keamanan
        setTimeout(() => {
          performLogout();
        }, 0);
      }
    }
  }, [currentUser]); // Timer ini direset tiap kali ada perubahan user

  //FUNGSI HANDLER UNTUK FILTER
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setBatasTampil(12); //Reset batas tampil saat mencari buku
  };

  const handleResetFilter = () => {
    setFilters({
      judul: "",
      penulis: "",
      penerbit: "",
      isbn: "",
      id_kategori: "",
    });
    setBatasTampil(12); // Reset batas tampil
  };

  const handleSortChange = (newOrder) => {
    setSortOrder(newOrder);
    setBatasTampil(12); // Reset batas tampil saat mengubah urutan
  };

  // TAMBAHAN BARU: Menghitung jumlah buku untuk setiap kategori
  const kategoriDenganJumlah = kategoriList.map((kat) => {
    // Hitung berapa banyak buku di dalam bukuList yang memiliki id_kategori yang sama
    const jumlahBuku = bukuList.filter(
      (buku) => String(buku.id_kategori) === String(kat.id_kategori),
    ).length;

    // Gabungkan data kategori asli dengan properti baru 'jumlah'
    return {
      ...kat,
      jumlah: jumlahBuku,
    };
  });

  // LOGIKA FILTERING DATA
  // Daftar buku yang akan ditampilkan adalah bukuList yang sudah melewati filter
  const filteredBukuList = bukuList.filter((buku) => {
    // Ubah ke lowercase agar pencarian tidak sensitif huruf besar/kecil
    const matchJudul =
      buku.judul?.toLowerCase().includes(filters.judul.toLowerCase()) ?? false;
    const matchPenulis =
      buku.penulis?.toLowerCase().includes(filters.penulis.toLowerCase()) ??
      false;
    const matchPenerbit =
      buku.penerbit?.toLowerCase().includes(filters.penerbit.toLowerCase()) ??
      false;
    const matchIsbn =
      buku.isbn?.toLowerCase().includes(filters.isbn.toLowerCase()) ?? false;

    // Untuk kategori, pastikan id disamakan tipe datanya (string)
    const matchKategori =
      filters.id_kategori === "" ||
      String(buku.id_kategori) === String(filters.id_kategori);

    return (
      matchJudul && matchPenulis && matchPenerbit && matchIsbn && matchKategori
    );
  });

  // SORTING DATA BARU
  // Kita buat copy array dengan [...filteredBukuList] agar ga merusak array aslinya
  const sortedBukuList = [...filteredBukuList].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.judul.localeCompare(b.judul); // A - Z
    } else if (sortOrder === "desc") {
      return b.judul.localeCompare(a.judul); // Z - A
    } else if (sortOrder === "terbaru") {
      return b.id_buku - a.id_buku;
    }
    return 0;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Submit tambah/edit buku manual
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Tentukan URL dan Method berdasarkan mode Edit atau Tambah Baru
      const url = isEditMode ? `${URL}/api/buku/${editId}` : `${URL}/api/buku`;
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
        showAlert("success", "Sukses Tersimpan!", result.message);
        setIsModalOpen(false);
        setRefreshTrigger((prev) => prev + 1);
      } else {
        showAlert("error", "Gagal Menyimpan", result.message);
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      showAlert("error", "Terjadi kesalahan koneksi saat menyimpan data.");
    }
  };

  // Upload Excel bulk import
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const dataKirim = new FormData();
    dataKirim.append("file", file);
    try {
      setLoading(true);
      setIsModalOpen(false);
      const response = await fetch(`${URL}/api/buku/upload`, {
        method: "POST",
        body: dataKirim,
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      const result = await response.json();
      if (result.success) {
        showAlert("success", "Import Selesai", result.message);
        setRefreshTrigger((prev) => prev + 1);
      } else {
        showAlert("error", "Gagal Impor Excel", result.message);
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      showAlert("error", "Terjadi kesalahan koneksi saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  const bukaDetailBuku = (buku) => {
    setSelectedBuku(buku);
    setIsDetailModalOpen(true);
  };

  // FUNGSI HAPUS
  const handleDeleteBuku = (id_buku) => {
    // Gunakan showConfirm, lalu masukkan logika hapus di dalamnya
    showConfirm(
      "Hapus Buku?",
      "Apakah Anda yakin ingin menghapus buku ini secara permanen?",
      async () => {
        try {
          const response = await fetch(`${URL}/api/buku/${id_buku}`, {
            method: "DELETE",
            headers: { "ngrok-skip-browser-warning": "true" },
          });
          const result = await response.json();

          if (result.success) {
            showAlert(
              "success",
              "Terhapus!",
              "Buku berhasil dihapus dari katalog.",
            );
            setIsDetailModalOpen(false);
            setBukuList((prevList) =>
              prevList.filter((buku) => buku.id_buku !== id_buku),
            );
          } else {
            showAlert("error", "Gagal", result.message);
          }
          // eslint-disable-next-line no-unused-vars
        } catch (err) {
          showAlert(
            "error",
            "Koneksi Terputus",
            "Terjadi kesalahan koneksi saat menghapus data.",
          );
        }
      },
    );
  };

  // FUNGSI SAAT TOMBOL EDIT DIKLIK (Di dalam Modal Detail)
  const handleEditClick = (buku) => {
    setIsDetailModalOpen(false); // Tutup modal detail

    // Isi formData dengan data buku yang dipilih
    setFormData({
      judul: buku.judul,
      penulis: buku.penulis,
      penerbit: buku.penerbit,
      tahun_terbit: buku.tahun_terbit,
      stok: buku.stok,
      isbn: buku.isbn,
      id_kategori: buku.id_kategori,
      no_lemari: buku.no_lemari,
      no_rak: buku.no_rak,
      tingkatan: buku.tingkatan,
      cover_drive_id: buku.cover_drive_id || "",
    });

    setIsEditMode(true);
    setEditId(buku.id_buku);
    setModalTab("manual");
    setIsModalOpen(true); // Buka modal form (AddBookModal)
  };

  // FUNGSI REQUEST PINJAM BUKU (OLEH SISWA/PEGAWAI)
  const handlePinjamBuku = async (buku) => {
    if (buku.stok <= 0) {
      showAlert(
        "warning",
        "Stok Habis",
        "Maaf, buku ini sedang habis dipinjam.",
      );
      return;
    }

    const idUserAsli = currentUser.id_user;

    // Gunakan showConfirm
    showConfirm(
      "Konfirmasi Pinjam",
      `Ajukan peminjaman untuk buku "${buku.judul}"?`,
      async () => {
        try {
          const response = await fetch(`${URL}/api/peminjaman`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_buku: buku.id_buku,
              id_user: idUserAsli,
            }),
          });
          const result = await response.json();

          if (result.success) {
            showAlert("success", "Berhasil Diajukan!", result.message);
            setIsDetailModalOpen(false);

            // ---> PERBAIKAN: Refresh Katalog agar stok buku langsung berkurang di layar <---
            // Sebelumnya ini di-komen/tidak ada. Sekarang wajib dinyalakan!
            setRefreshTrigger((prev) => prev + 1);
          } else {
            // Akan memunculkan peringatan jika User mencoba meminjam buku yang sama
            showAlert("warning", "Tidak Dapat Meminjam", result.message);
          }
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
          showAlert(
            "error",
            "Koneksi Error",
            "Terjadi kesalahan koneksi saat meminjam buku.",
          );
        }
      },
    );
  };

  if (!currentUser) {
    return (
      <>
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          showAlert={showAlert}
          URL={URL}
        />
        <CustomAlert
          isOpen={alertData.isOpen}
          type={alertData.type}
          title={alertData.title}
          message={alertData.message}
          onClose={closeAlert}
          onConfirm={alertData.onConfirm}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 font-sans antialiased">
      <Navbar
        role={role}
        currentUser={currentUser}
        onLogout={handleManualLogout}
        activePage={activePage}
        setActivePage={setActivePage}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activePage === "katalog" && (
          <>
            <Header
              role={role}
              onAddBookClick={() => {
                setIsEditMode(false); // Pastikan bukan mode edit
                setEditId(null);
                // Kosongkan form
                setFormData({
                  judul: "",
                  penulis: "",
                  penerbit: "",
                  tahun_terbit: "",
                  stok: 1,
                  isbn: "",
                  id_kategori: 1,
                  no_lemari: 1,
                  no_rak: 1,
                  tingkatan: "Umum",
                  cover_drive_id: "",
                });
                setIsModalOpen(true);
                setModalTab("manual");
              }}
            />

            {/* PANGGIL KOMPONEN FILTER DI SINI */}
            {!loading && !error && (
              <FilterBuku
                filters={filters}
                onFilterChange={handleFilterChange}
                // Gunakan variabel yang sudah ada jumlahnya
                kategoriList={kategoriDenganJumlah}
                onReset={handleResetFilter}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
              />
            )}

            {/* LOADING & ERROR STATES */}
            {loading && (
              <div className="text-center py-20 text-slate-500 font-semibold text-lg animate-pulse">
                Synchronizing Data Catalog...
              </div>
            )}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-5 py-4 rounded-xl mb-8 shadow-xs">
                ⚠️ {error}
              </div>
            )}

            {/* GRID UTAMA KATALOG BUKU */}
            {/* GUNAKAN sortedBukuList BUKAN filteredBukuList Llagi */}
            {!loading && !error && (
              <>
                {sortedBukuList.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <span className="text-4xl block mb-3">🧐</span>
                    <h3 className="text-lg font-bold text-slate-700">
                      Tidak ada buku yang cocok
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Coba ubah kata kunci filter Anda.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4">
                    {/* GRID UTAMA */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {/* POTONG ARRAY HANYA SEBANYAK batasTampil */}
                      {sortedBukuList.slice(0, batasTampil).map((buku) => (
                        <BookCard
                          key={buku.id_buku}
                          buku={buku}
                          onDetailClick={bukaDetailBuku}
                          role={role}
                          onPinjamClick={handlePinjamBuku}
                        />
                      ))}
                    </div>

                    {/* TOMBOL LOAD MORE (Hanya muncul jika masih ada buku yang disembunyikan) */}
                    {batasTampil < sortedBukuList.length && (
                      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-slate-200 pt-8">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Menampilkan {batasTampil} dari {sortedBukuList.length}{" "}
                          buku
                        </p>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setBatasTampil(batasTampil + 12)}
                            className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
                          >
                            Tampilkan Lebih Banyak ⬇️
                          </button>

                          <button
                            onClick={() =>
                              setBatasTampil(sortedBukuList.length)
                            }
                            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
                          >
                            Tampilkan Semua
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Jika semua buku sudah tampil */}
                    {batasTampil >= sortedBukuList.length &&
                      sortedBukuList.length > 12 && (
                        <div className="mt-10 text-center border-t border-slate-200 pt-8">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            ✅ Semua {sortedBukuList.length} buku telah
                            ditampilkan
                          </p>
                        </div>
                      )}
                  </div>
                )}
              </>
            )}
          </>
        )}
        {activePage === "peminjaman" && role === "admin" && (
          <DaftarPinjamanPage
            showAlert={showAlert}
            showConfirm={showConfirm}
            URL={URL}
          />
        )}
        {activePage === "pinjamanku" && role !== "admin" && (
          <DaftarPinjamankuPage
            role={role}
            currentUser={currentUser}
            URL={URL}
          />
        )}
        {activePage === "kategori" && role === "admin" && (
          <KategoriPage
            showAlert={showAlert}
            showConfirm={showConfirm}
            URL={URL}
          />
        )}
        {activePage === "dasbor" && role === "admin" && (
          <DasborAnalitikPage isDarkMode={isDarkMode} URL={URL} />
        )}
        {activePage === "reset-password" && role === "admin" && (
          <ResetPasswordPage
            showAlert={showAlert}
            showConfirm={showConfirm}
            URL={URL}
          />
        )}
        {activePage === "manajemen-user" && role === "admin" && (
          <ManajemenUserPage
            showAlert={showAlert}
            showConfirm={showConfirm}
            URL={URL}
          />
        )}
      </main>

      <Footer />

      <BookDetailModal
        isOpen={isDetailModalOpen}
        buku={selectedBuku}
        onClose={() => setIsDetailModalOpen(false)}
        role={role}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteBuku}
        onPinjamClick={handlePinjamBuku}
      />

      <AddBookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalTab={modalTab}
        setModalTab={setModalTab}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        handleExcelUpload={handleExcelUpload}
        kategoriList={kategoriList}
        isEditMode={isEditMode}
      />

      <CustomAlert
        isOpen={alertData.isOpen}
        type={alertData.type}
        title={alertData.title}
        message={alertData.message}
        onClose={closeAlert}
        onConfirm={alertData.onConfirm}
      />
    </div>
  );
}

export default App;
