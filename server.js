// const express = require('express');
// const cors = require('cors');
// const multer = require('multer');
// const fs = require('fs');
// const path = require('path');
// const app = express();
//
// app.use(cors());
//
// const storage = multer.diskStorage({
//   destination: (req, file, cb)=>{
//     cb(null, 'upload/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });
// const upload = multer({storage: storage});
//
// app.use(express.json()); 
// app.post('/api/contact', upload.none(), (req, res) => {
//   console.log('Received data:', req.body);  
//   const filePath = path.join(__dirname, 'messages.json');
//
//   const contactData = req.body;
//
//   fs.readFile(filePath, 'utf8', (err, data) => {
//     let jsonData = [];
//
//     if (!err && data) {
//       jsonData = JSON.parse(data);
//     }
//
//     jsonData.push(contactData);
//
//     fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
//       if (err) {
//         console.error("Error writing to file:", err);
//         return res.status(500).json({message: 'There was an error saving.'})
//       }
//
//       res.status(200).json({message: 'Contact saved successfully'});
//     });
//   });
// });
//
// const viewFilePath = path.join(__dirname, 'views.json');
// app.get('/api/views', async(req, res) => {
//   fs.readFile(viewFilePath, 'utf8', (err, data) => {
//     if (err) {
//       return res.status(500).json({message: 'Error reading view file'});
//     }
//     const viewdata = JSON.parse(data);
//     res.status(200).json(viewdata.views);
//   })
// })
//
// app.post('/api/increase-view', async(req, res) => {
//   fs.readFile(viewFilePath, 'utf8', (err, data) => {
//     if (err) {
//       return res.status(500).json({message: 'Error reading file'});
//     }
//
//     const viewData = JSON.parse(data);
//     viewData.views += 1;
//     fs.writeFile(viewFilePath, JSON.stringify(viewData, null, 2), err => {
//       if (err) {
//         console.error('Error updating view file:', err);
//         res.status(500).json({message: 'Error'});
//       }
//       console.log('increase-view');
//       res.status(200).json({message: 'increase-view successfully'})
//     }); 
//   });
// });
//
// app.listen(3001, () => {
//   console.log('Server running on port 3001');
// });
//
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const app = express();

// Mở kết nối đến cơ sở dữ liệu SQLite
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Tạo bảng `views` nếu chưa tồn tại
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      views INTEGER DEFAULT 0
    )
  `);

  // Tạo bảng `contacts` để lưu thông tin liên hệ (nếu chưa có)
  db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      message TEXT
    )
  `);
});

app.use(cors());
app.use(express.json()); // Parse JSON request body

// Cấu hình Multer để tải lên file (nếu cần)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'upload/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// API để nhận thông tin liên hệ
app.post('/api/contact', upload.none(), (req, res) => {
  const { name, email, message } = req.body;

  const query = 'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)';
  db.run(query, [name, email, message], function (err) {
    if (err) {
      console.error('Error saving contact:', err.message);
      return res.status(500).json({ message: 'There was an error saving.' });
    }

    res.status(200).json({ message: 'Contact saved successfully' });
  });
});

// API để lấy số lượt xem
app.get('/api/views', (req, res) => {
  db.get('SELECT views FROM views WHERE id = 1', [], (err, row) => {
    if (err) {
      console.error('Error checking views:', err.message);
      return res.status(500).json({ message: 'Error checking views' });
    }
    res.status(200).json({ views: row ? row.views : 0 });
  });
});

// API để tăng số lượt xem
app.post('/api/increase-view', (req, res) => {
  db.run('UPDATE views SET views = views + 1 WHERE id = 1', [], function (err) {
    if (err) {
      console.error('Error increasing views:', err.message);
      return res.status(500).json({ message: 'Error increasing views' });
    }
    console.log('View increased');
    res.status(200).json({ message: 'View increased successfully' });
  });
});

// Khởi chạy server
app.listen(3001, () => {
  console.log('Server running on port 3001');
});

