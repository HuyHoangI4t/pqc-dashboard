import React from 'react';
import { Calendar, CheckCircle2, Milestone } from 'lucide-react';

const ROADMAP = [
  { stage: 'Giai đoạn 1', time: '0–6 tháng', title: 'Kiểm kê & Chuẩn bị', task: 'Hoàn thiện CBOM, đánh giá Risk Score tự động, kiểm tra Crypto-Agility.', kpi: '100% tài sản được kiểm kê', progress: 100 },
  { stage: 'Giai đoạn 2', time: '6–12 tháng', title: 'Thử nghiệm Hybrid', task: 'PoC ML-KEM / ML-DSA cho API Gateway và ký lệnh thanh toán trên Lab.', kpi: 'Thử nghiệm ký lai thành công', progress: 30 },
  { stage: 'Giai đoạn 3', time: '12–24 tháng', title: 'Mở rộng Hạ tầng', task: 'Nâng cấp bộ nhớ HSM, nâng cấp cấu trúc gói tin API và tích hợp đối tác.', kpi: '80% luồng rủi ro cao dùng Hybrid', progress: 0 },
  { stage: 'Giai đoạn 4', time: '24–36 tháng', title: 'Chuẩn hóa PQC', task: 'Chuyển dần sang PQC thuần theo chính sách hướng dẫn của Ngân hàng Nhà nước.', kpi: 'Tuân thủ tiêu chuẩn FIPS 203/204/205', progress: 0 },
  { stage: 'Giai đoạn 5', time: 'Sau 36 tháng', title: 'Vận hành & Cải tiến', task: 'Giám sát tuân thủ, cập nhật bản vá NIST và diễn tập ứng phó sự cố.', kpi: '100% hệ thống trọng yếu an toàn', progress: 0 },
];

export default function RoadmapModule() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-700 mb-2">Transition Strategy</p>
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Milestone className="size-5 text-cyan-700" />
          Lộ trình Chuyển đổi sang PQC (Roadmap 5 Giai đoạn)
        </h3>
        <p className="text-sm text-slate-500 mt-1">Kế hoạch hiện đại hóa hạ tầng mật mã cho tổ chức tài chính – ngân hàng.</p>
      </div>

      <div className="space-y-4">
        {ROADMAP.map((item) => {
          const isComplete = item.progress === 100;
          return (
            <div 
              key={item.stage} 
              className="border border-slate-200 rounded-xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-cyan-400/50 hover:bg-slate-50/50 transition"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isComplete 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                  }`}>
                    {item.stage}
                  </span>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Calendar className="size-3 text-slate-400" /> {item.time}
                  </span>
                  {isComplete && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 ml-1">
                      <CheckCircle2 className="size-3.5" /> Hoàn thành
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{item.task}</p>
                <div className="text-xs text-slate-500 font-medium pt-0.5">
                  KPI: <span className="text-slate-800 font-semibold">{item.kpi}</span>
                </div>
              </div>

              <div className="w-full md:w-36 shrink-0">
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider">Tiến độ</span>
                  <span className={isComplete ? 'text-emerald-600' : 'text-cyan-700'}>{item.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-cyan-600'}`} 
                    style={{ width: `${item.progress}%` }} 
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}