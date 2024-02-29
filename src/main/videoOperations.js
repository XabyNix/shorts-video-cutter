import ffmpeg from 'fluent-ffmpeg';
import { writeInsideFile } from './utils';
import { join, resolve } from 'path';
import ffmpegPath from 'ffmpeg-static';
import ffprobe from 'ffprobe-static';

import fs from 'fs';

ffmpeg()
  .setFfmpegPath(ffmpegPath.replace('app.asar', 'app.asar.unpacked'))
  .setFfprobePath(ffprobe.path.replace('app.asar', 'app.asar.unpacked'));

//Paths of the parts in wich the main video is cutted and then merged together
const segmentsPath = [];

export const pathsConfig = {
  inputPath: resolve('./video_utils/input'),
  outputPath: resolve('./video_utils/output'),
  partsPath: resolve('./video_utils/parts')
};

const cutVideo = (input, outputPath, { start, end }) => {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(input)
      .output(outputPath)
      .setStartTime(start)
      .setDuration(end - start)
      .on('end', () => {
        console.log('Finish cutting!');
        resolve();
      })
      .on('error', (err) => {
        reject('CUT:  ' + err);
      })
      .run();
  });
};

const mergeVideos = () => {
  return new Promise((resolve, reject) => {
    writeInsideFile(segmentsPath);

    ffmpeg()
      .input(join(pathsConfig.partsPath, 'file.txt'))
      .inputOption('-f concat')
      .size('1080x1920')
      .autopad()
      .output(join(pathsConfig.outputPath, 'output.mp4'))
      .on('end', () => {
        console.log('Finish Merging!');
        resolve();
      })
      .on('error', (err) => {
        reject('MERGE:  ' + err);
      })
      .run();
  });
};
const cutAndMerge = async (sourceFilePath, cuts) => {
  //Waiting for video to get cut before merging all parts

  try {
    fs.mkdirSync(pathsConfig.partsPath, { recursive: true });
    await Promise.all(
      cuts.map((cut, index, array) => {
        if (index % 2 === 0) {
          const singleCutPoints = { start: cut, end: array[index + 1] };

          const partFileName = `part_${index}.mp4`;

          const outPath = {
            name: partFileName,
            path: join(pathsConfig.partsPath, partFileName)
          };

          segmentsPath.push(outPath);
          return cutVideo(sourceFilePath, outPath.path, singleCutPoints);
        }
      })
    );
    fs.mkdirSync(pathsConfig.outputPath, { recursive: true });
    await mergeVideos();
  } catch (error) {
    console.log(error);
  }
  return 0;
};

export default cutAndMerge;
