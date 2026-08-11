import React, { useState } from 'react';
import { Download, Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MetricsGrid from './components/MetricsGrid';
import CbomModule from './modules/CbomModule';
import LabModule from './modules/LabModule';
import HndlModule from './modules/HndlModule';
import RiskModule from './modules/RiskModule';
import RoadmapModule from './modules/RoadmapModule';
import ResearchOverview from './modules/ResearchOverview';
import { INITIAL_CBOM } from './data/initialCbom';

const titles = { overview: ['Research brief', 'Nghiên cứu chuyển đổi sang mật mã hậu lượng tử'], inventory: ['Crypto inventory', 'Danh mục tài sản mật mã'], risk: ['Quantum exposure', 'Rủi ro lượng tử và thời hạn bảo vệ dữ liệu'], lab: ['PQC lab', 'Thử nghiệm thư viện và so sánh hiệu năng'], hndl: ['HNDL simulator', 'Harvest now, decrypt later'], roadmap: ['Migration roadmap', 'Lộ trình chuyển đổi an toàn'] };

export default function App() {
  const [activeTab, setActiveTab] = useState('overview'); const [cbom] = useState(INITIAL_CBOM);
  const handleExport = async () => { try { const response = await fetch('http://localhost:8000/api/cbom/export-cyclonedx', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cbom }) }); if (!response.ok) throw new Error(); const blob = new Blob([JSON.stringify(await response.json(), null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'cbom-cyclonedx-v1.6.json'; link.click(); URL.revokeObjectURL(url); } catch (error) { console.error(error); } };
  const content = activeTab === 'overview' ? <ResearchOverview setActiveTab={setActiveTab} /> : <><MetricsGrid cbom={cbom} /><div className="mt-6">{activeTab === 'inventory' && <CbomModule cbom={cbom} />}{activeTab === 'risk' && <RiskModule cbom={cbom} />}{activeTab === 'lab' && <LabModule />}{activeTab === 'hndl' && <HndlModule cbom={cbom} />}{activeTab === 'roadmap' && <RoadmapModule />}</div></>;
  return <div className="min-h-screen bg-[#f5f8fc] text-slate-700 flex"><Sidebar activeTab={activeTab} setActiveTab={setActiveTab} /><main className="min-w-0 flex-1 px-5 py-6 md:px-10 md:py-8 max-w-[1600px]"><header className="mb-8 flex justify-between gap-4"><div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-cyan-700"><Menu className="size-3" /> {titles[activeTab][0]}</div><h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">{titles[activeTab][1]}</h1></div>{activeTab !== 'overview' && <button onClick={handleExport} className="hidden sm:inline-flex self-start items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"><Download className="size-4 text-cyan-700" />Xuất CBOM</button>}</header>{content}</main></div>;
}
