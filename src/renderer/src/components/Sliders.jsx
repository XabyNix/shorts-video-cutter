import { useEffect, useState } from 'react';
import Slider from 'rc-slider';
import { ProgressBar } from 'react-loader-spinner';
import 'rc-slider/assets/index.css';
import '../assets/main.css';

const Sliders = ({ videoRef, sourcePath }) => {
  const [markers, setMarkers] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const video = videoRef.current;

  useEffect(() => {
    const onTimeUpdate = (newCurrentTime) => {
      setCurrentTime(newCurrentTime.target.currentTime);
    };

    window.electron.ipcRenderer.on('done', () => {
      setIsProcessing(false);
      setDone(true);
    });

    video.addEventListener('timeupdate', onTimeUpdate);
    return () => video.removeEventListener('timeupdate', onTimeUpdate);
  }, []);

  const handleAddMarker = () => {
    setMarkers((prev) => [...prev, currentTime, currentTime + 1]);
  };
  const handleRemoveMarker = () => {
    setMarkers((prev) => {
      if (prev.length > 0) {
        const temp = [...prev];
        temp.pop();
        temp.pop();
        return temp;
      } else {
        return prev;
      }
    });
  };

  const changeMarkers = (newMarkersValue) => {
    setMarkers(newMarkersValue);
  };

  const handleOnPause = () => {
    video.paused ? video.play() : video.pause();
  };

  const handleOnSliderChangeValue = (newTime) => {
    video.currentTime = newTime;
  };

  return (
    <>
      <button type="button" onClick={handleOnPause}>
        Play/Pause
      </button>
      <div id="sliders">
        <Slider
          className="videoControls"
          max={video.duration}
          step={0.2}
          value={currentTime}
          onChange={handleOnSliderChangeValue}
        />

        <Slider
          className="selectedParts"
          range
          max={video.duration}
          value={markers}
          step={0.2}
          onChange={changeMarkers}
        />
      </div>
      <div>
        <button type="button" onClick={handleRemoveMarker}>
          Remove
        </button>
        <button type="button" onClick={handleAddMarker}>
          Add
        </button>
      </div>

      <button
        id="cutButton"
        className={done ? 'done' : ''}
        type="button"
        disabled={!!done}
        onClick={() => {
          setIsProcessing(true);
          window.electron.ipcRenderer.send('cut-video', sourcePath, markers);
        }}
      >
        {done ? 'Done' : 'Cut'}
      </button>

      <ProgressBar wrapperClass={'loading-bar'} visible={isProcessing} />
    </>
  );
};

export default Sliders;
