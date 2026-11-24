import { readFileSync } from 'node:fs';

/** PCM WAV duration from header — deterministic, no decode. */
export function readWavDurationSec(filePath: string): number {
  const buf = readFileSync(filePath);
  if (buf.length < 44 || buf.toString('ascii', 0, 4) !== 'RIFF') {
    throw new Error(`Not a RIFF WAV file: ${filePath}`);
  }
  const audioFormat = buf.readUInt16LE(20);
  if (audioFormat !== 1) {
    throw new Error(`Unsupported WAV format (expected PCM): ${filePath}`);
  }
  const numChannels = buf.readUInt16LE(22);
  const sampleRate = buf.readUInt32LE(24);
  const bitsPerSample = buf.readUInt16LE(34);
  let offset = 12;
  let dataSize = 0;
  while (offset + 8 <= buf.length) {
    const chunkId = buf.toString('ascii', offset, offset + 4);
    const chunkSize = buf.readUInt32LE(offset + 4);
    if (chunkId === 'data') {
      dataSize = chunkSize;
      break;
    }
    offset += 8 + chunkSize;
  }
  if (dataSize <= 0 || sampleRate <= 0 || numChannels <= 0) {
    throw new Error(`Could not read WAV data chunk: ${filePath}`);
  }
  const bytesPerSample = bitsPerSample / 8;
  const numSamples = dataSize / (numChannels * bytesPerSample);
  return numSamples / sampleRate;
}