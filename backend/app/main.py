import hashlib
from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    CbomItem, CbomEvaluateRequest, LabRequest, LabResponse, 
    HndlRequest, HndlResponse
)
from .services.rule_engine import compute_auto_risk
from .services.crypto_lab import execute_pqc_benchmark, PQC_ALGORITHMS
from .utils.cyclonedx import generate_cyclonedx_cbom

app = FastAPI(
    title="PQC Compliance Suite API",
    description="Backend Engine xử lý Mật mã Hậu Lượng tử và Đánh giá Rủi ro cho Ngân hàng",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {
        "status": "online",
        "pqc_engine": "pqcrypto",
        "pqc_algorithms": PQC_ALGORITHMS,
        "message": "Backend PQC Engine đang hoạt động bình thường."
    }

@app.post("/api/cbom/evaluate", response_model=List[CbomItem])
def evaluate_cbom_items(req: CbomEvaluateRequest):
    evaluated_items = []
    for item in req.items:
        priority, recommendation, score = compute_auto_risk(item.algo, item.retention)
        item.priority = priority
        item.recommendation = recommendation
        item.riskScore = score
        evaluated_items.append(item)
    return evaluated_items

@app.post("/api/lab/run", response_model=LabResponse)
def run_lab(req: LabRequest):
    return execute_pqc_benchmark(req.message)

@app.post("/api/hndl/simulate", response_model=HndlResponse)
def simulate_hndl(req: HndlRequest):
    payload = f"TXN_{req.assetId}|SYS:{req.system}|DATA:{req.dataType}"
    cipher_hash = hashlib.sha256(payload.encode()).hexdigest().upper()[:32]
    sig_hash = hashlib.md5(payload.encode()).hexdigest().upper()[:16]
    
    is_long_term = "> 10" in req.retention or "> 15" in req.retention or "5–10" in req.retention
    is_hybrid = req.protectionMode == "hybrid"
    
    # 1. Determine Score and Base Status
    if is_hybrid:
        hndl_score = 15 if is_long_term else 5
        status_msg = "SECURE: Đã kích hoạt Hybrid PQC, dữ liệu an toàn trước tấn công lượng tử."
        status_code = "SECURE"
        migration_priority = "Hoàn thành"
        pqc_recommendation = "Duy trì cấu hình Hybrid hiện tại và giám sát hiệu năng."
    elif is_long_term:
        hndl_score = 95
        status_msg = "CRITICAL: Nguy cơ HNDL rất cao do thời hạn bảo vệ dài."
        status_code = "CRITICAL"
        migration_priority = "Rất cao"
        pqc_recommendation = "Triển khai ML-KEM-768 Hybrid mode ngay lập tức."
    else:
        hndl_score = 35
        status_msg = "WARNING: Dữ liệu vòng đời ngắn, rủi ro HNDL thấp nhưng vẫn cần nâng cấp."
        status_code = "WARNING"
        migration_priority = "Trung bình"
        pqc_recommendation = "Lên kế hoạch nâng cấp theo chu kỳ bảo trì hệ thống."

    # 2. Risk Explanation
    if is_hybrid:
        risk_explanation = "Lớp bảo vệ Hybrid (Classical + PQC) đảm bảo ngay cả khi RSA/ECC bị bẻ gãy, kẻ tấn công vẫn không thể giải mã dữ liệu nhờ bài toán Lưới (Lattice-based cryptography)."
    elif is_long_term:
        risk_explanation = "Dữ liệu nhạy cảm có thời hạn bảo vệ dài hơn thời điểm dự kiến xuất hiện máy tính lượng tử (Y2Q). Kẻ tấn công có thể lưu trữ bản mã RSA/ECC hôm nay và giải mã trong tương lai."
    else:
        risk_explanation = "Vòng đời dữ liệu ngắn giúp giảm thiểu tác động của HNDL, nhưng việc thiếu Crypto Agility vẫn là một điểm yếu hệ thống."

    # 3. Scenario Analysis
    legacy_analysis = f"BỊ GIẢI MÃ: Shor có thể tính ngược khóa từ {req.algo}." if is_long_term else f"ÍT ẢNH HƯỞNG: Shor bẻ được {req.algo} nhưng dữ liệu đã hết hạn."
    pqc_analysis = "AN TOÀN: Đã bọc lớp PQC chống chịu máy tính lượng tử." if is_hybrid else "NGUY HIỂM: Hệ thống chưa có lớp bảo vệ hậu lượng tử."

    return HndlResponse(
        payload=payload,
        cipherHash=cipher_hash,
        sigHash=sig_hash,
        isLongTerm=is_long_term,
        statusMsg=status_msg,
        statusCode=status_code,
        legacyAnalysis=legacy_analysis,
        pqcAnalysis=pqc_analysis,
        hndlScore=hndl_score,
        riskExplanation=risk_explanation,
        pqcRecommendation=pqc_recommendation,
        migrationPriority=migration_priority
    )

@app.post("/api/cbom/export-cyclonedx")
def export_cyclonedx(req: CbomEvaluateRequest):
    return generate_cyclonedx_cbom(req.items)
