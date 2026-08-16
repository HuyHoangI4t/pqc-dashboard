# PQC COMPLIANCE SUITE & MIGRATION ADVISOR
> **Hệ thống Kiểm kê Tài sản Mật mã (CBOM), Đánh giá Rủi ro HNDL và Thử nghiệm Mật mã Hậu Lượng tử (PQC)**
> **Đề tài:** Nhóm O — Mật mã Hậu Lượng tử (An toàn & An ninh mạng)

---

## 1. TỔNG QUAN ĐỀ TÀI

### 1.1. Bối cảnh & Nguy cơ Lượng tử
Sự phát triển của máy tính lượng tử quy mô lớn đe dọa trực tiếp nền tảng an toàn của các hệ thống mật mã khóa công khai truyền thống (RSA, ECC/ECDSA, Diffie-Hellman) thông qua thuật toán Shor. 

Mối đe dọa cấp bách nhất hiện nay là hình thức tấn công **Harvest Now, Decrypt Later (HNDL)**: Kẻ tấn công chủ động thu thập, lưu trữ lưu lượng mã hóa từ hôm nay và chờ đợi thời điểm máy tính lượng tử xuất hiện (mốc Y2Q) để bẻ khóa toàn bộ dữ liệu có vòng đời bảo mật dài hạn.

### 1.2. Mục tiêu Dự án
Hệ thống được xây dựng nhằm giải quyết 6 nhiệm vụ cốt lõi:
1. **Kiểm kê tài sản mật mã (CBOM):** Xây dựng danh mục tài sản mật mã theo tiêu chuẩn quốc tế **CycloneDX 1.6 (Cryptographic Asset BOM)**.
2. **Đánh giá rủi ro tự động (Rule Engine):** Phân loại thuật toán và dữ liệu dựa trên **Định lý Mosca ($X + Y > Z$)** và thời gian lưu trữ (*retention period*).
3. **Mô phỏng tấn công HNDL:** Trực quan hóa cửa sổ lộ lọt dữ liệu và so sánh hiệu quả của cơ chế bảo vệ Hybrid PQC so với Classical.
4. **Thực nghiệm PQC Lab (Benchmark):** Đo lường trực tiếp kích thước khóa, kích thước chữ ký và tốc độ xử lý của các thuật toán chuẩn hóa NIST (**ML-KEM-768**, **ML-DSA-65**, **SLH-DSA**) so với RSA-2048 và ECDSA P-256.
5. **Đề xuất kiến trúc:** Thiết kế mô hình chuyển đổi lai (**Hybrid Cryptography**) và quản trị tính linh hoạt mật mã (**Crypto-Agility**).
6. **Lộ trình chuyển đổi:** Xây dựng kế hoạch 5 giai đoạn nâng cấp hạ tầng cho tổ chức tài chính/ngân hàng.

---

## 2. KIẾN TRÚC HỆ THỐNG

Dự án được phân tách theo mô hình Microservices tách biệt giữa Frontend và Backend Engine:

```text
┌─────────────────────────────────────────────────────────────┐
│                    REACT + VITE FRONTEND                    │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────────┐  │
│  │  CBOM Module  │ │  HNDL Sim     │ │   PQC Lab View    │  │
│  └───────┬───────┘ └───────┬───────┘ └─────────┬─────────┘  │
└──────────┼─────────────────┼───────────────────┼────────────┘
           │ JSON            │ POST /api/hndl    │ POST /api/lab
           ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND ENGINE                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  REST API Gateway (main.py)                           │  │
│  └───────┬─────────────────┬───────────────────┬─────────┘  │
│          ▼                 ▼                   ▼            │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────────┐  │
│  │  Rule Engine  │ │  CycloneDX    │ │   PQC Lab Engine  │  │
│  │ (Mosca Risk)  │ │ (CBOM Gen)    │ │(liboqs/pqcrypto)  │  │
│  └───────────────┘ └───────────────┘ └───────────────────┘  │
└─────────────────────────────────────────────────────────────┘