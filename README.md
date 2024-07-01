
# Video with Bounding Box Highlighting using React

This project is a web application built with React, designed to display a video with dynamic bounding boxes highlighting specific objects or celebrities at given timestamps. The example focuses on highlighting appearances of Jeff Bezos using data from AWS Rekognition.

## Features

- **Dynamic Bounding Boxes**: Draws bounding boxes around detected celebrities or objects in the video.
- **Canvas Overlay**: Uses HTML5 Canvas to draw bounding boxes on top of the video element.
- **Timestamp-Based Highlighting**: Bounding boxes appear based on the video's current timestamp.
- **Resizable Bounding Boxes**: Option to change the size of the bounding boxes through buttons.

## Prerequisites

- Node.js (version 12 or higher)
- npm or yarn

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/mohamedkonatepro/video-boundingboxr.git
   cd video-boundingbox
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

## Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

- `public/`: Static files including video files and rekognition.json.
- `src/`: Application source code.

### Main Component

#### `src/components/VideoWithBoundingBox.tsx`

This is the main component that handles the video playback and drawing of bounding boxes.

### How It Works

1. **Fetch Rekognition Data**: On component mount, fetch the rekognition data from a local JSON file (`rekognition.json`).
2. **Filter Celebrities**: Filter the data to find appearances of Jeff Bezos and store the timestamps and bounding box data in the component state.
3. **Handle Video Time Update**: On each time update of the video, check if there's a corresponding bounding box for the current timestamp and draw it on the canvas.
4. **Draw Bounding Box**: Draw the bounding box on the canvas, ensuring it stays within the video frame.
5. **Resize Bounding Box**: Buttons allow resizing the bounding box dynamically.
