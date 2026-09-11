/**
 * Web Audio API Synthesizer for high-BMI warning beeps, alerts, and camera shutter sounds.
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Plays a distinct high-BMI warning beep sequence (e.g. repeated warning pulses).
   * @param severity 'moderate' | 'high' | 'critical'
   * @param volume 0.0 to 1.0
   */
  public playWarningBeep(severity: 'moderate' | 'high' | 'critical' = 'moderate', volume: number = 0.8): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(Math.min(Math.max(volume, 0), 1), now);
      masterGain.connect(ctx.destination);

      let pulses = 2;
      let freq1 = 880; // A5
      let freq2 = 1174.66; // D6
      let duration = 0.12;
      let gap = 0.08;

      if (severity === 'high') {
        pulses = 3;
        freq1 = 987.77; // B5
        freq2 = 1318.51; // E6
        duration = 0.14;
        gap = 0.07;
      } else if (severity === 'critical') {
        pulses = 4;
        freq1 = 1046.50; // C6
        freq2 = 1396.91; // F6
        duration = 0.15;
        gap = 0.06;
      }

      for (let i = 0; i < pulses; i++) {
        const startTime = now + i * (duration + gap);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Sawtooth or square for warning tone
        osc.type = severity === 'critical' ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq1, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq2, startTime + duration * 0.7);

        // Envelope
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.8, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);
      }
    } catch (err) {
      console.warn('AudioContext playback error:', err);
    }
  }

  /**
   * Plays a pleasant chime when BMI is in the healthy/normal range.
   */
  public playSuccessChime(volume: number = 0.5): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, now);
      masterGain.connect(ctx.destination);

      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const startTime = now + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.4, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch (err) {
      console.warn('Audio error:', err);
    }
  }

  /**
   * Plays a mechanical camera shutter sound for snapshot capture.
   */
  public playShutterSound(volume: number = 0.6): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // 1. Click pulse
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);

      gain.gain.setValueAtTime(volume * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);

      // 2. White noise burst for the shutter click
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(volume * 0.4, now + 0.02);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      // Low pass filter to make it sound mechanical
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2500, now);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now + 0.02);
      noise.stop(now + 0.1);
    } catch (err) {
      console.warn('Audio shutter error:', err);
    }
  }

  /**
   * Countdown tick sound (for 3s, 2s, 1s).
   */
  public playCountdownTick(volume: number = 0.5): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);

      gain.gain.setValueAtTime(volume * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch (err) {
      console.warn('Countdown audio error:', err);
    }
  }
}

export const soundSynthesizer = new SoundSynthesizer();
