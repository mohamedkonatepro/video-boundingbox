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
    BoundingBox: BoundingBox;
  };
}

interface RekognitionData {
  Labels: Label[];
  Celebrities: Celebrity[];
}

const VideoCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
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

  const handleGenerateVideo = async () => {
    try {
      const formattedTimestamps = timestamps.map((item, index) => {
        const nextTimestamp = index < timestamps.length - 1 ? timestamps[index + 1].timestamp : item.timestamp;
        return {
            start: item.timestamp,
            end: nextTimestamp,
            boundingBox: item.boundingBox
        };
    });
    console.log(formattedTimestamps)
      const response = await fetch('/api/generate_video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },      
        body: JSON.stringify({ timestamps: formattedTimestamps, videoFileName: 'bezos_vogels.mp4' }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate video');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'jeff_bezos_cropped.mp4';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating video:', error);
    }
  };

  return (
    <div>
      <video ref={videoRef} controls>
        <source src="/bezos_vogels.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <button onClick={handleGenerateVideo}>Generate Cropped Video</button>
    </div>
  );
};

export default VideoCapture;
