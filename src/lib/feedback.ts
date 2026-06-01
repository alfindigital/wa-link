const SOUND_KEY = "wa-pref-sound";
const HAPTIC_KEY = "wa-pref-haptic";

export type FeedbackPrefs = { sound: boolean; haptic: boolean };

export function getPrefs(): FeedbackPrefs {
  if (typeof window === "undefined") return { sound: false, haptic: true };
  try {
    return {
      sound: window.localStorage.getItem(SOUND_KEY) === "1",
      haptic: window.localStorage.getItem(HAPTIC_KEY) !== "0",
    };
  } catch {
    return { sound: false, haptic: true };
  }
}

export function setPref(key: "sound" | "haptic", value: boolean) {
  if (typeof window === "undefined") return;
  try {
    const k = key === "sound" ? SOUND_KEY : HAPTIC_KEY;
    window.localStorage.setItem(k, value ? "1" : "0");
    window.dispatchEvent(new Event("wa-pref-change"));
  } catch {
    /* ignore */
  }
}

export function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined") return;
  if (!getPrefs().haptic) return;
  if (typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore */
    }
  }
}

let _ctx: AudioContext | null = null;
function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (_ctx) return _ctx;
  const AC =
    (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  try {
    _ctx = new AC();
    return _ctx;
  } catch {
    return null;
  }
}

export function playBlip(kind: "success" | "copy") {
  if (!getPrefs().sound) return;
  const ac = ctx();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    const now = ac.currentTime;
    if (kind === "success") {
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(990, now + 0.12);
    } else {
      osc.frequency.setValueAtTime(880, now);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.connect(gain).connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch {
    /* ignore */
  }
}