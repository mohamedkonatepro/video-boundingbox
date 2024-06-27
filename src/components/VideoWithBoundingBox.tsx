import React, { useEffect, useRef, useState } from 'react';

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
    BoundingBox: BoundingBox;
  };
}

interface RekognitionData {
  Labels: Label[];
  Celebrities: Celebrity[];
}

const VideoWithBoundingBox: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timestamps, setTimestamps] = useState<{ timestamp: number, boundingBox: BoundingBox }[]>([]);
  const [isCanvasVisible, setIsCanvasVisible] = useState(true);
  const [boxSize, setBoxSize] = useState({ width: 700, height: 700 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/rekognition.json');
        const data: RekognitionData = await response.json();

        const jeffBezosAppearances = data.Celebrities.filter(
          celebrity => celebrity.Celebrity.Name === 'Jeff Bezos'
        ).map(celebrity => ({
          timestamp: celebrity.Timestamp / 1000,
          boundingBox: celebrity.Celebrity.BoundingBox
        }));

        setTimestamps(jeffBezosAppearances);
      } catch (error) {
        console.error('Error fetching JSON:', error);
      }
    };

    fetchData();
  }, []);

  const drawBoundingBox = (boundingBox: BoundingBox) => {
    if (!canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const video = videoRef.current;
    const width = video.videoWidth;
    const height = video.videoHeight;

    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);

    context.strokeStyle = 'black';
    context.lineWidth = 1;

    // Calculate dynamic bounding box dimensions
    const boxWidth = boxSize.width;
    const boxHeight = boxSize.height;

    // Ensure the bounding box stays within video frame
    const left = Math.min(Math.max((boundingBox.Left * width) + ((boundingBox.Width * width) / 2) - (boxWidth / 2), 0), width - boxWidth);
    const top = Math.min(Math.max((boundingBox.Top * height) + ((boundingBox.Height * height) / 2) - (boxHeight / 2), 0), height - boxHeight);

    // Draw the bounding box
    context.strokeRect(left, top, boxWidth, boxHeight);

    context.fillStyle = 'rgba(0, 0, 0, 0.9)';
    context.fillRect(0, 0, width, top); // Top rectangle
    context.fillRect(0, top, left, boxHeight); // Left rectangle
    context.fillRect(left + boxWidth, top, width - (left + boxWidth), boxHeight); // Right rectangle
    context.fillRect(0, top + boxHeight, width, height - (top + boxHeight)); // Bottom rectangle
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const currentTime = videoRef.current.currentTime;
    const currentTimestamp = timestamps.find(
      ts => Math.abs(ts.timestamp - currentTime) < 0.5
    );

    if (currentTimestamp) {
      drawBoundingBox(currentTimestamp.boundingBox);
      setIsCanvasVisible(true);
    } else {
      if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context) context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      setIsCanvasVisible(false);
    }
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      return () => {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [timestamps, boxSize]);

  return (
    <div className="overflow-hidden">
      <video ref={videoRef} controls>
        <source src="/bezos_vogels.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {isCanvasVisible && (
        <canvas ref={canvasRef} className='absolute top-0 left-0' style={{ zIndex: 3 }} />
      )}

      <div className="mt-4 flex space-x-4 mb-5 flex justify-center items-center">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setBoxSize({ width: 700, height: 700 })}
        >
          700x700
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => setBoxSize({ width: 810 / 2, height: 1400 / 2 })}
        >
          810x1400
        </button>
      </div>
    </div>
  );
};

export default VideoWithBoundingBox;
