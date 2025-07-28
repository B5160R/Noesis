export async function createAudioAnalyzer() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContext();

  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;

  // Use microphone input
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  // Returns the raw frequency data array (values 0-255)
  function getFrequencyData() {
    analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  // Returns average volume normalized [0,1]
  function getAverageVolume() {
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
    return sum / dataArray.length / 255;
  }

  return { getFrequencyData, getAverageVolume };
}
