import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Terminal,
  Shield,
  Activity,
  Network,
  Cpu,
  Layers,
  ArrowRight,
  Database,
  Lock,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  Radio,
} from 'lucide-react';
import { DataDisclaimerBanner } from '../components/common/DataDisclaimerBanner';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#05080e] text-gray-200 font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Disclaimer bar */}
      <DataDisclaimerBanner compact={true} />

      {/* Header */}
      <header className="border-b border-[#142030] bg-[#070b13]/90 backdrop-blur-xs sticky top-0 z-30 font-mono text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-cyan-400 rounded-[1px]"></span>
            <div>
              <span className="font-bold text-sm tracking-widest text-cyan-400">RXGUARD</span>
              <span className="text-gray-400 text-[11px] ml-2 hidden sm:inline">
                Sistem Intelijen Risiko Pelayanan JKN
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-gray-400 text-xs">
            <a href="#tentang" className="hover:text-cyan-300 transition-colors">
              Tentang Sistem
            </a>
            <a href="#cara-kerja" className="hover:text-cyan-300 transition-colors">
              Cara Kerja
            </a>
            <a href="#intelijen" className="hover:text-cyan-300 transition-colors">
              Pola Risiko
            </a>
            <a href="#keamanan" className="hover:text-cyan-300 transition-colors">
              Keamanan
            </a>
          </nav>

          <button
            onClick={() => navigate('/access')}
            className="px-3.5 py-1.5 bg-[#0f2136] hover:bg-[#16304e] text-cyan-300 border border-cyan-700/60 rounded-[2px] font-semibold text-xs tracking-wider transition-colors flex items-center gap-1.5"
          >
            <span>Masuk Terminal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 border-b border-[#142030] overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c1320_1px,transparent_1px),linear-gradient(to_bottom,#0c1320_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#0b1420] border border-[#1a2d44] rounded-[2px] text-xs font-mono text-cyan-400">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse-subtle" />
                <span>TERMINAL MONITORING RISIKO RESEP & KLAIM FARMASI</span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold tracking-tight text-gray-100">
                  JKN RXGUARD
                  <span className="block text-cyan-400 text-xl sm:text-2xl lg:text-3xl font-mono font-normal mt-1 text-opacity-95">
                    INTELLIGENCE TERMINAL
                  </span>
                </h1>
                <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-2xl font-sans leading-relaxed">
                  Deteksi pola risiko pada transaksi obat dan alat kesehatan. Memproses jutaan log klaim
                  untuk memetakan pola early refill, perpindahan faskes abnormal, lonjakan kuota resep,
                  dan sindikasi jejaring layanan secara real-time.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs">
                <button
                  onClick={() => navigate('/access')}
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-[2px] flex items-center gap-2 transition-colors shadow-lg shadow-cyan-950/40"
                >
                  <Terminal className="w-4 h-4" />
                  <span>MASUK KE TERMINAL</span>
                </button>
                <a
                  href="#cara-kerja"
                  className="px-4 py-2.5 bg-[#0b1320] hover:bg-[#122035] text-gray-300 hover:text-cyan-300 border border-[#1b2b40] rounded-[2px] transition-colors"
                >
                  LIHAT CARA KERJA
                </a>
              </div>

              <div className="pt-4 border-t border-[#131d2b] grid grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <span className="text-gray-500 text-[10px] block">TARGET ANALISIS</span>
                  <span className="text-gray-200 font-semibold">Obat & Alkes Kronis</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">METODE DETEKSI</span>
                  <span className="text-gray-200 font-semibold">Graph & ML Anomaly</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">PROTEKSI PRIVASI</span>
                  <span className="text-cyan-400 font-semibold">Pseudonymization 100%</span>
                </div>
              </div>
            </div>

            {/* Right Terminal Console Simulation */}
            <div className="lg:col-span-5">
              <div className="bg-[#070c14] border border-[#1c2e44] rounded-[3px] shadow-2xl overflow-hidden font-mono text-xs">
                {/* Console header */}
                <div className="bg-[#0b1420] border-b border-[#18283c] px-3 py-2 flex items-center justify-between text-[11px] text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="font-bold text-gray-300">SYSTEM STATUS</span>
                  </div>
                  <span className="text-[10px] text-gray-500">v2.4-SIMULATION</span>
                </div>

                {/* Console Status Grid */}
                <div className="p-3 bg-[#05080e] border-b border-[#142030] grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-[#09111c] border border-[#152438] rounded-[2px] flex items-center justify-between">
                    <span className="text-gray-400">API</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      ONLINE
                    </span>
                  </div>
                  <div className="p-2 bg-[#09111c] border border-[#152438] rounded-[2px] flex items-center justify-between">
                    <span className="text-gray-400">RISK ENGINE</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      ONLINE
                    </span>
                  </div>
                  <div className="p-2 bg-[#09111c] border border-[#152438] rounded-[2px] flex items-center justify-between">
                    <span className="text-gray-400">NETWORK ENGINE</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      ONLINE
                    </span>
                  </div>
                  <div className="p-2 bg-[#09111c] border border-[#152438] rounded-[2px] flex items-center justify-between">
                    <span className="text-gray-400">AUDIT TRAIL</span>
                    <span className="text-cyan-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      ACTIVE
                    </span>
                  </div>
                </div>

                {/* Simulated Terminal Shell Logs */}
                <div className="p-3 bg-[#04060b] space-y-2 text-[11px] leading-relaxed">
                  <div className="text-gray-400 flex items-start gap-1.5">
                    <span className="text-cyan-400">analyst@rxguard:~$</span>
                    <span className="text-gray-200">run anomaly-sweep --batch=latest</span>
                  </div>
                  <div className="text-emerald-400/90 pl-3">
                    [OK] Risk rules applied: 5 active rule definitions
                  </div>
                  <div className="text-emerald-400/90 pl-3">
                    [OK] Graph clustering computed: 17 connected clusters
                  </div>
                  <div className="text-amber-400 pl-3">
                    [WARN] Early refill flag detected on participant P00182 (Score: 87)
                  </div>
                  <div className="text-red-400 pl-3">
                    [ALERT] Syndicate pattern triggered: 4 cross-facility transactions
                  </div>
                  <div className="text-gray-500 pl-3 flex items-center gap-1">
                    <span>Awaiting investigator triage...</span>
                    <span className="w-1.5 h-3.5 bg-cyan-400 inline-block animate-cursor"></span>
                  </div>
                </div>

                {/* Console Footer */}
                <div className="p-2 bg-[#08101a] border-t border-[#142030] flex items-center justify-between text-[10px] text-gray-500">
                  <span>PSEUDONYMIZED RUNTIME</span>
                  <span className="text-cyan-400">WITA UTC+8</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Cara Kerja */}
      <section id="cara-kerja" className="py-16 border-b border-[#142030] bg-[#06090e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase block mb-1">
              METODOLOGI ARSITEKTUR
            </span>
            <h2 className="text-2xl sm:text-3xl font-mono font-bold text-gray-100">
              ALUR KERJA DETEKSI RISIKO
            </h2>
            <p className="mt-2 text-sm text-gray-400 font-sans">
              Proses berurutan dari penyerapan data transaksi klaim hingga workbench investigasi auditor.
            </p>
          </div>

          {/* Workflow Sequence */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 font-mono text-xs">
            {/* Step 1 */}
            <div className="p-4 bg-[#09101a] border border-[#18273a] rounded-[2px] relative flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-cyan-400 font-bold block mb-1">TAHAP 01</span>
                <h3 className="font-bold text-gray-200 text-sm mb-2 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-cyan-400" />
                  DATA TRANSAKSI
                </h3>
                <p className="text-gray-400 text-[11px] font-sans leading-relaxed">
                  Penyerapan event peresepan, verifikasi faskes, dan dispensasi obat beridentitas tersamarkan.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-[#142131] text-[10px] text-gray-500">
                Input: Log Klaim Digital
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-[#09101a] border border-[#18273a] rounded-[2px] relative flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-cyan-400 font-bold block mb-1">TAHAP 02</span>
                <h3 className="font-bold text-gray-200 text-sm mb-2 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  RISK ENGINE
                </h3>
                <p className="text-gray-400 text-[11px] font-sans leading-relaxed">
                  Pencocokan aturan bisnis terhadap batasan siklus terapi, dosis formularium, dan frekuensi peresepan.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-[#142131] text-[10px] text-gray-500">
                Rule Weights & Boundaries
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-[#09101a] border border-[#18273a] rounded-[2px] relative flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-amber-400 font-bold block mb-1">TAHAP 03</span>
                <h3 className="font-bold text-gray-200 text-sm mb-2 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-400" />
                  ANOMALY DETECTION
                </h3>
                <p className="text-gray-400 text-[11px] font-sans leading-relaxed">
                  Identifikasi deviasi statistik volume klaim, early refill window compression, dan lonjakan kuota faskes.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-[#142131] text-[10px] text-gray-500">
                Skor 0-100 & Deviasi σ
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 bg-[#09101a] border border-[#18273a] rounded-[2px] relative flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-cyan-400 font-bold block mb-1">TAHAP 04</span>
                <h3 className="font-bold text-gray-200 text-sm mb-2 flex items-center gap-1.5">
                  <Network className="w-4 h-4 text-cyan-400" />
                  NETWORK ANALYSIS
                </h3>
                <p className="text-gray-400 text-[11px] font-sans leading-relaxed">
                  Pemetaan relasi graf antara peserta, dokter, apotek, dan faskes untuk mengungkap klaster sindikasi.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-[#142131] text-[10px] text-gray-500">
                Topologi Graf Klaster
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-4 bg-[#09101a] border border-[#18273a] rounded-[2px] relative flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold block mb-1">TAHAP 05</span>
                <h3 className="font-bold text-gray-200 text-sm mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  INVESTIGATION
                </h3>
                <p className="text-gray-400 text-[11px] font-sans leading-relaxed">
                  Penyusunan berkas bukti, kronologi timeline, verifikasi lapangan, dan audit trail pengambilan keputusan.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-[#142131] text-[10px] text-gray-500">
                Tindakan: Review/Eskalasi
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Risk Intelligence Highlights */}
      <section id="intelijen" className="py-16 border-b border-[#142030] bg-[#05080e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase block mb-1">
                KOMPONEN DATA OPERASIONAL
              </span>
              <h2 className="text-2xl sm:text-3xl font-mono font-bold text-gray-100">
                METRIK INTELIJEN RISIKO
              </h2>
            </div>
            <span className="px-2.5 py-1 bg-[#101b2b] text-cyan-400 border border-cyan-800/60 rounded-[2px] text-xs font-mono">
              STATUS: DATA SIMULASI
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            {/* Metric 1 */}
            <div className="p-4 bg-[#080d14] border border-[#182638] rounded-[2px]">
              <div className="text-xs text-gray-400 mb-1">METRIK 01</div>
              <div className="text-base font-bold text-gray-200 mb-2">Risk Score & Severity</div>
              <div className="text-3xl font-bold text-red-400 mb-1">87 / 100</div>
              <div className="text-xs text-gray-400 font-sans">
                Kombinasi skor aditif dari 5 sinyal anomali dengan ambang batas klasifikasi bertingkat.
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-4 bg-[#080d14] border border-[#182638] rounded-[2px]">
              <div className="text-xs text-gray-400 mb-1">METRIK 02</div>
              <div className="text-base font-bold text-gray-200 mb-2">Risk Signal Breakdown</div>
              <div className="text-xl font-bold text-cyan-400 mb-1">+20 Early Refill</div>
              <div className="text-xs text-gray-400 font-sans">
                Penguraian bobot sinyal individual (+18 Cross Facility, +15 Qty Anomaly, +21 Network).
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-4 bg-[#080d14] border border-[#182638] rounded-[2px]">
              <div className="text-xs text-gray-400 mb-1">METRIK 03</div>
              <div className="text-base font-bold text-gray-200 mb-2">Network Relationships</div>
              <div className="text-3xl font-bold text-blue-400 mb-1">17 Klaster</div>
              <div className="text-xs text-gray-400 font-sans">
                Analisis derajat koneksi (degrees) antara entitas faskes, kode obat, dan resep berulang.
              </div>
            </div>

            {/* Metric 4 */}
            <div className="p-4 bg-[#080d14] border border-[#182638] rounded-[2px]">
              <div className="text-xs text-gray-400 mb-1">METRIK 04</div>
              <div className="text-base font-bold text-gray-200 mb-2">Transaction Timeline</div>
              <div className="text-xl font-bold text-emerald-400 mb-1">21 Hari Siklus</div>
              <div className="text-xs text-gray-400 font-sans">
                Pencatatan kronologis perpindahan faskes dan waktu pengambilan obat kronis secara terperinci.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Keamanan & Etika Data */}
      <section id="keamanan" className="py-16 border-b border-[#142030] bg-[#06090e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase block mb-1">
              KEAMANAN & TATA KELOLA
            </span>
            <h2 className="text-2xl sm:text-3xl font-mono font-bold text-gray-100">
              PRINSIP PERLINDUNGAN AKSES
            </h2>
            <p className="mt-2 text-sm text-gray-400 font-sans">
              Dirancang dengan standar operasional ketat untuk mencegah kebocoran informasi dan menjaga integritas audit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-5 bg-[#09111b] border border-[#1a2c40] rounded-[2px] space-y-2">
              <div className="w-8 h-8 rounded-[2px] bg-[#122236] border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gray-200">Authorized & Role-Based Access</h3>
              <p className="text-gray-400 text-xs font-sans leading-relaxed">
                Akses terminal dibatasi hanya untuk personel berwenang. Pembagian peran tegas antara
                Analis Investigasi (read/triage) dan Administrator Kontrol (policy/rule/audit).
              </p>
            </div>

            <div className="p-5 bg-[#09111b] border border-[#1a2c40] rounded-[2px] space-y-2">
              <div className="w-8 h-8 rounded-[2px] bg-[#122236] border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gray-200">Immutable Audit Trail</h3>
              <p className="text-gray-400 text-xs font-sans leading-relaxed">
                Setiap kueri terminal, pembukaan identitas, perubahan bobot aturan risiko, dan keputusan
                investigasi dicatat secara permanen dengan stempel waktu WITA.
              </p>
            </div>

            <div className="p-5 bg-[#09111b] border border-[#1a2c40] rounded-[2px] space-y-2">
              <div className="w-8 h-8 rounded-[2px] bg-[#122236] border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gray-200">Pseudonymized Data</h3>
              <p className="text-gray-400 text-xs font-sans leading-relaxed">
                Seluruh identitas privat peserta disamarkan ke format pseudonym (cth: P00182).
                Sistem tidak menyimpan nomor kependudukan, kontak telepon, atau alamat lengkap pada terminal analis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 bg-[#04070c] border-b border-[#142030] text-center font-mono">
        <div className="max-w-3xl mx-auto px-4 space-y-5">
          <div className="inline-block p-2 bg-[#0a1420] border border-[#1b2f48] rounded-[2px]">
            <Terminal className="w-6 h-6 text-cyan-400 mx-auto" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-100">
            MASUK KE RISK TERMINAL
          </h2>
          <p className="text-sm text-gray-400 font-sans max-w-xl mx-auto">
            Gunakan terminal analitik untuk memeriksa notifikasi risiko terkini, menelusuri graf relasi
            faskes dan obat, serta memproses investigasi anomali pelayanan.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/access')}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-[2px] text-sm tracking-wider transition-colors inline-flex items-center gap-2"
            >
              <span>BUKA TERMINAL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-gray-500 pt-2">
            Sistem Terbatas • Khusus Analis & Verifikator Terdaftar
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-[#030508] border-t border-[#101724] font-mono text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-[1px]"></span>
            <span className="text-gray-400 font-bold">JKN RXGUARD</span>
            <span>— Healthcare Risk Intelligence Terminal</span>
          </div>
          <div>
            <span>Data Simulasi Prototype • Waktu Sistem: WITA</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
