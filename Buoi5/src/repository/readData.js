import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pathToDataFile = path.join(__dirname, '../../data.json');

export const readData = async () => {
  try {
    const data = await fs.promises.readFile(pathToDataFile, 'utf-8');
    const jsonData = JSON.parse(data);

    return jsonData;
  }
  catch (error) {
    console.error('Error reading data:', error);
    throw error;
  }
}

export const writeData = async (data) => {
  try {
    await fs.promises.writeFile(pathToDataFile, JSON.stringify(data, null, 2), 'utf-8');
  }
  catch (error) {
    console.error('Error writing data:', error);
    throw error;
  }
}
















/*
export const readData = async () => {
  try {
    const data = await fs.promises.readFile(pathToDataFile, 'utf-8');
    const jsonData = JSON.parse(data);
    
    return jsonData;
  } catch (error) {
    console.error('Error reading data:', error);
    throw error;
  }
};
*/