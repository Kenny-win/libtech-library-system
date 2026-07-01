const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          
          {/* Kolom 1: Identitas */}
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4 transition-colors">
              Perpustakaan Bodhicitta
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 transition-colors">
              Menyediakan sumber referensi terbaik untuk mendukung pembelajaran,
              literasi, dan kreativitas siswa serta pegawai Sekolah Bodhicitta.
            </p>
          </div>

          {/* Kolom 2: Kontak & Sosial Media */}
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4 transition-colors">
              Hubungi Kami
            </h3>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-4 font-medium transition-colors">
              
              {/* Email */}
              <li>
                <a
                  href="mailto:perguruan@bodhicitta.sch.id"
                  className="flex items-center gap-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  perguruan@bodhicitta.sch.id
                </a>
              </li>
              
              {/* Telepon */}
              <li>
                <a
                  href="tel:+62617365972"
                  className="flex items-center gap-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  (061) 7365972
                </a>
              </li>
              
              {/* Website */}
              <li>
                <a
                  href="http://www.bodhicitta.sch.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    <path d="M2 12h20" />
                  </svg>
                  www.bodhicitta.sch.id
                </a>
              </li>
              
              {/* Instagram */}
              <li>
                <a
                  href="https://www.instagram.com/bodhicitta.school/#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:text-rose-500 dark:hover:text-rose-400 transition-colors group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-400 dark:text-slate-500 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  @bodhicitta.school
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Pengembang */}
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4 transition-colors">
              Pengembang Sistem
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 transition-colors">
              Dirancang dan dikembangkan oleh:
            </p>
            
            <div className="inline-block px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg mb-2 transition-colors">
              <span className="block text-sm font-black text-blue-600 dark:text-blue-400 transition-colors">
                Kenny Calnelius Winata, M.Kom.
              </span>
              <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5 transition-colors">
                Software Developer & Mandarin Teacher (中文教師)
              </span>
            </div>
            
            <div className="inline-block px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg transition-colors">
              <span className="block text-sm font-black text-blue-600 dark:text-blue-400 transition-colors">
                Shelvy Wu, S.Kom.
              </span>
              <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5 transition-colors">
                Software Developer
              </span>
            </div>
          </div>

        </div>

        {/* Bagian Bawah: Copyright */}
        <div className="border-t border-slate-100 dark:border-slate-800 mt-8 md:mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center sm:text-left transition-colors">
            &copy; {currentYear} Perpustakaan Bodhicitta. Hak Cipta Dilindungi.
          </p>
          <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 transition-colors">
            Versi 1.0.0
          </p>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;