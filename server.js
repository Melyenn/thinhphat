const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null, 'upload/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({storage: storage});

app.use(express.json()); 
app.post('/api/contact', upload.none(), (req, res) => {
  console.log('Received data:', req.body);  
  const filePath = path.join(__dirname, 'messages.json');

  const contactData = req.body;

  fs.readFile(filePath, 'utf8', (err, data) => {
    let jsonData = [];

    if (!err && data) {
      jsonData = JSON.parse(data);
    }

    jsonData.push(contactData);

    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        console.error("Error writing to file:", err);
        return res.status(500).json({message: 'There was an error saving.'})
      }

      res.status(200).json({message: 'Contact saved successfully'});
    });
  });
});

const viewFilePath = path.join(__dirname, 'views.json');
app.get('/api/views', async(req, res) => {
  fs.readFile(viewFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({message: 'Error reading view file'});
    }
    const viewdata = JSON.parse(data);
    res.status(200).json(viewdata.views);
  })
})

app.post('/api/increase-view', async(req, res) => {
  fs.readFile(viewFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({message: 'Error reading file'});
    }

    const viewData = JSON.parse(data);
    viewData.views += 1;
    fs.writeFile(viewFilePath, JSON.stringify(viewData, null, 2), err => {
      if (err) {
        console.error('Error updating view file:', err);
        res.status(500).json({message: 'Error'});
      }
      res.status(200).json({message: 'increase-view successfully'})
    }); 
  });
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});

