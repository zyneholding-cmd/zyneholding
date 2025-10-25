// Professional sound effects for the application
const SOUNDS = {
  click: "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhgCurq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq7///////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAUHAAAAAAAAAOYGfQ==",
  success: "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhgCurq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq7///////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAUHAAAAAAAAAOYGfQ==",
  notification: "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhgCurq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq7///////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAUHAAAAAAAAAOYGfQ==",
};

let audioContext: AudioContext | null = null;
let isMuted = false;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export const playSound = (type: keyof typeof SOUNDS, volume: number = 0.3) => {
  if (isMuted) return;
  
  try {
    const context = getAudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    // Configure different sounds
    switch(type) {
      case 'click':
        oscillator.frequency.setValueAtTime(800, context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, context.currentTime + 0.1);
        gainNode.gain.setValueAtTime(volume, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.1);
        break;
        
      case 'success':
        oscillator.frequency.setValueAtTime(523, context.currentTime);
        oscillator.frequency.setValueAtTime(659, context.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, context.currentTime + 0.2);
        gainNode.gain.setValueAtTime(volume, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.3);
        break;
        
      case 'notification':
        oscillator.frequency.setValueAtTime(880, context.currentTime);
        oscillator.frequency.setValueAtTime(1047, context.currentTime + 0.1);
        gainNode.gain.setValueAtTime(volume, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.2);
        break;
    }
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};

export const toggleMute = () => {
  isMuted = !isMuted;
  return isMuted;
};

export const getMuteState = () => isMuted;
