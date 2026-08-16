import React from 'react';
import { Atom, Database, ShieldAlert, FlaskConical, Network, Map } from 'lucide-react';

const NAV_ITEMS = [
  ['overview', Atom, 'Research Brief', 'Tổng quan nghiên cứu'],
  ['inventory', Database, 'Danh mục tài sản CBOM', 'Kiểm kê tài sản mật mã'],
  ['risk', ShieldAlert, 'Đánh giá rủi ro lượng tử', 'Phân loại dữ liệu & rủi ro'],
  ['hndl', Network, 'Mô phỏng HNDL', 'Thu thập trước, giải mã sau'],
  ['lab', FlaskConical, 'PQC Research Lab', 'Thử nghiệm & so sánh PQC'],
  ['roadmap', Map, 'Lộ trình chuyển đổi', 'Kế hoạch chuyển đổi 5 giai đoạn'],
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="hidden lg:flex w-69 h-screen sticky top-0 shrink-0 overflow-y-auto bg-white text-slate-600 flex-col px-5 py-6 border-r border-slate-200">
      <button onClick={() => setActiveTab('overview')} className="text-left flex items-center gap-3 px-3 mb-10">
        <span className="grid place-items-center size-10 rounded-xl bg-cyan-400 text-[#07101f] shadow-[0_0_28px_rgba(34,211,238,.25)]">
          <Atom className="size-5" />
        </span>
        <span>
          <strong className="block text-slate-900 tracking-tight">Q-SEC Research</strong>
          <small className="text-slate-500">Post-Quantum Transition</small>
        </span>
      </button>

      <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Workspace</p>

      <nav className="space-y-1">
        {NAV_ITEMS.map(([id, Icon, title, sub]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`w-full flex gap-3 items-center rounded-xl p-3 text-left transition ${
              activeTab === id
                ? 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200'
                : 'hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Icon className="size-4.5 shrink-0" />
            <span>
              <span className="block text-sm font-semibold">{title}</span>
              <span className="block text-[11px] text-slate-500 mt-0.5">{sub}</span>
            </span>
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-cyan-100 bg-cyan-50 p-4">
        <p className="text-xs font-semibold text-cyan-800">NIST PQC standards</p>
        <p className="text-[11px] text-slate-500 mt-1">ML-KEM · ML-DSA · SLH-DSA</p>
      </div>
    </aside>
  );
}