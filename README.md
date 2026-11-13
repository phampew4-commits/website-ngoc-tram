# Website Ngọc Trầm Store

Web tĩnh (HTML + CSS + JS thuần, không cần build), chạy trên GitHub Pages từ nhánh `main`:
<https://phampew4-commits.github.io/website-ngoc-tram/>

## Bố cục thư mục

```
index.html        trang chủ
san-pham.html     chi tiết món  (?ma=<mã>)
thiet-ke.html     tự thiết kế chuỗi
tai-khoan.html    tài khoản khách

css/     style.css — toàn bộ giao diện
js/      mã nguồn trang
data/    dữ liệu web (tự sinh, đừng sửa tay)
img/     ảnh
noi-bo/  file nội bộ, không thuộc web bán hàng
```

### js/

| File | Việc |
|---|---|
| `cau-hinh.js` | cấu hình cửa hàng — **tự sinh** từ `data/cau-hinh.json` (sửa trong app › Quản trị web) |
| `chung.js` | dùng chung mọi trang: đầu trang, chân trang, tải JSON, định dạng giá |
| `khach.js` | đăng nhập / tài khoản khách (Firebase, tải trễ) |
| `trang-chu.js` | trang chủ |
| `chi-tiet.js` | trang chi tiết món |
| `tai-khoan.js` | trang tài khoản |
| `thiet-ke.js` | trang tự thiết kế chuỗi (bảng chọn, vòng 2D) |
| `vong-3d.js` | vòng 3D trang thiết kế |
| `tk-3d.js` | vòng 3D giới thiệu ở trang chủ |
| `charm-3d.js` | mô hình 3D của từng charm — **nguồn**, sửa ở đây |
| `charm-3d.min.js` | bản nén của file trên — **tự sinh** khi đăng web, đừng sửa tay |
| `charm-ve.js` | vẽ charm 2D trên vòng |
| `charm-v3.js` | danh sách charm đã có ảnh v3 — **tự sinh** bởi `charm-renders/v3_web.py` |

### data/ (đều tự sinh)

- `cau-hinh.json` — app › Quản trị web ghi ra.
- `san-pham.json`, `thiet-ke.json` — `noi-bo/xuat_du_lieu.py` xuất từ kho của app Tìm Charm.
  Chỉ có thông tin công khai: **không bao giờ có giá sỉ, giá vốn, ghi chú nội bộ**.

### img/

- `hoa.png`, `logo.png` — nhận diện cửa hàng.
- `charm-anh/` — ảnh mặt ngọc thật, dán lên mô hình 3D.
- `charm-v3/` — ảnh charm phẳng (xuất từ Figma).
- `day-tron/` — ảnh chuỗi trơn.

### noi-bo/

Không phải phần web bán hàng, để lại cho tiện khi dựng 3D:
`thu-3d.html` (trang thử mô hình), `soat-3d.md` (sổ soát 3D),
`charm-ve-rieng.js` (bản vẽ 2D cũ, web không tải nữa), `xuat_du_lieu.py` (không đẩy lên GitHub).

## Cách đăng web

Trong app Ngọc Trầm › Quản trị web bấm **Đăng web**, hoặc nhờ Claude "Lưu để đăng".
Bước này tự nén `js/charm-3d.js`, commit rồi push. Đẩy xong, web thật đổi sau 1–2 phút.

Đổi `style.css` hay file trong `js/` thì nhớ tăng số `?v=` trong các trang HTML
để trình duyệt khách tải bản mới.
