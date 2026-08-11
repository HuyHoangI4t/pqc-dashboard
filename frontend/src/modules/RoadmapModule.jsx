import React from 'react';
import { Calendar } from 'lucide-react';

const ROADMAP = [
  { stage: 'Giai đoạn 1', time: '0–6 tháng', title: 'Kiểm kê & Chuẩn bị', task: 'Hoàn thiện CBOM, đánh giá Risk Score tự động, kiểm tra Crypto-Agility.', kpi: '100% tài sản được kiểm kê', progress: 100 },
  { stage: 'Giai đoạn 2', time: '6–12 tháng', title: 'Thử nghiệm Hybrid', task: 'PoC ML-KEM / ML-DSA cho API Gateway và ký lệnh thanh toán trên Lab.', kpi: 'Thử nghiệm ký lai thành công', progress: 30 },
  { stage: 'Giai đoạn 3', time: '12–24 tháng', title: 'Mở rộng Hạ tầng', task: 'Nâng cấp bộ nhớ HSM, nâng cấp cấu trúc gói tin API và tích hợp đối tác.', kpi: '80% luồng rủi ro cao dùng Hybrid', progress: 0 },
  { stage: 'Giai đoạn 4', time: '24–36 tháng', title: 'Chuẩn hóa PQC', task: 'Chuyển dần sang PQC thuần theo chính sách hướng dẫn của Ngân hàng Nhà nước.', kpi: 'Tuân thủ tiêu chuẩn FIPS 203/204/205', progress: 0 },
  { stage: 'Giai đoạn 5', time: 'Sau 36 tháng', title: 'Vận hành & Cải tiến', task: 'Giám sát tuân thủ, cập nhật bản vá NIST và diễn tập ứng phó sự cố.', kpi: '100% hệ thống trọng yếu an toàn', progress: 0 },
];

export default function RoadmapModule() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Lộ trình Chuyển đổi sang PQC (Roadmap 5 Giai đoạn)</h3>
      <div className="space-y-4">
        {ROADMAP.map((item) => (
          <div key={item.stage} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center hover:border-blue-300 transition">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full">{item.stage}</span>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.time}</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
              <p className="text-xs text-slate-600">{item.task}</p>
              <div className="text-xs text-slate-500 font-semibold pt-1">KPI: <span className="text-slate-800">{item.kpi}</span></div>
            </div>
            <div className="w-32">
              <div className="text-right text-xs font-bold text-slate-700 mb-1">{item.progress}%</div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${item.progress}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
