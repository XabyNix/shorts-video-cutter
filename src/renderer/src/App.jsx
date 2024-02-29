import { useEffect, useRef, useState } from 'react';
import Sliders from './components/Sliders';

function App() {
  //const ipcHandle = () => window.electron.ipcRenderer.send('ping')
  const [sourcePath, setSourcePath] = useState('');
  const [videoLoaded, setVideoLoaded] = useState(false);

  const videoRef = useRef(null);

  /* ----DROP EVENTS-----*/
  const handleDragover = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleOnDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const { path, name } = e.dataTransfer.files[0];

    window.electron.ipcRenderer.send('new-video', path, name);
    window.electron.ipcRenderer.on('app-local-video-path', (_, inputVideoPath) => {
      console.log(inputVideoPath);
      setSourcePath(inputVideoPath);
    });
  };

  return (
    <>
      {!sourcePath && (
        <div className="dropzone" onDragOver={handleDragover} onDrop={handleOnDrop}>
          <h1>Drop Here</h1>
        </div>
      )}

      {sourcePath && (
        <>
          <div id="myvideo">
            <video ref={videoRef} onLoadedMetadata={() => setVideoLoaded(true)} muted autoPlay>
              <source src={sourcePath} type="video/mp4" />
            </video>
          </div>
          {videoLoaded && <Sliders videoRef={videoRef} sourcePath={sourcePath} />}
        </>
      )}
    </>
  );
}

export default App;
