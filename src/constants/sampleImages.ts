import happyImg from '../assets/images/sample_happy_person_1790785249208.jpg';
import surprisedImg from '../assets/images/sample_surprised_person_1790785262432.jpg';
import neutralImg from '../assets/images/sample_neutral_person_1790785273164.jpg';
import groupImg from '../assets/images/sample_group_faces_1790785286856.jpg';

export interface SampleImageItem {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  expectedEmotion?: string;
  expectedFaces: number;
}

export const SAMPLE_IMAGES: SampleImageItem[] = [
  {
    id: 'sample-happy',
    name: 'Joyful Expression (Happy)',
    category: 'Single Face',
    description: 'Genuine smile with cheek elevation and eye crinkle.',
    url: happyImg,
    expectedEmotion: 'Happy',
    expectedFaces: 1
  },
  {
    id: 'sample-surprised',
    name: 'Surprised Expression',
    category: 'Single Face',
    description: 'High curved eyebrows, wide eye opening, dropped jaw.',
    url: surprisedImg,
    expectedEmotion: 'Surprise',
    expectedFaces: 1
  },
  {
    id: 'sample-neutral',
    name: 'Neutral Baseline',
    category: 'Single Face',
    description: 'Relaxed facial musculature at resting baseline.',
    url: neutralImg,
    expectedEmotion: 'Neutral',
    expectedFaces: 1
  },
  {
    id: 'sample-group',
    name: 'Multi-Face Group Photo',
    category: 'Batch / Multi-Face',
    description: 'Multiple faces in a single frame to test multi-face detection.',
    url: groupImg,
    expectedEmotion: 'Mixed (Happy/Neutral)',
    expectedFaces: 3
  }
];
