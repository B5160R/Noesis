export function getFrequencyBands(data) {
  const bassEnd = Math.floor(data.length * 0.15);
  const midEnd = Math.floor(data.length * 0.5);

  let bass = 0,
    mid = 0,
    treble = 0;

  for (let i = 0; i < bassEnd; i++) bass += data[i];
  for (let i = bassEnd; i < midEnd; i++) mid += data[i];
  for (let i = midEnd; i < data.length; i++) treble += data[i];

  bass /= bassEnd;
  mid /= midEnd - bassEnd;
  treble /= data.length - midEnd;

  return {
    bass: bass / 255,
    mid: mid / 255,
    treble: treble / 255,
  };
}
