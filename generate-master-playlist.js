import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = fs.existsSync(path.join(__dirname, 'dist')) ? path.join(__dirname, 'dist') : path.join(__dirname, 'public');
const outputFilePath = path.join(baseDir, 'songs-master.json');
const songFilePattern = /^songs-.*\.json$/;

console.log('Starting master playlist generation...');
console.log(`Searching for song files in: ${baseDir}`);

try {
  const files = fs.readdirSync(baseDir);
  const songFiles = files.filter(file => songFilePattern.test(file) && file !== 'songs-master.json');

  if (songFiles.length === 0) {
    console.log('No song files found to process.');
    process.exit(0);
  }

  console.log(`Found ${songFiles.length} song files:`, songFiles);

  let allSongs = [];
  const songIds = new Set();

  for (const file of songFiles) {
    const filePath = path.join(baseDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const songs = JSON.parse(content);

      for (const song of songs) {
        if (!songIds.has(song.id)) {
          allSongs.push(song);
          songIds.add(song.id);
        }
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }

  fs.writeFileSync(outputFilePath, JSON.stringify(allSongs, null, 2), 'utf-8');
  console.log(`Successfully generated ${outputFilePath} with ${allSongs.length} unique songs.`);

} catch (error) {
  console.error('An error occurred during master playlist generation:', error);
}