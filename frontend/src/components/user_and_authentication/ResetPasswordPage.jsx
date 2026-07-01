import { useState, useEffect } from "react";

const ResetPasswordPage = ({ showAlert, showConfirm, URL }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // State untuk form password baru
  const [newPasswords, setNewPasswords] = useState({});

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${URL}/api/auth/lupa-password-requests`, {
          headers: { "ngrok-skip-browser-warning": "true" }
        });
        const result = await res.json();
        if (result.success) setRequests(result.data);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        showAlert("error", "Koneksi Gagal", "Tidak dapat mengambil data pengajuan.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [URL, refreshTrigger, showAlert]);

  const handleApprove = (id_request, email_user) => {
    const pwd = newPasswords[id_request];
    if (!pwd || pwd.length < 5) {
      showAlert("warning", "Password Lemah", "Silakan ketik password baru minimal 5 karakter.");
      return;
    }

    showConfirm(
      "Reset Password?", 
      `Apakah Anda yakin ingin menetapkan password baru untuk ${email_user} dan mengirimkannya via email?`, 
      async () => {
        try {
          const response = await fetch(`${URL}/api/auth/lupa-password-requests/${id_request}/approve`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({ newPassword: pwd }),
          });
          const result = await response.json();
          
          if (result.success) {
            showAlert("success", "Berhasil!", result.message);
            // Hapus isi form password
            setNewPasswords(prev => {
              const copy = { ...prev };
              delete copy[id_request];
              return copy;
            });
            setRefreshTrigger(prev => prev + 1);
          } else {
            showAlert("error", "Gagal", result.message);
          }
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
          showAlert("error", "Error", "Koneksi terputus saat memproses data.");
        }
      }
    );
  };

  if (loading) return <div className="text-center py-20 animate-pulse font-bold text-slate-500">Memuat Antrean...</div>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-white">Antrean Reset Password</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-white">Daftar pengguna yang meminta perubahan kata sandi baru.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-800">Identitas Pengguna</th>
              <th className="px-6 py-4 font-bold text-slate-800">Tanggal Pengajuan</th>
              <th className="px-6 py-4 font-bold text-slate-800">Status</th>
              <th className="px-6 py-4 font-bold text-slate-800 text-center">Aksi Pustakawan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.length > 0 ? requests.map((item) => (
              <tr key={item.id_request} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{item.nama}</div>
                  <div className="text-xs font-semibold text-blue-600">{item.email}</div>
                  <div className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-md">
                    {item.peran}
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                  {new Date(item.created_at).toLocaleString("id-ID")}
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase">
                    Pending
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Ketik password baru..." 
                      value={newPasswords[item.id_request] || ""}
                      onChange={(e) => setNewPasswords({...newPasswords, [item.id_request]: e.target.value})}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-blue-500 w-40"
                    />
                    <button 
                      onClick={() => handleApprove(item.id_request, item.email)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm"
                    >
                      Kirim & Selesai
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-slate-500 font-medium">
                  <span className="text-4xl block mb-2">🎉</span>
                  Tidak ada antrean reset password saat ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResetPasswordPage;