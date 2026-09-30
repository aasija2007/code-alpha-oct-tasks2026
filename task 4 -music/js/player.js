/**
 * Aurora Music Player - Audio Engine (Web Audio API & HTMLAudioElement)
 * Handles audio graph, equalizer filters, visualizer analyzer node, playback rate, crossfading, synthetic audio fallback, and Media Session API.
 */

class AudioEngine {
  constructor() {
    this.audio = new Audio();
    this.audio.crossOrigin = "anonymous";
    this.audioContext = null;
    this.sourceNode = null;
    this.analyserNode = null;
    this.gainNode = null;
    
    // 3-Band Equalizer BiquadFilter Nodes
    this.eqBass = null;
    this.eqMid = null;
    this.eqTreble = null;

    // State Flags
    this.isInitializedNode = false;
    this.isPlaying = false;
    this.isSynthMode = false;
    this.synthInterval = null;
    this.playbackRate = 1.0;

    // Sleep Timer state
    this.sleepTimerId = null;
    this.sleepTimeRemaining = 0;

    // Callbacks for UI updates
    this.onTimeUpdate = null;
    this.onEnded = null;
    this.onError = null;
    this.onStateChange = null;

    this._bindEvents();
  }

  _bindEvents() {
    this.audio.addEventListener('timeupdate', () => {
      if (this.onTimeUpdate && !this.isSynthMode) {
        this.onTimeUpdate(this.audio.currentTime, this.audio.duration || 0);
      }
    });

    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      if (this.onEnded) this.onEnded();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('HTMLAudioElement stream error occurred. Activating Web Audio Synth Engine:', e);
      if (this.onError) this.onError(e);
    });
  }

  initAudioContext() {
    if (this.isInitializedNode) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();

      // Create Web Audio nodes
      this.sourceNode = this.audioContext.createMediaElementSource(this.audio);
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.8;

      this.gainNode = this.audioContext.createGain();

      // Equalizer Nodes (Bass: 100Hz, Mid: 1000Hz, Treble: 4000Hz)
      this.eqBass = this.audioContext.createBiquadFilter();
      this.eqBass.type = 'lowshelf';
      this.eqBass.frequency.value = 100;

      this.eqMid = this.audioContext.createBiquadFilter();
      this.eqMid.type = 'peaking';
      this.eqMid.frequency.value = 1000;
      this.eqMid.Q.value = 1.0;

      this.eqTreble = this.audioContext.createBiquadFilter();
      this.eqTreble.type = 'highshelf';
      this.eqTreble.frequency.value = 4000;

      // Connect Audio Graph Pipeline:
      // Source -> Bass -> Mid -> Treble -> Gain -> Analyser -> Destination
      this.sourceNode.connect(this.eqBass);
      this.eqBass.connect(this.eqMid);
      this.eqMid.connect(this.eqTreble);
      this.eqTreble.connect(this.gainNode);
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioContext.destination);

      this.isInitializedNode = true;
    } catch (err) {
      console.error('Failed to initialize AudioContext:', err);
    }
  }

  async playTrack(track, startTime = 0) {
    this.initAudioContext();

    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.stopSynth();
    this.audio.src = track.audioUrl;
    this.audio.currentTime = startTime;
    this.audio.playbackRate = this.playbackRate;

    try {
      await this.audio.play();
      this.isPlaying = true;
      this.isSynthMode = false;
      this._updateMediaSession(track);
    } catch (err) {
      console.warn('Primary audio stream playback blocked or failed. Activating Web Audio Synth Engine:', err);
      this.startSynthMode(track);
    }

    if (this.onStateChange) this.onStateChange(this.isPlaying);
  }

  // Synthetic Web Audio Melodic Arpeggiator Fallback Engine
  startSynthMode(track) {
    this.stopSynth();
    this.isSynthMode = true;
    this.isPlaying = true;
    let synthTime = 0;
    const freqs = track.syntheticFreq || [261.63, 329.63, 392.00, 523.25];
    let noteIdx = 0;

    const intervalMs = Math.max(150, 400 / this.playbackRate);

    this.synthInterval = setInterval(() => {
      if (!this.isPlaying || !this.audioContext) return;

      synthTime += (0.4 * this.playbackRate);
      if (this.onTimeUpdate) {
        this.onTimeUpdate(synthTime, track.duration || 180);
      }

      if (synthTime >= (track.duration || 180)) {
        this.pause();
        if (this.onEnded) this.onEnded();
        return;
      }

      // Generate a pleasant melodic note matching song frequencies
      try {
        const osc = this.audioContext.createOscillator();
        const oscGain = this.audioContext.createGain();

        // Alternate waveforms based on song language/genre for distinct texture
        if (track.lang === 'ta') osc.type = 'sine'; // Flute-like Carnatic warm tone
        else if (track.lang === 'hi') osc.type = 'triangle'; // Acoustic string resonance
        else osc.type = 'sawtooth'; // Modern synthwave

        osc.frequency.setValueAtTime(freqs[noteIdx % freqs.length], this.audioContext.currentTime);
        noteIdx++;

        oscGain.gain.setValueAtTime(0.12, this.audioContext.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + (0.4 / this.playbackRate));

        osc.connect(oscGain);
        oscGain.connect(this.analyserNode || this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + (0.45 / this.playbackRate));
      } catch (e) {
        // quiet catch
      }
    }, intervalMs);

    if (this.onStateChange) this.onStateChange(true);
  }

  stopSynth() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.isSynthMode = false;
  }

  play() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    if (this.isSynthMode) {
      this.isPlaying = true;
    } else {
      this.audio.play().then(() => {
        this.isPlaying = true;
      }).catch(err => {
        console.warn('Play attempt failed:', err);
      });
    }

    if (this.onStateChange) this.onStateChange(true);
  }

  pause() {
    this.isPlaying = false;
    if (!this.isSynthMode) {
      this.audio.pause();
    }
    if (this.onStateChange) this.onStateChange(false);
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  seek(seconds) {
    if (!this.isSynthMode) {
      this.audio.currentTime = seconds;
    }
  }

  setVolume(level) {
    this.audio.volume = Math.max(0, Math.min(1, level));
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.audio.volume, this.audioContext ? this.audioContext.currentTime : 0);
    }
  }

  setPlaybackRate(rate) {
    this.playbackRate = rate;
    this.audio.playbackRate = rate;
  }

  setEqualizerGains(bassGain, midGain, trebleGain) {
    if (this.eqBass) this.eqBass.gain.value = bassGain;
    if (this.eqMid) this.eqMid.gain.value = midGain;
    if (this.eqTreble) this.eqTreble.gain.value = trebleGain;
  }

  // Crossfade between track transitions
  crossfade(callback, duration = 800) {
    if (!this.gainNode || !this.audioContext) {
      callback();
      return;
    }

    const currentVol = this.gainNode.gain.value;
    const steps = 15;
    const interval = duration / steps;
    let step = 0;

    const fadeOut = setInterval(() => {
      step++;
      const val = currentVol * (1 - step / steps);
      this.gainNode.gain.setValueAtTime(Math.max(0, val), this.audioContext.currentTime);

      if (step >= steps) {
        clearInterval(fadeOut);
        callback(); // Switch track
        // Fade back in
        let stepIn = 0;
        const fadeIn = setInterval(() => {
          stepIn++;
          const valIn = currentVol * (stepIn / steps);
          this.gainNode.gain.setValueAtTime(valIn, this.audioContext.currentTime);
          if (stepIn >= steps) clearInterval(fadeIn);
        }, interval);
      }
    }, interval);
  }

  // Sleep Timer functionality
  setSleepTimer(minutes, onTimeTick, onExpire) {
    this.clearSleepTimer();

    if (minutes <= 0) return;

    this.sleepTimeRemaining = minutes * 60;
    this.sleepTimerId = setInterval(() => {
      this.sleepTimeRemaining--;

      if (onTimeTick) onTimeTick(this.sleepTimeRemaining);

      if (this.sleepTimeRemaining <= 0) {
        this.clearSleepTimer();
        this.crossfade(() => {
          this.pause();
          if (onExpire) onExpire();
        }, 1500);
      }
    }, 1000);
  }

  clearSleepTimer() {
    if (this.sleepTimerId) {
      clearInterval(this.sleepTimerId);
      this.sleepTimerId = null;
    }
    this.sleepTimeRemaining = 0;
  }

  // Media Session API Integration
  _updateMediaSession(track) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: [
          { src: track.cover, sizes: '300x300', type: 'image/svg+xml' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => this.play());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime) this.seek(details.seekTime);
      });
    }
  }
}
