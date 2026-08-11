import React, { useState } from 'react';
import { Network, Play, ShieldCheck } from 'lucide-react';

export default function HndlModule({ cbom }) {
  const vulnerable = cbom.filter((item) => /RSA|ECD/.test(item.algo));
  const [asset, setAsset] = useState(vulnerable[0] || cbom[0]);
  const [mode, setMode] = useState('legacy');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    if (!asset) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/hndl/simulate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assetId: asset.id, system: asset.system, algo: asset.algo, dataType: asset.dataType, retention: asset.retention, protectionMode: mode }) });
      if (!response.ok) throw new Error('Simulation failed');
      setResult(await response.json());
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  return <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
    <div><p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-700 mb-2">Quantum threat model</p><h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Network className="size-5 text-cyan-700" />Mô phỏng Harvest Now, Decrypt Later</h3><p className="text-sm text-slate-500 mt-2">Đánh giá nguy cơ dữ liệu bị thu thập hôm nay và giải mã trong tương lai.</p></div>
    <div className="grid md:grid-cols-2 gap-4"><label className="text-xs font-semibold text-slate-500">Mục tiêu bị thu thập<select value={asset?.id ?? ''} onChange={(event) => setAsset(cbom.find((item) => item.id === event.target.value))} className="mt-2 w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 text-sm text-slate-700">{vulnerable.map((item) => <option key={item.id} value={item.id}>{item.id} — {item.system} ({item.algo})</option>)}</select></label><label className="text-xs font-semibold text-slate-500">Cơ chế bảo vệ<select value={mode} onChange={(event) => setMode(event.target.value)} className="mt-2 w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 text-sm text-slate-700"><option value="legacy">Hiện tại: chỉ dùng RSA / ECC</option><option value="hybrid">Nâng cấp: Hybrid RSA/ECC + ML-KEM/ML-DSA</option></select></label></div>
    <button onClick={runSimulation} disabled={loading} className="w-full flex justify-center items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition"><Play className="size-4" />{loading ? 'Backend đang xử lý mô phỏng...' : 'Chạy mô phỏng tấn công lượng tử'}</button>
    {result && <div className="border-t border-slate-200 pt-6 space-y-4"><div className="bg-slate-50 border border-slate-200 text-slate-700 p-4 rounded-xl font-mono text-xs space-y-2"><div><span className="text-cyan-700 font-bold">[PAYLOAD]</span>: {result.payload}</div><div><span className="text-cyan-700 font-bold">[CIPHERTEXT]</span>: {result.cipherHash}</div><div><span className="text-cyan-700 font-bold">[SIGNATURE]</span>: {result.sigHash}</div><div className={result.isLongTerm ? 'text-red-600 font-bold' : 'text-amber-600 font-bold'}>[STATUS]: {result.statusMsg}</div></div><div className="grid md:grid-cols-2 gap-4"><div className="border border-rose-100 bg-rose-50/50 p-4 rounded-xl"><h5 className="font-bold text-rose-900 mb-2">Kịch bản 1: RSA / ECC truyền thống</h5><p className="text-sm text-slate-700">{result.legacyAnalysis}</p></div><div className="border border-cyan-100 bg-cyan-50/60 p-4 rounded-xl"><h5 className="font-bold text-cyan-900 mb-2 flex items-center gap-2"><ShieldCheck className="size-4" />Kịch bản 2: Hybrid PQC</h5><p className="text-sm text-slate-700">{result.pqcAnalysis}</p></div></div></div>}
  </div>;
}
