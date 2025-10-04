const fs = require('fs');
const path = require('path');

const excludeFiles = ['index.html', '404.html'];
const maxExcerptLength = 150;

function getAllHtmlFiles(dir) {
  let results = [];
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllHtmlFiles(filePath));
    } else if (file.endsWith('.html') && !excludeFiles.includes(file)) {
      results.push(filePath);
    }
  }
  return results;
}

function extractPostData(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const titleMatch = content.match(/<h1>(.*?)<\/h1>/i) || content.match(/<title>(.*?)<\/title>/i);
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/i);
  const pMatch = content.match(/<p>(.*?)<\/p>/i);

  const title = titleMatch ? titleMatch[1] : path.basename(filePath, '.html');
  const imgSrc = imgMatch ? imgMatch[1] : null; // skip if null in search
  let excerpt = pMatch ? pMatch[1] : '';
  if (excerpt.length > maxExcerptLength) excerpt = excerpt.substring(0, maxExcerptLength) + '...';

  const url = `https://lisathahanel.github.io/best2topmovies/${path.basename(filePath)}`;

  return { title, url, imgSrc, excerpt };
}

const htmlFiles = getAllHtmlFiles('.');
const posts = htmlFiles.map(extractPostData).filter(p => p.imgSrc); // skip posts without images

fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2), 'utf-8');
console.log(`Generated posts.json with ${posts.length} posts.`);
