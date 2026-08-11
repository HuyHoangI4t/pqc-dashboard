def compute_auto_risk(algorithm: str, retention: str) -> tuple[str, str, int]:
    algo_u = str(algorithm).upper()
    ret_u = str(retention).upper()

    is_asymmetric_vulnerable = any(k in algo_u for k in ["RSA", "ECDSA", "ECDH", "ECC"])
    is_long_term = "> 10" in ret_u or "> 15" in ret_u
    is_medium_term = "5–10" in ret_u or "5-10" in ret_u

    if is_asymmetric_vulnerable:
        if is_long_term:
            score = 95
            priority = "Rất cao"
            recommendation = "ML-KEM / ML-DSA Hybrid PQC ngay (Nguy cơ HNDL cao)"
        elif is_medium_term:
            score = 75
            priority = "Cao"
            recommendation = "Lập kế hoạch thử nghiệm Hybrid PQC (6–12 tháng)"
        else:
            score = 50
            priority = "Trung bình"
            recommendation = "Chuyển đổi PQC theo vòng đời nâng cấp hệ thống"
    elif "AES-256" in algo_u:
        score = 20
        priority = "Thấp"
        recommendation = "Giữ AES-256, rà soát quản lý khóa & Crypto Agility"
    elif "SHA" in algo_u:
        score = 10
        priority = "Thấp"
        recommendation = "Duy trì hàm băm hiện tại"
    else:
        score = 40
        priority = "Trung bình"
        recommendation = "Đánh giá thủ công vai trò thuật toán"

    return priority, recommendation, score
