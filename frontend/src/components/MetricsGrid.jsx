import React from 'react';
import { Database, ShieldAlert, Hourglass, ArrowUpRight } from 'lucide-react';

export default function MetricsGrid({ cbom }) {
  const metrics = [
    ['Tài sản được lập danh mục', cbom.length, 'CBOM đã chuẩn hóa', Database, 'text-cyan-700 bg-cyan-50'],
    ['Thuật toán dễ tổn thương', cbom.filter((x) => /RSA|ECD/.test(x.algo)).length, 'RSA / ECC trước Shor', ShieldAlert, 'text-amber-700 bg-amber-50'],
    ['Dữ liệu dài hạn', cbom.filter((x) => x.retention.includes('>')).length, 'Mục tiêu HNDL tiềm năng', Hourglass, 'text-rose-700 bg-rose-50'],
  ];
  return <div className="grid md:grid-cols-3 gap-4">{metrics.map(([label, value, note, Icon, color]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex justify-between"><span className={`grid place-items-center size-9 rounded-xl ${color}`}><Icon className="size-[18px]" /></span><ArrowUpRight className="size-4 text-slate-400" /></div><div className="mt-5 text-3xl font-semibold text-slate-900">{value}</div><p className="mt-1 text-sm text-slate-700">{label}</p><p className="mt-2 text-xs text-slate-500">{note}</p>
  </div>)}</div>;
}
