import re

def parse_retention_years(retention_str: str) -> int:
    """Trích xuất số năm lưu trữ từ chuỗi bất kỳ dạng (> 15 năm, 5-10, P10Y, v.v.)."""
    s = str(retention_str).strip().lower()
    
    # Check định dạng ISO 8601 duration ví dụ: P10Y
    iso_match = re.search(r'p(\d+)y', s)
    if iso_match:
        return int(iso_match.group(1))

    # Tìm các khoảng hoặc so sánh
    if ">" in s or "trên" in s:
        nums = re.findall(r'\d+', s)
        return int(nums[0]) + 5 if nums else 15
    if "<" in s or "dưới" in s or "hour" in s or "24h" in s or "ngày" in s:
        return 0

    # Tìm khoảng X-Y hoặc X–Y
    range_match = re.findall(r'(\d+)\s*[-–]\s*(\d+)', s)
    if range_match:
        return int(range_match[0][1]) # Lấy mốc cận trên

    # Tìm số đơn lẻ
    nums = re.findall(r'\d+', s)
    return int(nums[0]) if nums else 0


def compute_auto_risk(algorithm: str, retention: str) -> tuple[str, str, int]:
    algo_u = str(algorithm).upper()
    retention_years = parse_retention_years(retention)

    is_asymmetric_vulnerable = any(k in algo_u for k in ["RSA", "ECDSA", "ECDH", "ECC", "DSA", "DH"])
    is_pqc = any(k in algo_u for k in ["ML-KEM", "ML-DSA", "SLH-DSA", "FALCON", "KYBER", "DILITHIUM"])

    if is_pqc:
        return "Hoàn thành", "Duy trì thuật toán PQC và theo dõi chuẩn hóa Crypto-Agility.", 10

    if is_asymmetric_vulnerable:
        if retention_years >= 10:
            return "Khẩn cấp", "ML-KEM / ML-DSA Hybrid PQC ngay lập tức (Nguy cơ HNDL nghiêm trọng)", 95
        elif retention_years >= 5:
            return "Cao", "Lập kế hoạch thử nghiệm Hybrid PQC (6–12 tháng)", 75
        else:
            return "Trung bình", "Chuyển đổi PQC theo vòng đời nâng cấp hệ thống (12-24 tháng)", 50
            
    if "AES" in algo_u:
        if "256" in algo_u:
            return "Thấp", "Giữ AES-256, rà soát quản lý khóa & Crypto Agility", 20
        return "Trung bình", "Nâng cấp lên AES-256 để đảm bảo an toàn lượng tử (Grover chống 128-bit)", 45

    if "SHA" in algo_u:
        if any(k in algo_u for k in ["SHA-256", "SHA-384", "SHA-512", "SHA3"]):
            return "Thấp", "Duy trì hàm băm hiện tại", 10
        return "Cao", "Nâng cấp ngay lên SHA-256 / SHA3 (Hàm băm cũ không an toàn)", 80

    return "Trung bình", "Đánh giá thủ công vai trò thuật toán", 40