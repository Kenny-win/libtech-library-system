import { useState } from "react"; // Hapus useEffect dari import

const CustomPrompt = ({ isOpen, title, message, onClose, onSubmit }) => {
  const [inputValue, setInputValue] = useState("");

  if (!isOpen) return null;

  // Saat form dikirim (Submit)
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(inputValue);
    setInputValue(""); // Kosongkan input untuk penggunaan berikutnya
    onClose();
  };

  // Saat tombol batal diklik (Close)
  const handleClose = () => {
    setInputValue(""); // Kosongkan input agar bersih saat dibuka lagi nanti
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-100 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-slate-100 transform transition-all">
        
        <div className="mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center text-3xl shadow-inner bg-blue-50 text-blue-600">
          💬
        </div>
        
        <h3 className="text-xl font-extrabold text-slate-900 text-center mb-2">{title}</h3>
        <p className="text-sm text-slate-500 text-center mb-6">{message}</p>
        
        <form onSubmit={handleSubmit}>
          <textarea
            autoFocus
            rows="3"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 bg-slate-50 focus:bg-white transition-colors mb-6 resize-none"
            placeholder="Ketik di sini..."
          />
          
          <div className="flex gap-3">
            <button
              type="button"
              // ---> Panggil handleClose di sini <---
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              Kirim
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CustomPrompt;