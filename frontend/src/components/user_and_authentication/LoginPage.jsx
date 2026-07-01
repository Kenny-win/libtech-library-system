import { useState } from "react";
import logoPerusahaan from "../../assets/bc.jpeg"; // Sesuaikan jika namanya berbeda
import gambarSekolah from "../../assets/slider-1-1024x513.jpg";

const LoginPage = ({ onLoginSuccess, showAlert, URL }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showAlert(
        "warning",
        "Data Tidak Lengkap",
        "Silakan isi email dan password Anda.",
      );
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        onLoginSuccess(result.data);
      } else {
        showAlert("error", "Login Gagal", result.message);
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      showAlert(
        "error",
        "Koneksi Terputus",
        "Tidak dapat terhubung ke server.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi Lupa Password
  const handleLupaPassword = async () => {
    // Gunakan state 'email' dari form
    if (!email) {
      showAlert(
        "warning",
        "Isi Email Terlebih Dahulu",
        "Silakan ketik alamat email Anda di kolom Email di atas, lalu klik Lupa Password lagi.",
      );
      return; // Hentikan proses jika email kosong
    }

    try {
      // Tembak API menggunakan email yang sudah diketik user
      const response = await fetch(
        `${URL}/api/auth/lupa-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
          body: JSON.stringify({ email: email }),
        },
      );

      const result = await response.json();

      if (result.success) {
        showAlert("success", "Pengajuan Terkirim!", result.message);
      } else {
        showAlert("warning", "Gagal", result.message);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      showAlert(
        "error",
        "Koneksi Terputus",
        "Tidak dapat terhubung ke server.",
      );
    }
  };

  return (
    // BACKGROUND FULL SCREEN DENGAN GAMBAR SEKOLAH/PERPUSTAKAAN
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${gambarSekolah})` }}
    >
      {/* OVERLAY GELAP (Agar teks dan form tetap terbaca jelas meski backgroundnya terang) */}
      <div className="absolute inset-0 bg-slate-900/40"></div>

      {/* KOTAK FORM GLASSMORPHISM (bg-white/80, backdrop-blur-md) */}
      <div className="relative z-10 max-w-md w-full bg-white/60 backdrop-blur-md rounded-4xl shadow-2xl border border-white/50 p-8 sm:p-10 transition-all">
        <div className="text-center mb-8">
          {/* Logo dengan background putih bulat agar menonjol */}
          <div className="inline-block p-3 bg-white rounded-2xl shadow-sm mb-4">
            <img
              src={logoPerusahaan}
              alt="Logo"
              className="h-12 md:h-14 object-contain"
            />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight drop-shadow-xs">
            Selamat Datang!
          </h2>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Silakan masuk ke portal perpustakaan
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1 drop-shadow-xs">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // Input dibuat semi-transparan dengan border yang halus
              className="w-full px-4 py-3 border border-white/60 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 bg-white/60 focus:bg-white text-slate-800 placeholder-slate-400 transition-all shadow-inner"
              placeholder="Contoh: admin@sekolah.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1 drop-shadow-xs">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-white/60 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 bg-white/60 focus:bg-white text-slate-800 placeholder-slate-400 transition-all shadow-inner"
                placeholder="Masukkan kata sandi..."
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-800 cursor-pointer"
                title={
                  showPassword ? "Sembunyikan Password" : "Tampilkan Password"
                }
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {/* TAUTAN LUPA PASSWORD DI SINI */}
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handleLupaPassword}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors drop-shadow-xs cursor-pointer"
              >
                Lupa Password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 mt-4 rounded-xl text-white font-bold shadow-lg shadow-blue-500/30 transition-all ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer hover:-translate-y-0.5"
            }`}
          >
            {isLoading ? "Memproses..." : "Masuk Sekarang"}
          </button>
        </form>
      </div>

      <p className="relative z-10 text-xs text-white/80 mt-8 font-medium drop-shadow-md tracking-wider">
        &copy; {new Date().getFullYear()} SISTEM PERPUSTAKAAN SEKOLAH
      </p>
    </div>
  );
};

export default LoginPage;
