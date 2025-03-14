const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/urlShortener')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

app.use(bodyParser.json());

const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortCode: String,
  accessCount: { type: Number, default: 0 }
});

const Url = mongoose.model('Url', urlSchema);

app.get('/', (req, res) => {
  res.send('Welcome to the URL Shortener API!');
});

app.post('/shorten', (req, res) => {
  const { originalUrl } = req.body;
  if (!originalUrl) {
    return res.status(400).send('Original URL is required');
  }

  const shortCode = `short${Date.now()}`;

  const newUrl = new Url({
    originalUrl,
    shortCode,
    accessCount: 0
  });

  newUrl.save()
    .then(() => {
      res.status(201).send({ shortUrl: `http://localhost:3000/${shortCode}` });
    })
    .catch(() => {
      res.status(500).send('Error saving URL');
    });
});

app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  Url.findOneAndUpdate({ shortCode }, { $inc: { accessCount: 1 } }, { new: true })
    .then((url) => {
      if (!url) {
        return res.status(404).send('URL not found');
      }
      res.redirect(url.originalUrl);
    })
    .catch(() => {
      res.status(500).send('Error retrieving URL');
    });
});

app.put('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).send('Original URL is required');
  }

  Url.findOneAndUpdate({ shortCode }, { originalUrl }, { new: true })
    .then((url) => {
      if (!url) {
        return res.status(404).send('Short URL not found');
      }
      res.send({ message: 'Short URL updated successfully' });
    })
    .catch(() => {
      res.status(500).send('Error updating URL');
    });
});

app.delete('/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  Url.findOneAndDelete({ shortCode })
    .then((url) => {
      if (!url) {
        return res.status(404).send('Short URL not found');
      }
      res.send({ message: 'Short URL deleted successfully' });
    })
    .catch(() => {
      res.status(500).send('Error deleting URL');
    });
});

app.get('/:shortCode/stats', (req, res) => {
  const { shortCode } = req.params;

  Url.findOne({ shortCode })
    .then((url) => {
      if (!url) {
        return res.status(404).send('URL not found');
      }
      res.send({ originalUrl: url.originalUrl, shortCode: url.shortCode, accessCount: url.accessCount });
    })
    .catch(() => {
      res.status(500).send('Error retrieving statistics');
    });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
