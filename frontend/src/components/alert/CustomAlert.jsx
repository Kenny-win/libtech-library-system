const CustomAlert = ({ isOpen, type = "info", title, message, onClose, onConfirm }) => {
  if (!isOpen) return null;

  // Konfigurasi ikon dan warna berdasarkan tipe
  const config = {
    success: { icon: "✅", bg: "bg-emerald-100 text-emerald-600", btn: "bg-emerald-600 hover:bg-emerald-700" },
    error: { icon: "❌", bg: "bg-rose-100 text-rose-600", btn: "bg-rose-600 hover:bg-rose-700" },
    warning: { icon: "⚠️", bg: "bg-amber-100 text-amber-600", btn: "bg-amber-500 hover:bg-amber-600" },
    info: { icon: "ℹ️", bg: "bg-blue-100 text-blue-600", btn: "bg-blue-600 hover:bg-blue-700" },
    confirm: { icon: "❓", bg: "bg-indigo-100 text-indigo-600", btn: "bg-indigo-600 hover:bg-indigo-700" }
  };

  const current = config[type] || config.info;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-100 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center border border-slate-100 transform transition-all">
        
        {/* Ikon Bulat */}
        <div className={`mx-auto w-20 h-20 mb-5 rounded-full flex items-center justify-center text-4xl shadow-inner ${current.bg}`}>
          {current.icon}
        </div>
        
        {/* Teks Judul & Pesan */}
        <h3 className="text-xl font-extrabold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-8 px-2">{message}</p>
        
        {/* Logika Tombol (Alert biasa vs Konfirmasi) */}
        {type === "confirm" ? (
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={() => {
                onConfirm(); // Jalankan aksi
                onClose();   // Tutup popup
              }}
              className={`flex-1 py-3 rounded-xl text-white font-bold transition-colors shadow-sm cursor-pointer ${current.btn}`}
            >
              Ya, Lanjutkan
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-xl text-white font-bold shadow-sm transition-colors cursor-pointer ${current.btn}`}
          >
            Mengerti
          </button>
        )}

      </div>
    </div>
  );
};

export default CustomAlert;