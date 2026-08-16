import hmac
import hashlib
from datetime import datetime
from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    CbomItem, CbomEvaluateRequest, LabRequest, LabResponse, 
    HndlRequest, HndlResponse
)
from .services.rule_engine import compute_auto_risk, parse_retention_years
from .services.crypto_lab import execute_pqc_benchmark, PQC_ALGORITHMS
from .utils.cyclonedx import generate_cyclonedx_cbom

app = FastAPI(
    title="PQC Compliance Suite API",
    description="Backend Engine xử lý Mật mã Hậu Lượng tử và Đánh giá Rủi ro cho Ngân hàng",
    version="1.0.0"
)

# Sửa CORS đúng tiêu chuẩn W3C
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
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
    current_year = datetime.now().year
    y2q = req.y2qEstimate or 2030
    
    retention_years = parse_retention_years(req.retention)
    data_expiry_year = current_year + retention_years
    
    payload = f"TXN_{req.assetId}|SYS:{req.system}|DATA:{req.dataType}"
    
    # Sử dụng HMAC-SHA256 giả lập MAC thay vì MD5
    cipher_hash = hashlib.sha256(payload.encode()).hexdigest().upper()[:32]
    sig_mac = hmac.new(b"pqc-secret-seed", payload.encode(), hashlib.sha256).hexdigest().upper()[:32]
    
    is_long_term = retention_years >= 10
    is_hybrid = req.protectionMode.lower() == "hybrid"
    
    # Đồng bộ đánh giá từ rule_engine
    migration_priority, pqc_recommendation, base_score = compute_auto_risk(req.algo, req.retention)

    if is_hybrid:
        hndl_score = 10
        status_msg = "SECURE: Đã bảo vệ bằng Hybrid PQC."
        status_code = "SECURE"
        exposure_window = "Không có (An toàn)"
        risk_explanation = "Dữ liệu được bảo vệ bằng lớp mã hóa kép. Bẻ gãy RSA/ECC không thể giải mã payload được bảo vệ bởi ML-KEM/ML-DSA."
        legacy_analysis = "Bị giải mã khóa công khai truyền thống nhưng không mở được lớp PQC bọc ngoài."
    else:
        hndl_score = base_score
        if data_expiry_year > y2q:
            exposure_years = data_expiry_year - y2q
            exposure_window = f"{exposure_years} năm"
            status_msg = "CRITICAL: Nguy cơ tàn phá từ tấn công HNDL."
            status_code = "CRITICAL"
            risk_explanation = f"Dữ liệu ('{req.dataType}') lưu trữ đến năm {data_expiry_year}. Dự kiến máy tính lượng tử bẻ khóa năm {y2q}, thời hạn bị rò rỉ {exposure_years} năm."
            legacy_analysis = f"SỨC TÀN PHÁ CAO: Toàn bộ lưu lượng thu thập từ hiện tại sẽ bị giải mã khi đạt mốc Y2Q ({y2q})."
        else:
            exposure_window = "Không có (Dữ liệu hết hạn trước Y2Q)"
            status_msg = "WARNING: Rủi ro trung bình, dữ liệu hết hạn trước Y2Q."
            status_code = "WARNING"
            risk_explanation = "Vòng đời dữ liệu ngắn hơn thời điểm dự kiến của Y2Q nhưng vẫn cần đề phòng lưu trữ metadata vĩnh viễn."
            legacy_analysis = "Dữ liệu bị giải mã sau khi đã hết hạn sử dụng nghiệp vụ."

    pqc_analysis = "KHÁNG LƯỢNG TỬ: Thuật toán mạng tinh thể (Lattice-based) vô hiệu hóa thuật toán Shor/Grover."

    return HndlResponse(
        payload=payload,
        cipherHash=cipher_hash,
        sigHash=sig_mac,
        isLongTerm=is_long_term,
        statusMsg=status_msg,
        statusCode=status_code,
        legacyAnalysis=legacy_analysis,
        pqcAnalysis=pqc_analysis,
        hndlScore=hndl_score,
        riskExplanation=risk_explanation,
        pqcRecommendation=pqc_recommendation,
        migrationPriority=migration_priority,
        exposureWindow=exposure_window,
        dataExpiryYear=data_expiry_year
    )

@app.post("/api/cbom/export-cyclonedx")
def export_cyclonedx(req: CbomEvaluateRequest):
    return generate_cyclonedx_cbom(req.items)