import React from 'react';

export default function CbomModule({ cbom }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-700 mb-2">Asset discovery</p><h3 className="text-lg font-bold text-slate-900 mb-5">Danh mục tài sản mật mã (CBOM)</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
              <th className="p-3">Mã ID</th>
              <th className="p-3">Hệ thống</th>
              <th className="p-3">Mục đích</th>
              <th className="p-3">Thuật toán</th>
              <th className="p-3">Thời gian bảo vệ</th>
              <th className="p-3">Mức ưu tiên</th>
              <th className="p-3">Risk Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cbom.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition">
                <td className="p-3 font-semibold text-cyan-700">{item.id}</td>
                <td className="p-3 font-medium text-slate-900">{item.system}</td>
                <td className="p-3 text-slate-600">{item.purpose}</td>
                <td className="p-3 font-mono text-xs">{item.algo}</td>
                <td className="p-3 text-slate-600">{item.retention}</td>
                <td className="p-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    item.priority === 'Rất cao' ? 'bg-red-50 text-red-600 border border-red-200' :
                    item.priority === 'Cao' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                    'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20'
                  }`}>
                    {item.priority}
                  </span>
                </td>
                <td className="p-3 font-bold">{item.riskScore}/100</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
