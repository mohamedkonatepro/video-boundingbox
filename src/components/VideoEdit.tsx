import { useEffect, useRef, useState } from 'react';

interface BoundingBox {
  Width: number;
  Height: number;
  Left: number;
  Top: number;
}

interface LabelInstance {
  BoundingBox: BoundingBox;
  Confidence: number;
}

interface Label {
  Timestamp: number;
  Label: {
    Name: string;
    Instances: LabelInstance[];
  };
}

interface Celebrity {
  Timestamp: number;
  Celebrity: {
    Name: string;
  };
}

interface RekognitionData {
  Labels: Label[];
  Celebrities: Celebrity[];
}

const VideoEdit: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [boundingBox, setBoundingBox] = useState<BoundingBox | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/rekognition.json');
        const data: RekognitionData = await response.json();

        // console.log(data.Labels, data.Celebrities)
        const requiredLabels = [
          'Adult', 'Male', 'Man', 'Face',
          'Clothing', 'Formal Wear', 'Suit', 'Shirt'
        ];

        const findMatchingTimestamp = (labels: Label[]): number | null => {
          const timestamps: { [key: number]: Set<string> } = {};

          labels.forEach((label) => {
            if (!timestamps[label.Timestamp]) {
              timestamps[label.Timestamp] = new Set();
            }
            timestamps[label.Timestamp].add(label.Label.Name);
          });

          let matchTime: number | null = null;

          for (const [time, labelsSet] of Object.entries(timestamps)) {
            const timeNum = parseInt(time);
            if (requiredLabels.every(label => labelsSet.has(label))) {
              matchTime = timeNum;
              break;
            }
          }

          return matchTime;
        };

        const matchTimestamp = findMatchingTimestamp(data.Labels);

        if (matchTimestamp !== null) {
          const closestCelebrity = data.Celebrities.reduce((prev, curr) => {
            return (Math.abs(curr.Timestamp - matchTimestamp) < Math.abs(prev.Timestamp - matchTimestamp) ? curr : prev);
          });

          if (closestCelebrity.Celebrity.Name === 'Jeff Bezos') {
            setTimestamp(closestCelebrity.Timestamp / 1000);
          } else {
            setTimestamp(matchTimestamp / 1000);
          }

          const manLabel = data.Labels.find(label => label.Label.Name === 'Man' && label.Timestamp === matchTimestamp);
          if (manLabel && manLabel.Label.Instances && manLabel.Label.Instances.length > 0) {
            setBoundingBox(manLabel.Label.Instances[0].BoundingBox);
          }
        }
      } catch (error) {
        console.error('Error fetching JSON:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && timestamp !== null && boundingBox !== null) {
      const context = canvas.getContext('2d');
      if (context) {
        video.currentTime = timestamp;

        video.onseeked = () => {
          if (boundingBox) {
            const { Width, Height, Left, Top } = boundingBox;

            const cropX = video.videoWidth * Left;
            const cropY = video.videoHeight * Top;
            const cropWidth = video.videoWidth * Width;
            const cropHeight = video.videoHeight * Height;

            canvas.width = cropWidth;
            canvas.height = cropHeight;

            context.drawImage(video, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
          }
        };
      }
    }
  }, [timestamp, boundingBox]);

  return (
    <div>
      <video ref={videoRef} controls>
        <source src="/bezos_vogels.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default VideoEdit;
