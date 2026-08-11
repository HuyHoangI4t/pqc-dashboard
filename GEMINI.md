# PQC Compliance Suite - Hướng dẫn Phát triển & Quy chuẩn Dự án

Dự án **PQC Compliance Suite** là hệ thống đánh giá tuân thủ, đo kiểm hiệu năng và mô phỏng an toàn mật mã hậu lượng tử (Post-Quantum Cryptography - PQC) dành cho các ứng dụng ngân hàng và tài chính. Hệ thống hỗ trợ lập danh mục tài sản mật mã (CBOM), đánh giá rủi ro thuật toán truyền thống và giả lập kịch bản tấn công thu thập dữ liệu (HNDL).

---

## 1. Cấu trúc Dự án & Công nghệ Sử dụng

Dự án được chia làm hai phần chính:

### Backend (`backend/`)
*   **Framework**: FastAPI (Python 3.10+)
*   **Thư viện Mật mã**:
    *   `cryptography`: Hỗ trợ sinh khóa và mã hóa cổ điển (RSA, ECDSA, AES, SHA).
    *   `pqcrypto`: Triển khai các thuật toán hậu lượng tử tiêu chuẩn NIST (ML-KEM-768, ML-DSA-65, SLH-DSA-SHA2-128f).
*   **Cấu trúc thư mục**:
    *   `app/main.py`: Khởi tạo ứng dụng FastAPI và các endpoints điều hướng.
    *   `app/schemas.py`: Định nghĩa cấu trúc dữ liệu đầu vào/đầu ra bằng Pydantic.
    *   `app/services/crypto_lab.py`: Logic đo kiểm hiệu năng so sánh baseline mật mã.
    *   `app/services/rule_engine.py`: Đánh giá rủi ro tự động dựa trên thời hạn bảo vệ dữ liệu.
    *   `app/utils/cyclonedx.py`: Trình xuất dữ liệu định dạng chuẩn CycloneDX CBOM v1.6.

### Frontend (`frontend/`)
*   **Framework**: React (Vite)
*   **Styling**: Vanilla CSS kết hợp Tailwind CSS
*   **Thư viện icon**: `lucide-react`
*   **Cấu trúc thư mục**:
    *   `src/App.jsx`: Tệp điều khiển trạng thái chính và quản lý tabs.
    *   `src/components/`: Các thành phần giao diện dùng chung (Sidebar, MetricsGrid).
    *   `src/modules/`: Phân hệ chức năng (Overview, Inventory, Risk, Lab, Hndl, Roadmap).
    *   `src/data/initialCbom.js`: Dữ liệu khởi tạo mẫu của CBOM.

---

## 2. Hướng dẫn Cài đặt & Khởi chạy

### Thiết lập Backend
1.  Di chuyển vào thư mục `backend`:
    ```powershell
    cd backend
    ```
2.  Kích hoạt môi trường ảo Python đã có sẵn:
    ```powershell
    .\.venv\Scripts\activate
    ```
3.  Cài đặt các gói phụ thuộc (nếu chưa cài):
    ```powershell
    pip install -r requirements.txt
    ```
4.  Khởi chạy máy chủ API phát triển:
    ```powershell
    uvicorn app.main:app --reload --port 8000
    ```
    API sẽ chạy tại địa chỉ: `http://localhost:8000`

### Thiết lập Frontend
1.  Di chuyển vào thư mục `frontend`:
    ```powershell
    cd ../frontend
    ```
2.  Cài đặt các gói phụ thuộc Node.js:
    ```powershell
    npm install
    ```
3.  Khởi chạy ứng dụng Frontend:
    ```powershell
    npm run dev
    ```
    Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:5173` (hoặc cổng được hiển thị trong terminal).

---

## 3. Quy chuẩn Lập trình & Kiến trúc (Development Guidelines)

Để đảm bảo tính nhất quán và chất lượng mã nguồn, toàn bộ thành viên dự án phải tuân thủ nghiêm ngặt các nguyên tắc sau:

### Nguyên tắc Backend (Python/FastAPI)
*   **Strict Type Hinting**: Luôn định nghĩa kiểu dữ liệu (Type hints) cho tất cả các hàm và tham số đầu vào.
*   **Pydantic Models**: Mọi yêu cầu đầu vào và phản hồi đầu ra của API bắt buộc phải đi qua Pydantic schemas định nghĩa trong `app/schemas.py`. Không sử dụng kiểu dữ liệu dict chung chung cho dữ liệu cấu trúc.
*   **Xử lý Ngoại lệ**: Thư viện mật mã hậu lượng tử (`pqcrypto`) có thể bị lỗi trên một số môi trường không hỗ trợ biên dịch C. Luôn bọc các khối thực thi đo kiểm trong `try-except` và trả về thông tin lỗi an toàn qua thuộc tính `pqcError` thay vì làm sập API.
*   **Định dạng Mã nguồn**: Tuân thủ quy chuẩn PEP 8. Khuyến khích sử dụng `black` hoặc `ruff` để tự động định dạng mã nguồn.

### Nguyên tắc Frontend (React/Vite)
*   **Component hóa**: Tách các phân hệ nghiệp vụ lớn thành các file module riêng biệt trong thư mục `src/modules/` để dễ quản lý và tối ưu hóa hiệu năng render.
*   **Quản lý Trạng thái**: Các trạng thái dùng chung cho nhiều module (ví dụ: danh sách CBOM hiện tại) phải được quản lý ở cấp độ cao nhất (`App.jsx`) và truyền qua props, tránh rò rỉ hoặc bất đồng bộ dữ liệu.
*   **Tương thích Trình duyệt**: Khi sử dụng các hiệu ứng đồ họa hoặc biểu đồ tự dựng (ví dụ biểu đồ so sánh trong `LabModule.jsx`), đảm bảo CSS responsive hoạt động tốt trên cả màn hình Desktop và Mobile.

### Nguyên tắc Bảo mật & Tuân thủ
*   **CycloneDX CBOM v1.6 Standard**: Bất kỳ thay đổi nào liên quan đến cấu trúc của CBOM Item đều phải được đồng bộ hóa trong bộ xuất bản CycloneDX ở `backend/app/utils/cyclonedx.py` để đảm bảo tuân thủ tiêu chuẩn quốc tế.
*   **Bảo mật Thông tin**: Tuyệt đối không lưu trữ chứng thư số thực tế, khóa riêng tư (Private Keys) hoặc dữ liệu nhạy cảm của khách hàng trong mã nguồn. Sử dụng biến môi trường hoặc cơ chế giả lập an toàn cho mục đích demo.
