import { AudioHTMLAttributes, createRef, useEffect, useRef, useState } from 'react'
import vad from "voice-activity-detection"
import reactLogo from './assets/react.svg'
import './App.css'
import './activityStyles.css'
import WaveSurfer from 'wavesurfer.js'
import WebAudio from 'wavesurfer.js/src/webaudio.js'

function App() {
  let i = 0
  const options = {
    fftSize: 1024,
    bufferLen: 1024,
    smoothingTimeConstant: 0.2,
    minCaptureFreq: 85,         // in Hz
    maxCaptureFreq: 255,        // in Hz
    noiseCaptureDuration: 0, // in ms
    minNoiseLevel: 0.3,         // from 0 to 1
    maxNoiseLevel: 0.7,         // from 0 to 1
    avgNoiseMultiplier: 1.2,
    onVoiceStart: function () {
      setActivity('active')
    },
    onVoiceStop: function () {
      setActivity('inactive')
    },
    onUpdate: function (val: any) {
      console.log(i);
      
    }
  }
  const [mediaStream, setMediaStream] = useState(new MediaStream())
  const [activity, setActivity] = useState("baseline")
  const [recording, setRecording] = useState(false)
  const [audioProcess, setAudioProcess] = useState({})
  const [wavesurfer, initWavesurfer] = useState({})


  useEffect(() => {
    initWavesurfer(WaveSurfer.create({
      container: '#waveform',
      waveColor: 'violet',
      progressColor: 'purple'
  }));
  }, [])




  const handleMediaStream = async () => {
    try {
      if (!recording) {
        const audioContext = new AudioContext()
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const audioProcess = vad(audioContext, stream, options)
        setMediaStream(stream)
        setAudioProcess(audioProcess)
        setRecording(prev => !prev)
      } else {
        audioProcess.destroy()
        mediaStream.removeTrack(mediaStream.getAudioTracks()[0])
        setRecording(prev => !prev)
        setActivity('baseline')
      }
    }
    catch (err) {
      console.error(err);

    }

  }





  const fileInput = useRef(null)

  interface SyntheticEvent<T> {
    target: EventTarget & T;
  }


  const readInput = async () => {
    const file = fileInput.current.files[0]
    const reader = new FileReader()
    reader.addEventListener('load', (e: any/**  SyntheticEvent<HTMLAudioElement>**/) => {
      const url = e.target.result
      const audio = new Audio(url)
      const stream = audio.captureStream()
      audio.play()
      console.log(stream);
      const audioContext  = new AudioContext()
      const audioProcess = vad(audioContext, stream, options)


      
    })
    await reader.readAsDataURL(file)
  }

  return (
    <div className="App">
      <div>
        <input type="file" ref={fileInput} onChange={readInput} />
      </div>
      <div id='waveform'>

      </div>
      <div>
        <button onClick={handleMediaStream}>
          Start recording
        </button>
        <div id="detect-box" className={activity}>
          {activity}
        </div>
      </div>

    </div>
  )
}

export default App
