import { mkdirSync, copyFileSync, writeFileSync } from 'fs';
import { pathsConfig } from './videoOperations';
import { join } from 'path';

export const copyFileEventHandler = (event, filePath, name) => {
  try {
    mkdirSync(pathsConfig.inputPath, { recursive: true });

    const inputVideoPath = join(pathsConfig.inputPath, name);

    copyFileSync(filePath, inputVideoPath);
    event.sender.send('app-local-video-path', inputVideoPath);
  } catch (error) {
    console.error(error);
  }
};

export const writeInsideFile = (segmentsPath) => {
  const fileContent = segmentsPath.map(({ name }) => `file '${name}'`);

  const filePath = join(pathsConfig.partsPath, 'file.txt');
  writeFileSync(filePath, fileContent.join('\n'));
};
