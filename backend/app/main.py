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
    
    if is_long_term:
        status_msg = "CRITICAL: Bản mã có thời hạn dài, bị đối phương thu thập đóng băng chờ Lượng tử."
        status_code = "CRITICAL"
        legacy_analysis = f"BỊ GIẢI MÃ HOÀN TOÀN: Thuật toán Shor tính ngược khóa riêng từ {req.algo}. Dữ liệu {req.retention} bị rò rỉ."
    else:
        status_msg = "LOW RISK: Dữ liệu vòng đời ngắn (<24h), không phải mục tiêu chính của HNDL."
        status_code = "LOW_RISK"
        legacy_analysis = f"ÍT ẢNH HƯỞNG: Shor bẻ được {req.algo} nhưng dữ liệu chỉ có hạn {req.retention}, Token/Session đã hết hạn từ lâu."

    pqc_analysis = "AN TOÀN TUYỆT ĐỐI: Lớp bọc PQC (ML-KEM/ML-DSA) dựa trên bài toán Lưới chống chịu vững vàng trước Shor." if req.protectionMode == "hybrid" else "Chưa bật cơ chế Hybrid PQC."

    return HndlResponse(
        payload=payload,
        cipherHash=cipher_hash,
        sigHash=sig_hash,
        isLongTerm=is_long_term,
        statusMsg=status_msg,
        statusCode=status_code,
        legacyAnalysis=legacy_analysis,
        pqcAnalysis=pqc_analysis
    )

@app.post("/api/cbom/export-cyclonedx")
def export_cyclonedx(req: CbomEvaluateRequest):
    return generate_cyclonedx_cbom(req.items)
