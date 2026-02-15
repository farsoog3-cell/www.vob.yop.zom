const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// إعداد التخزين للصور الملتقطة
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const name = 'capture_' + Date.now() + '.png';
    cb(null, name);
  }
});
const upload = multer({ storage });

// استضافة الملفات الثابتة
app.use(express.static(path.join(__dirname, 'public')));

// استقبال الصورة من العميل وحفظها على السيرفر
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  res.json({ success: true, filename: req.file.filename });
});

// Socket.io للتواصل اللحظي (اختياري)
io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
