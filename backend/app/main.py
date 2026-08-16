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
    import datetime
    current_year = datetime.datetime.now().year
    y2q = req.y2qEstimate or 2030
    
    # Parse retention years
    retention_years = 0
    if "> 15" in req.retention: retention_years = 20
    elif "> 10" in req.retention: retention_years = 15
    elif "5–10" in req.retention or "5-10" in req.retention: retention_years = 8
    elif "< 24" in req.retention: retention_years = 0
    
    data_expiry_year = current_year + retention_years
    exposure_start = max(current_year, y2q)
    
    payload = f"TXN_{req.assetId}|SYS:{req.system}|DATA:{req.dataType}"
    cipher_hash = hashlib.sha256(payload.encode()).hexdigest().upper()[:32]
    sig_hash = hashlib.md5(payload.encode()).hexdigest().upper()[:16]
    
    is_long_term = retention_years >= 10
    is_hybrid = req.protectionMode == "hybrid"
    
    # Calculate Exposure Window
    if data_expiry_year > y2q and not is_hybrid:
        exposure_window = f"{y2q} — {data_expiry_year} ({data_expiry_year - y2q} năm lộ lọt)"
    else:
        exposure_window = "Không có (An toàn)"

    # 1. Determine Score and Base Status
    if is_hybrid:
        hndl_score = 10 if is_long_term else 5
        status_msg = "SECURE: Đã bảo vệ bằng Hybrid PQC."
        status_code = "SECURE"
        migration_priority = "Hoàn thành"
        pqc_recommendation = "Duy trì cấu hình Hybrid và thực hiện Crypto Agility."
    elif is_long_term:
        hndl_score = 98 if "Hồ sơ" in req.dataType or "Chữ ký" in req.dataType else 90
        status_msg = "CRITICAL: Nguy cơ tàn phá từ HNDL."
        status_code = "CRITICAL"
        migration_priority = "Khẩn cấp"
        pqc_recommendation = f"Nâng cấp lên ML-KEM-1024 (Lớp bảo mật cao nhất) ngay lập tức."
    else:
        hndl_score = 35
        status_msg = "WARNING: Rủi ro thấp nhưng không được chủ quan."
        status_code = "WARNING"
        migration_priority = "Trung bình"
        pqc_recommendation = "Lộ trình nâng cấp trong 12-24 tháng."

    # 2. Risk Explanation
    if is_hybrid:
        risk_explanation = "Dữ liệu được bảo vệ bởi 2 lớp khóa. Kẻ tấn công bẻ được RSA/ECC vẫn bế tắc trước PQC."
    elif is_long_term:
        risk_explanation = f"Dữ liệu nhạy cảm ('{req.dataType}') có vòng đời đến năm {data_expiry_year}. Máy tính lượng tử (Y2Q) dự kiến xuất hiện năm {y2q}, tạo ra cửa sổ lộ lọt dài {data_expiry_year - y2q} năm."
    else:
        risk_explanation = "Vòng đời dữ liệu ngắn giúp hạn chế thiệt hại, nhưng kẻ tấn công vẫn có thể thu thập thông tin định danh."

    # 3. Scenario Analysis
    legacy_analysis = f"SỨC TÀN PHÁ CAO: Toàn bộ {req.dataType} từ năm {current_year} sẽ bị giải mã vào năm {y2q}. Hồ sơ nhạy cảm bị công khai." if is_long_term else f"THIỆT HẠI THẤP: Shor bẻ được khóa nhưng dữ liệu đã hết giá trị khai thác."
    pqc_analysis = "KHÁNG LƯỢNG TỬ: Thuật toán dựa trên bài toán Lưới ngăn chặn hoàn toàn việc tính ngược khóa."

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
        migrationPriority=migration_priority,
        exposureWindow=exposure_window,
        dataExpiryYear=data_expiry_year
    )

@app.post("/api/cbom/export-cyclonedx")
def export_cyclonedx(req: CbomEvaluateRequest):
    return generate_cyclonedx_cbom(req.items)
