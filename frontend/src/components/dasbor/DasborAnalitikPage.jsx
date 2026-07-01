import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const DasborAnalitikPage = ({ isDarkMode, URL }) => {
  const [dataTren, setDataTren] = useState([]);
  const [dataKategori, setDataKategori] = useState([]);
  const [dataStatus, setDataStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  // STATE FILTER GLOBAL (Rentang Tanggal)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // STATE FILTER LOKAL (Khusus Grafik Tren)
  const [groupBy, setGroupBy] = useState("date");

  const [filterRoleStatus, setFilterRoleStatus] = useState("");
  const [filterRoleLeaderboard, setFilterRoleLeaderboard] = useState("");

  const [filterLimit, setFilterLimit] = useState(5);
  const [currentSlide, setCurrentSlide] = useState(0);

  // STATE REKAP DENDA
  const [dataDenda, setDataDenda] = useState({
    total_denda: 0,
    total_transaksi_denda: 0,
  });

  const [dataLeaderboard, setDataLeaderboard] = useState([]);
  const [filterStatusLokal, setFilterStatusLokal] = useState("");

  // Warna khusus untuk masing-masing status
  const COLORS = {
    Kembali: "#10b981", // Hijau Emerald
    "Sedang Dipinjam": "#3b82f6", // Biru
    Terlambat: "#e11d48", // Merah Rose
    Pending: "#f59e0b", // Kuning Amber
    Ditolak: "#94a3b8", // Abu-abu Slate
  };

  useEffect(() => {
    const fetchAnalitik = async () => {
      try {
        setLoading(true);

        const params = [];
        if (startDate) params.push(`startDate=${startDate}`);
        if (endDate) params.push(`endDate=${endDate}`);
        const queryTanggal = params.length > 0 ? "?" + params.join("&") : "";

        let urlTren = `${URL}/api/analitik/tren` + queryTanggal;
        if (groupBy)
          urlTren += (queryTanggal ? "&" : "?") + `groupBy=${groupBy}`;

        const urlKategori =
          `${URL}/api/analitik/kategori-populer` + queryTanggal;

        let urlStatus = `${URL}/api/analitik/status-sirkulasi` + queryTanggal;

        if (filterRoleStatus) {
          urlStatus += (queryTanggal ? "&" : "?") + `role=${filterRoleStatus}`;
        }

        // SETUP URL LEADERBOARD
        let urlLeaderboard = `${URL}/api/analitik/peminjam-aktif`;
        const lbParams = [];
        if (startDate) lbParams.push(`startDate=${startDate}`);
        if (endDate) lbParams.push(`endDate=${endDate}`);
        if (filterStatusLokal) lbParams.push(`status=${filterStatusLokal}`);
        if (filterRoleLeaderboard)
          lbParams.push(`role=${filterRoleLeaderboard}`);
        if (filterLimit) lbParams.push(`limit=${filterLimit}`); // Kirim limit

        if (lbParams.length > 0) {
          urlLeaderboard += "?" + lbParams.join("&");
        }

        // SETUP URL DENDA
        let urlDenda = `${URL}/api/analitik/rekap-denda` + queryTanggal;

        const [resTren, resKategori, resStatus, resLeaderboard, resDenda] =
          await Promise.all([
            fetch(urlTren, {
              headers: { "ngrok-skip-browser-warning": "true" },
            }),
            fetch(urlKategori, {
              headers: { "ngrok-skip-browser-warning": "true" },
            }),
            fetch(urlStatus, {
              headers: { "ngrok-skip-browser-warning": "true" },
            }),
            fetch(urlLeaderboard, {
              headers: { "ngrok-skip-browser-warning": "true" },
            }),
            fetch(urlDenda, {
              headers: { "ngrok-skip-browser-warning": "true" },
            }),
          ]);

        const resultTren = await resTren.json();
        const resultKategori = await resKategori.json();
        const resultStatus = await resStatus.json();
        const resultLeaderboard = await resLeaderboard.json();
        const resultDenda = await resDenda.json();

        if (resultTren.success) setDataTren(resultTren.data);
        if (resultKategori.success) setDataKategori(resultKategori.data);
        if (resultStatus.success) setDataStatus(resultStatus.data);
        if (resultLeaderboard.success) {
          setDataLeaderboard(resultLeaderboard.data);
          setCurrentSlide(0); // Reset ke slide pertama tiap kali data berubah!
        }
        if (resultDenda.success) setDataDenda(resultDenda.data);

        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        console.error("Gagal memuat data analitik");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalitik();
  }, [
    startDate,
    endDate,
    groupBy,
    filterRoleStatus,
    filterStatusLokal,
    filterRoleLeaderboard,
    filterLimit,
    URL,
  ]); //TODO INI ADA TAMBAH URL

  // LOGIKA SLIDER (PAGINATION)
  const itemsPerSlide = 5;
  const totalSlides = Math.ceil(dataLeaderboard.length / itemsPerSlide);
  // Ambil hanya 5 data untuk slide saat ini
  const currentLeaderboardData = dataLeaderboard.slice(
    currentSlide * itemsPerSlide,
    (currentSlide + 1) * itemsPerSlide,
  );

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) setCurrentSlide(currentSlide + 1);
  };
  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  // Format String Rentang Tanggal Global
  const getDateRangeLabel = () => {
    if (startDate && endDate) {
      return `Periode: ${new Date(startDate).toLocaleDateString("id-ID")} s/d ${new Date(endDate).toLocaleDateString("id-ID")}`;
    } else if (startDate) {
      return `Sejak: ${new Date(startDate).toLocaleDateString("id-ID")}`;
    } else if (endDate) {
      return `Hingga: ${new Date(endDate).toLocaleDateString("id-ID")}`;
    }
    return "6 Bulan Terakhir"; // Default
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
          Dasbor Analitik
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-white">
          Laporan statistik dan wawasan performa perpustakaan Anda.
        </p>
      </div>

      {/* FILTER GLOBAL (Berlaku untuk semua grafik di bawahnya) */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors ">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
            📅
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Filter Periode Analitik
            </h3>
            <p className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1">
              {getDateRangeLabel()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-50 p-1 border border-slate-200 rounded-lg w-full sm:w-auto">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs px-2 py-1.5 bg-transparent focus:outline-hidden text-slate-600 w-full"
            />
            <span className="text-slate-400 text-xs">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="text-xs px-2 py-1.5 bg-transparent focus:outline-hidden text-slate-600 w-full"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors cursor-pointer w-full sm:w-auto"
            >
              Reset Tanggal
            </button>
          )}
        </div>
      </div>

      {/* AREA KPI / METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Card 1: Total Denda */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-xs dark:text-white font-bold text-slate-500 uppercase tracking-wider mb-1">
              Total Perhitungan Denda
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-rose-600">
                Rp {Number(dataDenda.total_denda).toLocaleString("id-ID")}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-1 dark:text-white">
              Dari{" "}
              <span className="text-rose-500">
                {dataDenda.total_transaksi_denda} transaksi
              </span>{" "}
              yang terlambat
            </p>
          </div>
          <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-2xl shadow-inner border border-rose-100">
            💸
          </div>
        </div>

        {/* Card 2: Informasi Tambahan (Bisa dikosongkan atau diisi info lain, contoh: Total Buku di Katalog) */}
        <div className="bg-linear-to-br from-blue-600 to-indigo-700 p-5 rounded-2xl border border-blue-800 shadow-sm flex items-center justify-between text-white hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">
              Periode Analitik
            </h3>
            <div className="text-xl font-black mb-1">{getDateRangeLabel()}</div>
            <p className="text-[10px] font-semibold text-blue-200">
              Menampilkan data sirkulasi perpustakaan secara real-time
            </p>
          </div>
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-2xl backdrop-blur-sm border border-white/20">
            📊
          </div>
        </div>
      </div>

      {/* AREA GRAFIK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: TREN PEMINJAMAN */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Tren Peminjaman Buku
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5 dark:text-white">
                Frekuensi peminjaman berdasarkan waktu
              </p>
            </div>

            {/* Filter Lokal: Hanya GroupBy (Harian/Bulanan/Tahunan) */}
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden font-bold text-slate-600 cursor-pointer"
            >
              <option value="date">📅 Harian</option>
              <option value="month">🈷️ Bulanan</option>
              <option value="year">🗓️ Tahunan</option>
            </select>
          </div>

          <div className="h-72 w-full relative mt-4">
            {loading && (
              <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-xs flex items-center justify-center">
                <span className="text-slate-500 font-bold text-sm animate-pulse dark:text-white">
                  Memuat Grafik...
                </span>
              </div>
            )}
            {dataTren.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dataTren}
                  margin={{ top: 5, right: 20, bottom: 20, left: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    label={{
                      value: "Periode Waktu",
                      position: "insideBottom",
                      offset: -15,
                      fontSize: 12,
                      fontWeight: "bold",
                      fill: "#94a3b8",
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    label={{
                      value: "Jumlah Pinjam",
                      angle: -90,
                      position: "insideLeft",
                      offset: 0,
                      fontSize: 12,
                      fontWeight: "bold",
                      fill: "#94a3b8",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{ fontWeight: "bold", color: "#0f172a" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 6, fill: "#2563eb" }}
                    name="Total Dipinjam"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <span className="text-4xl mb-2">📉</span>
                <span className="text-xs font-bold">Tidak ada data.</span>
              </div>
            )}
          </div>
        </div>

        {/* CHART 2: KATEGORI TERPOPULER */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col transition-colors">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Top 5 Kategori Populer
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5 dark:text-white">
              Kategori buku yang paling sering dipinjam
            </p>
          </div>

          <div className="h-72 w-full relative mt-4">
            {loading && (
              <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-xs flex items-center justify-center">
                <span className="text-slate-500 font-bold text-sm animate-pulse">
                  Memuat Grafik...
                </span>
              </div>
            )}
            {dataKategori.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dataKategori}
                  layout="vertical"
                  margin={{ top: 5, right: 20, bottom: 20, left: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    label={{
                      value: "Total Buku Dipinjam",
                      position: "insideBottom",
                      offset: -15,
                      fontSize: 12,
                      fontWeight: "bold",
                      fill: "#94a3b8",
                    }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={90}
                    tick={{ fontSize: 11, fill: "#475569", fontWeight: "bold" }}
                    axisLine={false}
                    tickLine={false}
                    label={{
                      value: "Nama Kategori",
                      angle: -90,
                      position: "insideLeft",
                      offset: -5,
                      fontSize: 12,
                      fontWeight: "bold",
                      fill: "#94a3b8",
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: isDarkMode ? "#585858" : "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{ fontWeight: "bold", color: "#0f172a" }}
                  />
                  <Bar
                    dataKey="total"
                    fill="#0ea5e9"
                    radius={[0, 6, 6, 0]}
                    barSize={24}
                    name="Peminjaman"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <span className="text-4xl mb-2">📊</span>
                <span className="text-xs font-bold">
                  Belum ada data kategori.
                </span>
              </div>
            )}
          </div>
        </div>
        {/* CHART 3: STATUS SIRKULASI (DOUGHNUT CHART) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col transition-colors">
          {/* HEADER GRAFIK 3 */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Proporsi Status Peminjaman
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5 dark:text-white">
                Rasio tingkat pengembalian dan keterlambatan
              </p>
            </div>

            {/* Filter Lokal: Khusus Doughnut Chart */}
            <select
              value={filterRoleStatus}
              onChange={(e) => setFilterRoleStatus(e.target.value)}
              className="text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden font-bold text-slate-600 cursor-pointer"
            >
              <option value="">Semua Peran</option>
              <option value="siswa">Siswa Saja</option>
              <option value="pegawai">Pegawai Saja</option>
            </select>
          </div>{" "}
          {/* AREA GRAFIK */}
          <div className="h-72 w-full relative">
            {loading && (
              <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-xs flex items-center justify-center">
                <span className="text-slate-500 font-bold text-sm animate-pulse">
                  Memuat Grafik...
                </span>
              </div>
            )}

            {dataStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dataStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[entry.name] || "#cbd5e1"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    itemStyle={{ fontWeight: "bold" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <span className="text-4xl mb-2">🍩</span>
                <span className="text-xs font-bold">
                  Belum ada data sirkulasi.
                </span>
              </div>
            )}
          </div>
        </div>
        {/* CHART 4: LEADERBOARD PEMINJAM AKTIF */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col transition-colors">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Peringkat Peminjam Teraktif
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5 dark:text-white">
                Top anggota perpustakaan terajin
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* DROPDOWN LIMIT */}
              <select
                value={filterLimit}
                onChange={(e) => setFilterLimit(Number(e.target.value))}
                className="text-xs px-2 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg focus:outline-hidden font-bold cursor-pointer"
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
              </select>

              <select
                value={filterRoleLeaderboard}
                onChange={(e) => setFilterRoleLeaderboard(e.target.value)}
                className="text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden font-bold text-slate-600 cursor-pointer"
              >
                <option value="">Semua Peran</option>
                <option value="siswa">Siswa</option>
                <option value="pegawai">Pegawai</option>
              </select>

              <select
                value={filterStatusLokal}
                onChange={(e) => setFilterStatusLokal(e.target.value)}
                className="text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden font-bold text-slate-600 cursor-pointer"
              >
                <option value="">Semua Status</option>
                <option value="kembali">Selesai/Kembali</option>
                <option value="dipinjam">Sedang Meminjam</option>
                <option value="pending">Sering Request</option>
              </select>
            </div>
          </div>

          <div className="h-72 w-full relative flex flex-col justify-between">
            {loading && (
              <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-xs flex items-center justify-center">
                <span className="text-slate-500 font-bold text-sm animate-pulse">
                  Memuat Peringkat...
                </span>
              </div>
            )}

            {dataLeaderboard.length > 0 ? (
              <>
                <div className="flex flex-col gap-3 mt-2 flex-1">
                  {currentLeaderboardData.map((user, idx) => {
                    // Cari tahu posisi juara asli (karena saat pindah slide, idx mereset ke 0)
                    const actualRank = currentSlide * itemsPerSlide + idx + 1;

                    let rankIcon = (
                      <span className="text-sm font-black text-slate-400">
                        #{actualRank}
                      </span>
                    );
                    if (actualRank === 1)
                      rankIcon = <span className="text-2xl">🥇</span>;
                    else if (actualRank === 2)
                      rankIcon = <span className="text-2xl">🥈</span>;
                    else if (actualRank === 3)
                      rankIcon = <span className="text-2xl">🥉</span>;

                    return (
                      <div
                        key={user.id_user}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 text-center flex items-center justify-center">
                            {rankIcon}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-800 text-sm">
                              {user.nama}
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                              {user.peran} {user.kelas ? `(${user.kelas})` : ""}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-blue-600">
                            {user.total_transaksi}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">
                            Buku
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/*KONTROL SLIDER BAWAH */}
                {totalSlides > 1 && (
                  <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-100">
                    <button
                      onClick={prevSlide}
                      disabled={currentSlide === 0}
                      className={`px-3 py-1 text-[11px] font-extrabold uppercase rounded-lg transition-colors ${currentSlide === 0 ? "text-slate-300 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50 cursor-pointer"}`}
                    >
                      &larr; Prev
                    </button>
                    <span className="text-[10px] font-bold text-slate-400">
                      Hal {currentSlide + 1} / {totalSlides}
                    </span>
                    <button
                      onClick={nextSlide}
                      disabled={currentSlide === totalSlides - 1}
                      className={`px-3 py-1 text-[11px] font-extrabold uppercase rounded-lg transition-colors ${currentSlide === totalSlides - 1 ? "text-slate-300 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50 cursor-pointer"}`}
                    >
                      Next &rarr;
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <span className="text-4xl mb-2">🏆</span>
                <span className="text-xs font-bold">
                  Belum ada data peminjam.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DasborAnalitikPage;
