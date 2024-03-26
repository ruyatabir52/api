const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');



const app = express();
const port = 3003;
require('dotenv').config();

const url = process.env.API_URL;

const swearWords = [url , '<a class=\"tag-entry-link\" href=\"/Ruya-Tabirleri\" title=\"Rüya Tabirleri\">Rüyada</a>'];

function censorSwearWords(text) {
  const lowerCaseText = text.toLowerCase();
  for (const swearWord of swearWords) {
    const regex = new RegExp(`\\b${swearWord}\\b`, 'gi');
    text = text.replace(regex, '');
  }

  return text;
}

app.get('/api/list', async (req, res) => {
  try {
    const letter = req.query.letter;
    const page = req.query.page;
    const urlTemplate = `${url}rüya-tabirleri-sözlüğü-${letter}-page-${page}`;
    const response = await axios.get(urlTemplate);
    const html = response.data;
    const $ = cheerio.load(html);

    const links = $('.post-box-title a');
    const interpretations = [];
    const pagination = $('.pagination #tie-next-page').prev('.page');
    const lastIndex = pagination.text();
    const lastPageNumber = pagination.eq(lastIndex).text();

    links.each((index, element) => {
      const href = $(element).attr('href');
      const href2 = censorSwearWords(href);
      const text = $(element).text().trim().replace(/(<([^>]+)>)/gi, '');
      interpretations.push({ link: href2, name: text });
    });

    res.json({ items: interpretations, pagination: lastIndex });
  } catch (error) {
    res.status(500).json({ error: 'Veri çekme hatası' });
  }
});

app.get('/detail', async (req, res) => {
  try {
    const slug = req.query.slug;
    const urlTemplate = `${url}${slug}`;
    const response = await axios.get(urlTemplate);
    const html = response.data;
    const $ = cheerio.load(html);

    const links = $('.post-box-title a');
    const interpretations = [];
    const title = $('.post-title span').text();
    const desc_query = $('.entry p').html();
    const desc = censorSwearWords(desc_query);
    interpretations.push({ title: title, description: desc });

    res.json({ detail: interpretations });
  } catch (error) {
    res.status(500).json({ error: 'Veri çekme hatası' });
  }
});




app.listen(port, () => {
  console.log(`API server ${port} portunda çalışıyor`);
});
