import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function RiskModule({ cbom }) {
  const vulnerableList = cbom.filter((item) => item.algo.includes('RSA') || item.algo.includes('ECD'));
  const longTermList = cbom.filter((item) => item.retention.includes('>'));
  const hndlList = cbom.filter((item) => (item.algo.includes('RSA') || item.algo.includes('ECD')) && item.retention.includes('>'));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Đánh giá ảnh hưởng lượng tử & Phân loại Dữ liệu</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="p-3">Mã ID</th>
                <th className="p-3">Hệ thống</th>
                <th className="p-3">Thuật toán</th>
                <th className="p-3">Loại dữ liệu</th>
                <th className="p-3">Thời gian bảo vệ</th>
                <th className="p-3">Tác động Lượng tử</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cbom.map((item) => {
                const isShor = item.algo.includes('RSA') || item.algo.includes('ECD');
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-semibold text-blue-600">{item.id}</td>
                    <td className="p-3 font-medium text-slate-900">{item.system}</td>
                    <td className="p-3 font-mono text-xs">{item.algo}</td>
                    <td className="p-3 text-slate-600">{item.dataType}</td>
                    <td className="p-3 text-slate-600">{item.retention}</td>
                    <td className="p-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isShor ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-700'}`}>{isShor ? 'Bị phá vỡ bởi Shor' : 'Vẫn an toàn (Grover giảm biên)'}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-4 items-start">
        <div className="p-2 bg-amber-500 text-white rounded-lg"><ShieldAlert className="w-5 h-5" /></div>
        <div>
          <h4 className="font-bold text-amber-900 text-sm">Kết luận Rủi ro HNDL từ Rule Engine</h4>
          <p className="text-xs text-amber-800 mt-1">
            • Số tài sản dùng RSA/ECC: <b>{vulnerableList.length}</b> | Dữ liệu bảo vệ dài hạn (&gt;10 năm): <b>{longTermList.length}</b><br />
            • Số tài sản đối mặt trực tiếp với nguy cơ <b>Harvest Now, Decrypt Later (HNDL)</b>: <b>{hndlList.length}</b>. Dữ liệu bị thu thập hôm nay sẽ bị bẻ khóa khi máy tính lượng tử xuất hiện.
          </p>
        </div>
      </div>
    </div>
  );
}
