import React, { useState } from 'react';
import { Network, Play, ShieldCheck, ArrowRight, Database, Cpu, LockOpen, AlertTriangle } from 'lucide-react';

export default function HndlModule({ cbom }) {
  const vulnerable = cbom.filter((item) => /RSA|ECD/.test(item.algo));
  const [asset, setAsset] = useState(vulnerable[0] || cbom[0]);
  const [mode, setMode] = useState('legacy');
  const [y2q, setY2q] = useState(2030);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    if (!asset) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/hndl/simulate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assetId: asset.id, system: asset.system, algo: asset.algo, dataType: asset.dataType, retention: asset.retention, protectionMode: mode, y2qEstimate: y2q }) });
      if (!response.ok) throw new Error('Simulation failed');
      setResult(await response.json());
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  return <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
    <div>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-700 mb-2">Quantum threat model</p>
      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Network className="size-5 text-cyan-700" />Mô phỏng Harvest Now, Decrypt Later</h3>
      <p className="text-sm text-slate-500 mt-2">Đánh giá nguy cơ dữ liệu bị thu thập hôm nay và giải mã trong tương lai bằng máy tính lượng tử.</p>
    </div>

    {/* ① Timeline HNDL */}
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
      <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">HNDL Attack Lifecycle</h4>
      <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="size-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200 shadow-sm"><Database className="size-5" /></div>
          <span className="text-[10px] font-bold text-slate-600">HARVEST</span>
        </div>
        <ArrowRight className="size-4 text-slate-300" />
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200 shadow-sm"><LockOpen className="size-5" /></div>
          <span className="text-[10px] font-bold text-slate-600">STORE</span>
        </div>
        <ArrowRight className="size-4 text-slate-300" />
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="size-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 border border-purple-200 shadow-sm"><Cpu className="size-5" /></div>
          <span className="text-[10px] font-bold text-slate-600">FUTURE QUANTUM</span>
        </div>
        <ArrowRight className="size-4 text-slate-300" />
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="size-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 border border-rose-200 shadow-sm"><AlertTriangle className="size-5" /></div>
          <span className="text-[10px] font-bold text-slate-600">DECRYPT RISK</span>
        </div>
      </div>
    </div>

    <div className="grid md:grid-cols-3 gap-4">
      <label className="text-xs font-semibold text-slate-500">Mục tiêu bị thu thập
        <select value={asset?.id ?? ''} onChange={(event) => setAsset(cbom.find((item) => item.id === event.target.value))} className="mt-2 w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 text-sm text-slate-700">
          {cbom.filter((item) => /RSA|ECD/.test(item.algo)).map((item) => <option key={item.id} value={item.id}>{item.id} — {item.system} ({item.algo})</option>)}
        </select>
      </label>
      <label className="text-xs font-semibold text-slate-500">Cơ chế bảo vệ
        <select value={mode} onChange={(event) => setMode(event.target.value)} className="mt-2 w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 text-sm text-slate-700">
          <option value="legacy">Hiện tại: RSA / ECC</option>
          <option value="hybrid">Nâng cấp: Classical + ML-KEM (Hybrid)</option>
        </select>
      </label>
      <label className="text-xs font-semibold text-slate-500">Dự kiến máy tính lượng tử (Y2Q)
        <input type="number" value={y2q} onChange={(e) => setY2q(parseInt(e.target.value))} className="mt-2 w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 text-sm text-slate-700" />
      </label>
    </div>

    <button onClick={runSimulation} disabled={loading} className="w-full flex justify-center items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition shadow-md shadow-cyan-100">
      <Play className="size-4" />{loading ? 'Backend đang xử lý mô phỏng...' : 'Chạy mô phỏng tấn công lượng tử'}
    </button>

    {result && <div className="border-t border-slate-200 pt-6 space-y-6">
      {/* ③ Kết quả tự động */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 p-3 rounded-xl text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase">HNDL Score</p>
          <p className={`text-xl font-black mt-1 ${result.hndlScore > 70 ? 'text-rose-600' : 'text-emerald-600'}`}>{result.hndlScore}</p>
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-xl text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Hết hạn dữ liệu</p>
          <p className="text-sm font-bold text-slate-700 mt-1">{result.dataExpiryYear}</p>
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-xl text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Cửa sổ lộ lọt</p>
          <p className="text-sm font-bold text-rose-600 mt-1">{result.exposureWindow}</p>
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-xl text-center col-span-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Khuyến nghị</p>
          <p className="text-[11px] font-medium text-cyan-700 mt-1 italic">{result.pqcRecommendation}</p>
        </div>
      </div>

      <div className="bg-slate-50 text-slate-700 p-5 rounded-xl font-mono text-sm space-y-3 border border-slate-200 shadow-sm">
        <div><span className="text-cyan-700 font-bold">[PAYLOAD]</span>: {result.payload}</div>
        <div className="truncate"><span className="text-cyan-700 font-bold">[CIPHERTEXT]</span>: {result.cipherHash}</div>
        <div className="leading-relaxed"><span className="text-rose-600 font-bold">[RISK]</span>: {result.riskExplanation}</div>
      </div>

      {/* ② So sánh Classical vs Hybrid */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-rose-100 bg-rose-50/50 p-4 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10"><AlertTriangle className="size-12 text-rose-900" /></div>
          <h5 className="font-bold text-rose-900 mb-2 flex items-center gap-2">RSA / ECC (Classical)</h5>
          <p className="text-xs text-slate-700 leading-relaxed">{result.legacyAnalysis}</p>
        </div>
        <div className="border border-emerald-100 bg-emerald-50/60 p-4 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10"><ShieldCheck className="size-12 text-emerald-900" /></div>
          <h5 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">Classical + ML-KEM (Hybrid)</h5>
          <p className="text-xs text-slate-700 leading-relaxed">{result.pqcAnalysis}</p>
        </div>
      </div>
    </div>}
  </div>;
}
