/**
 * Aurora Music Player - Real-time Web Audio API Canvas Visualizer
 * Multiple visual modes: Frequency Bars, Waveform Oscilloscope, Radial Circle, Neon Spectrum
 */

class AudioVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.analyserNode = null;
    this.animFrameId = null;
    this.mode = 'bars'; // 'bars', 'waveform', 'circle', 'neon'
    this.accentColor = '#6366f1';
    this.dominantColor = '#ec4899';
    this.isPlaying = false;

    if (this.canvas) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
  }

  setAnalyser(analyser) {
    this.analyserNode = analyser;
  }

  setMode(mode) {
    this.mode = mode;
  }

  setColors(dominant, accent) {
    this.dominantColor = dominant || '#6366f1';
    this.accentColor = accent || '#ec4899';
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  start() {
    this.isPlaying = true;
    this.render();
  }

  stop() {
    this.isPlaying = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  render() {
    if (!this.isPlaying || !this.ctx || !this.canvas) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    this.ctx.clearRect(0, 0, width, height);

    if (this.analyserNode) {
      const bufferLength = this.analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      if (this.mode === 'waveform') {
        this.analyserNode.getByteTimeDomainData(dataArray);
        this.drawWaveform(dataArray, width, height);
      } else if (this.mode === 'circle') {
        this.analyserNode.getByteFrequencyData(dataArray);
        this.drawCircle(dataArray, width, height);
      } else if (this.mode === 'neon') {
        this.analyserNode.getByteFrequencyData(dataArray);
        this.drawNeon(dataArray, width, height);
      } else {
        // Default: 'bars'
        this.analyserNode.getByteFrequencyData(dataArray);
        this.drawBars(dataArray, width, height);
      }
    } else {
      // Idle idle animated placeholder wave
      this.drawIdleWave(width, height);
    }

    this.animFrameId = requestAnimationFrame(() => this.render());
  }

  // 1. Frequency Spectrum Bars
  drawBars(dataArray, width, height) {
    const barWidth = (width / dataArray.length) * 2.5;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * height * 0.85;

      const grad = this.ctx.createLinearGradient(0, height, 0, 0);
      grad.addColorStop(0, this.dominantColor);
      grad.addColorStop(1, this.accentColor);

      this.ctx.fillStyle = grad;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = this.accentColor;

      this.ctx.beginPath();
      this.ctx.roundRect(x, height - barHeight, barWidth - 2, barHeight, [4, 4, 0, 0]);
      this.ctx.fill();

      x += barWidth;
    }
  }

  // 2. Oscilloscope Waveform
  drawWaveform(dataArray, width, height) {
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = this.accentColor;
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = this.accentColor;

    this.ctx.beginPath();
    const sliceWidth = width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    this.ctx.lineTo(width, height / 2);
    this.ctx.stroke();
  }

  // 3. Radial Pulsating Frequency Ring
  drawCircle(dataArray, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.22;
    const numBars = 64;

    for (let i = 0; i < numBars; i++) {
      const val = dataArray[i % dataArray.length] || 0;
      const barLen = (val / 255) * 80;
      const angle = (i / numBars) * Math.PI * 2;

      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barLen);
      const y2 = centerY + Math.sin(angle) * (radius + barLen);

      this.ctx.strokeStyle = i % 2 === 0 ? this.dominantColor : this.accentColor;
      this.ctx.lineWidth = 4;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = this.accentColor;

      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }
  }

  // 4. Neon Mirrored Spectrum
  drawNeon(dataArray, width, height) {
    const halfWidth = width / 2;
    const barWidth = (halfWidth / dataArray.length) * 3;

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * (height / 2);
      const grad = this.ctx.createLinearGradient(0, 0, width, 0);
      grad.addColorStop(0, this.dominantColor);
      grad.addColorStop(1, this.accentColor);

      this.ctx.fillStyle = grad;

      // Right half
      this.ctx.fillRect(halfWidth + i * barWidth, height / 2 - barHeight / 2, barWidth - 1, barHeight);
      // Left half (mirror)
      this.ctx.fillRect(halfWidth - i * barWidth, height / 2 - barHeight / 2, barWidth - 1, barHeight);
    }
  }

  // Idle fallback animation when audio is paused
  drawIdleWave(width, height) {
    const time = Date.now() * 0.002;
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';

    this.ctx.beginPath();
    for (let x = 0; x < width; x += 5) {
      const y = height / 2 + Math.sin(x * 0.02 + time) * 12;
      if (x === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();
  }
}
