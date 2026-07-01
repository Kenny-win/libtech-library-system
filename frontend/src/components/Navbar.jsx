import { useState } from "react";
import logoPerusahaan from "../assets/bc.jpeg";

// isDarkMode dan toggleDarkMode
const Navbar = ({ role, currentUser, onLogout, activePage, setActivePage, isDarkMode, toggleDarkMode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* BAGIAN KIRI: Logo & Menu Desktop */}
          <div className="flex shrink-0 items-center">
            <div className="bg-white p-1 rounded-lg">
              <img src={logoPerusahaan} alt="Logo Perusahaan" className="h-8 md:h-12 w-auto object-contain cursor-pointer" />
            </div>
            
            <div className="ml-4 xl:ml-8 hidden xl:flex gap-4 xl:gap-6 border-l border-slate-200 dark:border-slate-600 pl-4 xl:pl-8 items-center">
              
              {role === "admin" && (
                <button 
                  onClick={() => setActivePage("dasbor")}
                  className={`text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    activePage === "dasbor" ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                >
                  📈 Dasbor
                </button>
              )}

              <button 
                onClick={() => setActivePage("katalog")}
                className={`text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  activePage === "katalog" ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                📚 Katalog Buku
              </button>

              {role === "admin" && (
                <>
                  <button 
                    onClick={() => setActivePage("peminjaman")}
                    className={`text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      activePage === "peminjaman" ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  >
                    🔄 Peminjaman
                  </button>
                  <div className="relative group py-5">
                    <button className={`flex items-center gap-1 text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      ["kategori", "manajemen-user", "reset-password"].includes(activePage) 
                        ? "text-blue-600 dark:text-blue-400" 
                        : "text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}>
                      ⚙️ Data Master
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Kotak Dropdown yang muncul saat di-hover */}
                    <div className="absolute top-full left-0 mt-0 w-48 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden z-50">
                      <button 
                        onClick={() => setActivePage("kategori")}
                        className={`text-left px-4 py-3 text-sm font-bold transition-colors ${activePage === "kategori" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                      >
                        📂 Kategori Buku
                      </button>
                      <button 
                        onClick={() => setActivePage("manajemen-user")}
                        className={`text-left px-4 py-3 text-sm font-bold border-t border-slate-100 dark:border-slate-700 transition-colors ${activePage === "manajemen-user" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                      >
                        👥 Manajemen User
                      </button>
                      <button 
                        onClick={() => setActivePage("reset-password")}
                        className={`text-left px-4 py-3 text-sm font-bold border-t border-slate-100 dark:border-slate-700 transition-colors ${activePage === "reset-password" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                      >
                        🔑 Keamanan User
                      </button>
                    </div>
                  </div>
                </>
              )}

              {role !== "admin" && (
                <button 
                  onClick={() => setActivePage("pinjamanku")}
                  className={`text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    activePage === "pinjamanku" ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                >
                  📖 Pinjamanku
                </button>
              )}
            </div>
          </div>

          {/* BAGIAN KANAN: Tombol Dark Mode, Profil & Logout */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0 ml-4">
            
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              title={isDarkMode ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
              )}
            </button>

            {currentUser && (
              <div className="hidden sm:flex flex-col items-end border-l border-slate-200 dark:border-slate-600 pl-4">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                  {currentUser.peran === "admin" ? "Pustakawan" : currentUser.peran === "pegawai" ? "Pegawai" : "Siswa"}
                </span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 whitespace-nowrap">
                  {currentUser.nama}
                </span>
              </div>
            )}

            <button onClick={onLogout} className="text-[11px] md:text-xs font-bold bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-800/50 text-rose-600 dark:text-rose-400 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-rose-200 dark:border-rose-800 cursor-pointer transition-colors whitespace-nowrap">
              Keluar
            </button>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="xl:hidden p-1.5 rounded-md text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
          
        </div>
      </div>

      {/* MENU MOBILE / TABLET */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 flex flex-col gap-3 shadow-inner">
          
          {role === "admin" && (
            <button onClick={() => { setActivePage("dasbor"); setIsMobileMenuOpen(false); }} className={`text-left text-sm font-bold px-3 py-2 rounded-lg transition-colors ${activePage === "dasbor" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
              📈 Dasbor
            </button>
          )}

          <button onClick={() => { setActivePage("katalog"); setIsMobileMenuOpen(false); }} className={`text-left text-sm font-bold px-3 py-2 rounded-lg transition-colors ${activePage === "katalog" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
            📚 Katalog Buku
          </button>
          
          {role === "admin" && (
            <>
              <button onClick={() => { setActivePage("peminjaman"); setIsMobileMenuOpen(false); }} className={`text-left text-sm font-bold px-3 py-2 rounded-lg transition-colors ${activePage === "peminjaman" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
                🔄 Peminjaman
              </button>
              
              {/* Di Mobile, menu dropdown kita jabarkan ke bawah saja */}
              <div className="border-t border-slate-200 dark:border-slate-600 my-1 pt-2">
                <span className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Data Master</span>
                <button onClick={() => { setActivePage("kategori"); setIsMobileMenuOpen(false); }} className={`w-full text-left text-sm font-bold px-3 py-2 rounded-lg transition-colors ${activePage === "kategori" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
                  📂 Kategori Buku
                </button>
                <button onClick={() => { setActivePage("manajemen-user"); setIsMobileMenuOpen(false); }} className={`w-full text-left text-sm font-bold px-3 py-2 rounded-lg transition-colors ${activePage === "manajemen-user" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
                  👥 Manajemen User
                </button>
                <button onClick={() => { setActivePage("reset-password"); setIsMobileMenuOpen(false); }} className={`w-full text-left text-sm font-bold px-3 py-2 rounded-lg transition-colors ${activePage === "reset-password" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
                  🔑 Keamanan User
                </button>
              </div>
            </>
          )}

          {role !== "admin" && (
            <button onClick={() => { setActivePage("pinjamanku"); setIsMobileMenuOpen(false); }} className={`text-left text-sm font-bold px-3 py-2 rounded-lg transition-colors ${activePage === "pinjamanku" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
              📖 Pinjamanku
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;