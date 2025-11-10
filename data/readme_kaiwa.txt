# README: Quy tắc tạo và chia câu Kaiwa (会話データルール)

## 🎯 Mục tiêu
Dữ liệu Kaiwa được dùng để tạo hội thoại tiếng Nhật dễ hiểu cho người học.  
Mỗi câu trả lời được chia thành các phần nhỏ (blocks) để học viên nắm rõ từng cấu trúc ngữ pháp.

---

## 📘 Cấu trúc dữ liệu
Mỗi câu hỏi bao gồm:
```js
{
    "characterName": "たなかさん (Tanaka-san)",
    "question": "このかたは どなたですか。",
    "translation": "Vị này là ai?",
    "correctOrder": ["このかたは", "たなかみかさんです。"],
    "blocks": ["このかたは", "たなかみかさんです。"]
}
```

---

## 🧩 Quy tắc chia câu (BLOCK RULES)

### 1️⃣ Chia theo đơn vị ngữ pháp
- Mỗi block là **một phần có ý nghĩa riêng hoặc cấu trúc ngữ pháp rõ ràng**.
- Block không được quá ngắn (không chia từng chữ đơn lẻ).

### 2️⃣ Tách TRƯỚC các trợ từ và mệnh đề
Tách tại:
```
は、が、を、に、へ、で、から、まで、の、と、も、や、けど、て、で、から
```

### 3️⃣ Không tách trong các cụm cố định
Không tách:
```
- Danh từ ghép: たなかみかさん, こうじょう
- Cụm tính từ + danh từ: しずかなまち
- Động từ kết hợp: はたらいています, たべています
- Kết thúc câu: 〜です、〜ます、〜あります、〜います
```

### 4️⃣ Giữ nguyên các câu ngắn hoàn chỉnh
Các câu như:
```
はい、そうです。
いいえ、ちがいます。
```
→ Giữ làm một block duy nhất.

### 5️⃣ Ví dụ tách đúng
| Câu gốc | Blocks |
|----------|--------|
| このかたは たなかみかさんです。 | ["このかたは", "たなかみかさんです。"] |
| ITのかいしゃではたらいています。 | ["ITの", "かいしゃで", "はたらいています。"] |
| せがたかくて、かみがながくて、あかるいひとです。 | ["せが", "たかくて、", "かみが", "ながくて、", "あかるい", "ひとです。"] |

---

## 🧠 Quy tắc cho AI sinh dữ liệu mới
- Giữ nguyên cấu trúc JSON như trên.
- Mỗi câu có:
  - 1 nhân vật (`characterName`)
  - 1 câu hỏi (`question`)
  - 1 bản dịch (`translation`)
  - 1 câu trả lời tách thành `blocks`
- Áp dụng quy tắc tách block ở trên cho tất cả câu trả lời.
- Giữ câu tự nhiên, trình độ N5–N4.

---

## 🪶 Gợi ý mở rộng
- Nếu câu có nhiều mệnh đề nối bằng 「〜て」「〜で」 → chia mỗi mệnh đề thành một block.
- Nếu có danh từ + の + danh từ → tách tại 「の」.
- Các câu kết thúc luôn có dấu câu 「。」「？」.

---

Tệp này được dùng để hướng dẫn AI hoặc lập trình viên tạo dữ liệu hội thoại đồng bộ theo phong cách Kaiwa.
