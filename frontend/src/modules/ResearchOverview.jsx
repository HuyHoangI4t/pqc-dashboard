import React from 'react';
import { ArrowRight, Binary, Fingerprint, KeyRound, Layers3, Radar, ShieldCheck } from 'lucide-react';

const topics = [
  ['Nguy cơ lượng tử', 'Shor làm suy yếu RSA và ECC; ưu tiên tài sản có dữ liệu tồn tại lâu.', Radar, 'border-rose-400/25'],
  ['ML-KEM', 'Cơ chế đóng gói khóa chuẩn hóa cho trao đổi khóa hậu lượng tử.', KeyRound, 'border-cyan-400/25'],
  ['ML-DSA', 'Chữ ký số dựa trên lưới, phù hợp xác thực và ký giao dịch.', Fingerprint, 'border-violet-400/25'],
  ['SLH-DSA', 'Chữ ký hash-based, lựa chọn đa dạng hóa cho trường hợp dài hạn.', Binary, 'border-amber-400/25'],
  ['Crypto agility', 'Tách thuật toán khỏi nghiệp vụ để có thể thay thế an toàn.', Layers3, 'border-emerald-400/25'],
  ['Hybrid cryptography', 'Dùng song song cổ điển và PQC trong giai đoạn chuyển đổi.', ShieldCheck, 'border-blue-400/25'],
];

export default function ResearchOverview({ setActiveTab }) {
  return <div className="space-y-6">
    <section className="relative overflow-hidden rounded-3xl border border-cyan-100 bg-[radial-gradient(circle_at_80%_0%,rgba(34,211,238,.2),transparent_32%),linear-gradient(120deg,#ffffff,#ecfeff)] p-7 md:p-10">
      <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-700">PQC research program · 2026</p><h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight text-slate-900">Từ phát hiện nguy cơ<br /><span className="text-cyan-700">đến chuyển đổi mật mã.</span></h2><p className="mt-5 text-sm leading-6 text-slate-600">Không gian nghiên cứu tập trung vào tác động lượng tử, HNDL và lộ trình áp dụng ML-KEM, ML-DSA, SLH-DSA cho các hệ thống trọng yếu.</p><button onClick={() => setActiveTab('inventory')} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white hover:bg-cyan-700">Khám phá danh mục tài sản <ArrowRight className="size-4" /></button></div>
      <div className="absolute -right-12 -bottom-16 size-72 rounded-full border border-cyan-200 opacity-70" /><div className="absolute right-16 bottom-12 hidden md:block text-right"><p className="text-5xl font-semibold text-cyan-950/10">HNDL</p><p className="text-xs text-cyan-700/60">Harvest now · decrypt later</p></div>
    </section>
    <section><div className="flex items-end justify-between mb-4"><div><p className="text-xs uppercase tracking-[.18em] text-slate-500 font-bold">Research map</p><h3 className="text-xl font-semibold text-slate-900 mt-1">Các trụ cột nghiên cứu</h3></div><span className="text-xs text-slate-500">06 chủ đề</span></div><div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">{topics.map(([title, description, Icon, color]) => <article key={title} className={`rounded-2xl border ${color} bg-white p-5 shadow-sm hover:-translate-y-0.5 transition`}><Icon className="size-5 text-cyan-700" /><h4 className="mt-4 font-semibold text-slate-900">{title}</h4><p className="mt-2 text-sm leading-5 text-slate-500">{description}</p></article>)}</div></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[.18em] text-slate-500">Project path</p><div className="mt-5 grid md:grid-cols-3 gap-5 text-sm">{[['01','Lập CBOM','Xây dựng danh mục và xác định thuật toán bị ảnh hưởng.'],['02','Lab & so sánh','Đo khóa, chữ ký và hiệu năng thư viện PQC.'],['03','Chuyển đổi','Đề xuất crypto agility, hybrid và lộ trình.']].map(([number, title, text]) => <div key={number} className="flex gap-3"><span className="text-cyan-700 font-mono">{number}</span><div><h4 className="text-slate-900 font-semibold">{title}</h4><p className="text-slate-500 mt-1 leading-5">{text}</p></div></div>)}</div></section>
  </div>;
}
