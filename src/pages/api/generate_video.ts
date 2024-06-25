import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execPromise = promisify(exec);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { timestamps } = req.body;

    const inputVideoPath = path.join(process.cwd(), 'public', 'bezos_vogels.mp4');
    const outputVideoPath = path.join(process.cwd(), 'public', 'jeff_bezos_cropped.mp4');

    // Generate the filter graph for ffmpeg
    const filters = timestamps.map(({ start, end, boundingBox }: any, index: any) => {
      const { Width, Height, Left, Top } = boundingBox;
      const cropWidth = Width * 1280;
      const cropHeight = Height * 720;
      const cropLeft = Left * 1280;
      const cropTop = Top * 720;
      return `[0:v]trim=start=${start}:end=${end},setpts=PTS-STARTPTS,crop=${cropWidth}:${cropHeight}:${cropLeft}:${cropTop},scale=1280:720[v${index}]`;
    }).join('; ');

    const concatInputs = timestamps.map((_: any, index: any) => `[v${index}]`).join('');
    const concatFilter = `${concatInputs}concat=n=${timestamps.length}:v=1:a=0[outv]`;

    const ffmpegCommand = `ffmpeg -i ${inputVideoPath} -filter_complex "${filters}; ${concatFilter}" -map "[outv]" ${outputVideoPath}`;

    console.log('ffmpeg command:', ffmpegCommand);

    // Remove the output file if it exists
    if (fs.existsSync(outputVideoPath)) {
      fs.unlinkSync(outputVideoPath);
    }

    try {
      // Execute the ffmpeg command
      await execPromise(ffmpegCommand);
      console.log('Command executed successfully');

      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', 'attachment; filename="jeff_bezos_cropped.mp4"');

      const fileStream = fs.createReadStream(outputVideoPath);
      fileStream.pipe(res);
    } catch (error) {
      console.error(`Error: ${error}`);
      res.status(500).json({ error: 'Failed to generate video' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};


export default handler;
