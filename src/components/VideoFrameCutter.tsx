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

const VideoFrameCutter: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timestamps, setTimestamps] = useState<{ timestamp: number, boundingBox: BoundingBox }[]>([]);

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

    context.strokeStyle = 'red';
    context.lineWidth = 2;
    context.strokeRect(
      boundingBox.Left * width,
      boundingBox.Top * height,
      boundingBox.Width * width,
      boundingBox.Height * height
    );
  };

  const centerOnBoundingBox = (boundingBox: BoundingBox) => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const videoContainer = video.parentElement;
    if (!videoContainer) return;

    const containerWidth = videoContainer.clientWidth;
    const containerHeight = videoContainer.clientHeight;

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    const boxCenterX = (boundingBox.Left + boundingBox.Width / 2) * videoWidth;
    const boxCenterY = (boundingBox.Top + boundingBox.Height / 2) * videoHeight;

    const offsetX = boxCenterX - containerWidth / 2;
    const offsetY = boxCenterY - containerHeight / 2;

    video.style.transform = `translate(-${offsetX}px, -${offsetY}px) scale(1)`;
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const currentTime = videoRef.current.currentTime;
    const currentTimestamp = timestamps.find(
      ts => Math.abs(ts.timestamp - currentTime) < 0.5
    );

    if (currentTimestamp) {
      drawBoundingBox(currentTimestamp.boundingBox);
      centerOnBoundingBox(currentTimestamp.boundingBox);
    } else {
      if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context) context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
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
  }, [timestamps]);

  return (
    <div className='relative flex flex-col items-center justify-center' style={{ overflow: 'hidden' }}>
      <video ref={videoRef} controls>
        <source src="/bezos_vogels.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <canvas ref={canvasRef} className='absolute top-0 left-0' />
    </div>
  );
};

export default VideoFrameCutter;
