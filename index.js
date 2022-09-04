const express = require('express');

const app = express();
const scraper = require('./api/scraper');

app.use(express.json({ extended: false }));

app.use('/api/scraper', scraper);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server is running in port ${PORT}`));
