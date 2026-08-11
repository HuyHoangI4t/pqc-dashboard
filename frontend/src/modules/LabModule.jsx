import React, { useMemo, useState } from 'react';
import { CheckCircle2, CircleAlert, KeyRound, Play, RefreshCw, ShieldCheck, Timer } from 'lucide-react';

const API_URL = 'http://localhost:8000/api/lab/run';
const number = (value) => new Intl.NumberFormat('vi-VN').format(value);

// Biểu đồ Cột Dọc (Vertical Bar Chart)
function VerticalComparisonChart({ title, caption, data, metrics, unit }) {
  const maximum = Math.max(...data.flatMap((row) => metrics.map((metric) => row[metric.key])), 1);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
      <div className="p-6 border-b border-slate-100">
        <h4 className="font-semibold text-slate-900">{title}</h4>
        <p className="mt-1 text-sm text-slate-500">{caption}</p>
        <div className="mt-4 flex flex-wrap gap-4">
          {metrics.map((metric) => (
            <span key={metric.key} className="inline-flex items-center gap-2 text-xs text-slate-600">
              <i className={`size-2.5 rounded-full ${metric.color}`} />
              {metric.label}
            </span>
          ))}
        </div>
      </div>

      {/* Khu vực hiển thị cột dọc */}
      <div className="p-6 overflow-x-auto">
        <div className="min-w-120 h-72 flex items-end justify-between gap-6 border-b border-slate-200 pb-2">
          {data.map((row) => (
            <div key={row.algo} className="flex-1 flex flex-col items-center h-full justify-end group">
              {/* Các cột hiển thị song song */}
              <div className="w-full flex items-end justify-center gap-1.5 h-full pt-6">
                {metrics.map((metric) => {
                  const val = row[metric.key];
                  const heightPercent = Math.max((val / maximum) * 100, 2);
                  return (
                    <div
                      key={metric.key}
                      className="relative flex-1 max-w-7 rounded-t-md transition-all duration-500 hover:opacity-90 flex justify-center"
                      style={{ height: `${heightPercent}%`, backgroundColor: metric.hex }}
                    >
                      {/* Tooltip hiển thị giá trị khi rê chuột */}
                      <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-semibold py-0.5 px-1.5 rounded pointer-events-none whitespace-nowrap z-10">
                        {number(val)} {unit}
                        
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Tên thuật toán phía dưới trục hoành */}
              <span className="mt-3 text-xs font-semibold text-slate-700 text-center truncate w-full" title={row.algo}>
                {row.algo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LabModule() {
  const [payload, setPayload] = useState('Lệnh thanh toán #TXN-2026-001 | Số tiền: 50.000.000 VND | Người thụ hưởng: Công ty ABC');
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  const summary = useMemo(() => {
    if (!result?.signatures?.length) return null;
    return {
      largest: result.signatures.reduce((best, row) => (row.sigSize > best.sigSize ? row : best)),
      fastest: result.signatures.reduce((best, row) => (row.signMs < best.signMs ? row : best)),
    };
  }, [result]);

  const run = async () => {
    if (!payload.trim()) {
      setError('Nhập payload trước khi bắt đầu benchmark.');
      return;
    }
    setRunning(true);
    setError('');
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: payload }),
      });
      if (!response.ok) throw new Error();
      setResult(await response.json());
    } catch (requestError) {
      setError('Không thể kết nối PQC Lab. Hãy đảm bảo backend đang chạy tại http://localhost:8000.');
      console.error(requestError);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-700">PQC benchmark environment</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">Thử nghiệm chữ ký và trao đổi khóa</h3>
            <p className="mt-2 text-sm text-slate-500">So sánh thời gian, kích thước khóa và chữ ký trên cùng một payload.</p>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${result?.pqcAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
            <span className={`size-2 rounded-full ${result?.pqcAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {result ? (result.pqcAvailable ? 'PQC engine đã sẵn sàng' : 'Chỉ baseline cổ điển') : 'Chưa kiểm thử'}
          </div>
        </div>
        <div className="p-6 grid lg:grid-cols-[1.35fr_.65fr] gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-[.14em] text-slate-500 mb-2">Payload thử nghiệm</label>
            <textarea
              value={payload}
              onChange={(event) => setPayload(event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 font-mono leading-6 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <button
              onClick={run}
              disabled={running}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-700 disabled:opacity-60 transition"
            >
              {running ? <RefreshCw className="size-4 animate-spin" /> : <Play className="size-4" />}
              {running ? 'Đang chạy benchmark…' : 'Thực thi benchmark'}
            </button>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-5">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-slate-500">Quy trình lab</p>
            <ol className="mt-4 space-y-4 text-sm text-slate-600">
              <li className="flex gap-3"><span className="font-mono text-cyan-700">01</span>Tạo payload UTF-8 dùng chung cho mọi thuật toán.</li>
              <li className="flex gap-3"><span className="font-mono text-cyan-700">02</span>Ký, xác minh và đo thời gian thực thi.</li>
              <li className="flex gap-3"><span className="font-mono text-cyan-700">03</span>Encapsulation/decapsulation ML-KEM và so khớp bí mật chung.</li>
            </ol>
          </div>
        </div>
      </section>

      {result && (
        <>
          {/* Summary Cards */}
          <section className="grid md:grid-cols-3 gap-4">
            {[
              [ShieldCheck, 'Chữ ký xác minh', `${result.signatures.length} thuật toán`, 'Kết quả từ backend'],
              [Timer, 'Ký nhanh nhất', summary.fastest.algo, `${summary.fastest.signMs} ms`],
              [KeyRound, 'Chữ ký lớn nhất', summary.largest.algo, `${number(summary.largest.sigSize)} B`],
            ].map(([Icon, label, value, note]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <Icon className="size-5 text-cyan-700" />
                <p className="mt-4 text-xs uppercase tracking-[.14em] text-slate-500">{label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
                <p className="mt-1 text-xs text-slate-500">{note}</p>
              </div>
            ))}
          </section>

          {!result.pqcAvailable && (
            <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <CircleAlert className="size-5 shrink-0" />
              <p><b>ML-KEM, ML-DSA và SLH-DSA chưa được thực thi.</b> {result.pqcError || 'PQC engine chưa khả dụng.'}</p>
            </div>
          )}

          {/* Biểu đồ Cột Dọc */}
          <div className="grid xl:grid-cols-2 gap-6">
            <VerticalComparisonChart
              title="So sánh kích thước"
              caption="Khóa công khai, khóa bí mật và chữ ký. Cột cao hơn thể hiện overhead truyền/lưu trữ cao hơn."
              data={result.signatures}
              unit="B"
              metrics={[
                { key: 'pubKey', label: 'Public key', color: 'bg-cyan-500', hex: '#06b6d4' },
                { key: 'privKey', label: 'Private key', color: 'bg-violet-500', hex: '#8b5cf6' },
                { key: 'sigSize', label: 'Chữ ký', color: 'bg-amber-500', hex: '#f59e0b' },
              ]}
            />
            <VerticalComparisonChart
              title="So sánh hiệu năng"
              caption="Thời gian ký và xác minh trong lần chạy benchmark hiện tại."
              data={result.signatures}
              unit="ms"
              metrics={[
                { key: 'signMs', label: 'Ký', color: 'bg-cyan-500', hex: '#06b6d4' },
                { key: 'verifyMs', label: 'Xác minh', color: 'bg-emerald-500', hex: '#10b981' },
              ]}
            />
          </div>

          {/* Bảng Chi tiết */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h4 className="font-semibold text-slate-900">Bảng số liệu chi tiết</h4>
              <p className="text-sm text-slate-500 mt-1">Giá trị chính xác dùng để ghi nhận và phân tích sau thử nghiệm.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    {['Thuật toán', 'Public key', 'Private key', 'Chữ ký', 'Ký', 'Xác minh', 'Trạng thái'].map((heading) => (
                      <th key={heading} className="p-4">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.signatures.map((row) => (
                    <tr key={row.algo} className="text-slate-700">
                      <td className="p-4 font-semibold text-slate-900">{row.algo}</td>
                      <td className="p-4">{number(row.pubKey)} B</td>
                      <td className="p-4">{number(row.privKey)} B</td>
                      <td className="p-4 font-semibold text-cyan-700">{number(row.sigSize)} B</td>
                      <td className="p-4">{row.signMs} ms</td>
                      <td className="p-4">{row.verifyMs} ms</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="size-4" />
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ML-KEM Key Exchange */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center size-10 rounded-xl bg-cyan-50 text-cyan-700">
                <KeyRound className="size-5" />
              </span>
              <div>
                <h4 className="font-semibold text-slate-900">ML-KEM-768 · trao đổi khóa</h4>
                <p className="text-sm text-slate-500">Encapsulation/decapsulation và kích thước thành phần.</p>
              </div>
            </div>
            {result.kem ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
                {[
                  ['Public key', result.kem.pubKey],
                  ['Private key', result.kem.privKey],
                  ['Ciphertext', result.kem.ciphertext],
                  ['Encap', `${result.kem.encapMs} ms`],
                  ['Decap', `${result.kem.decapMs} ms`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {typeof value === 'number' ? `${number(value)} B` : value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Chưa có kết quả ML-KEM trong lần chạy này.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}