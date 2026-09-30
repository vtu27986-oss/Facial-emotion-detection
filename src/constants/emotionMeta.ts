import { EmotionCategoryMeta, StandardEmotion, RawEmotionKey } from '../types/emotion';

export const EMOTION_META: Record<StandardEmotion, EmotionCategoryMeta> = {
  Happy: {
    name: 'Happy',
    emoji: '😊',
    color: '#10b981', // Emerald / Green
    accentClass: 'bg-emerald-500',
    borderClass: 'border-emerald-500/30',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    muscleMarkers: 'AU6 (Cheek Raiser) + AU12 (Lip Corner Puller / Zygomaticus major)',
    psychologyNotes: 'Genuine Duchenne smile involves contraction of both zygomatic major and orbicularis oculi.'
  },
  Sad: {
    name: 'Sad',
    emoji: '😢',
    color: '#3b82f6', // Blue
    accentClass: 'bg-blue-500',
    borderClass: 'border-blue-500/30',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-400',
    muscleMarkers: 'AU1 (Inner Brow Raiser) + AU4 (Brow Lowerer) + AU15 (Lip Corner Depressor)',
    psychologyNotes: 'Characterized by central forehead creasing and downward pull of the mouth corners.'
  },
  Angry: {
    name: 'Angry',
    emoji: '😠',
    color: '#ef4444', // Red
    accentClass: 'bg-red-500',
    borderClass: 'border-red-500/30',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-400',
    muscleMarkers: 'AU4 (Brow Lowerer / Corrugator) + AU5 (Upper Lid Raiser) + AU23 (Lip Tightener)',
    psychologyNotes: 'Tense ocular aperture with medial depression of eyebrows forming vertical glabella furrows.'
  },
  Fear: {
    name: 'Fear',
    emoji: '😨',
    color: '#a855f7', // Purple
    accentClass: 'bg-purple-500',
    borderClass: 'border-purple-500/30',
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-400',
    muscleMarkers: 'AU1 (Inner Brow) + AU2 (Outer Brow) + AU5 (Upper Lid Raiser) + AU20 (Lip Stretcher)',
    psychologyNotes: 'Widened eyes with sclera exposure above the iris, horizontal tension across lip line.'
  },
  Surprise: {
    name: 'Surprise',
    emoji: '😲',
    color: '#f59e0b', // Amber
    accentClass: 'bg-amber-500',
    borderClass: 'border-amber-500/30',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-400',
    muscleMarkers: 'AU1 (Inner Brow) + AU2 (Outer Brow) + AU5 (Upper Lid Raiser) + AU26 (Jaw Drop)',
    psychologyNotes: 'Briefest universal emotion; high arched eyebrows and sudden mandible relaxation.'
  },
  Disgust: {
    name: 'Disgust',
    emoji: '🤢',
    color: '#84cc16', // Lime
    accentClass: 'bg-lime-500',
    borderClass: 'border-lime-500/30',
    bgClass: 'bg-lime-500/10',
    textClass: 'text-lime-400',
    muscleMarkers: 'AU9 (Nose Wrinkler) + AU10 (Upper Lip Raiser) + AU16 (Lower Lip Depressor)',
    psychologyNotes: 'Nasal bridge wrinkle from levator labii superioris alaeque nasi contraction.'
  },
  Neutral: {
    name: 'Neutral',
    emoji: '😐',
    color: '#94a3b8', // Slate
    accentClass: 'bg-slate-400',
    borderClass: 'border-slate-500/30',
    bgClass: 'bg-slate-500/10',
    textClass: 'text-slate-300',
    muscleMarkers: 'Baseline physiological tonus (No sustained active action units)',
    psychologyNotes: 'Resting state devoid of emotional activation; reference baseline in FER evaluation.'
  }
};

export const RAW_TO_STANDARD_MAP: Record<RawEmotionKey, StandardEmotion> = {
  happy: 'Happy',
  sad: 'Sad',
  angry: 'Angry',
  fearful: 'Fear',
  surprised: 'Surprise',
  disgusted: 'Disgust',
  neutral: 'Neutral'
};

export const STANDARD_EMOTIONS_LIST: StandardEmotion[] = [
  'Happy',
  'Sad',
  'Angry',
  'Fear',
  'Surprise',
  'Disgust',
  'Neutral'
];
