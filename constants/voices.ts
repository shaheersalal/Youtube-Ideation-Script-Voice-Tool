import { VoiceOption } from '../types';

export const MALE_VOICES: VoiceOption[] = [
  { id: '1',  name: 'Charon', gender: 'male', voiceName: 'Charon' },
  { id: '2',  name: 'Fenrir', gender: 'male', voiceName: 'Fenrir' },
  { id: '3',  name: 'Kore',   gender: 'male', voiceName: 'Kore'   },
  { id: '4',  name: 'Puck',   gender: 'male', voiceName: 'Puck'   },
  { id: '5',  name: 'Zephyr', gender: 'male', voiceName: 'Zephyr' },
];

export const FEMALE_VOICES: VoiceOption[] = [
  { id: 'f1', name: 'Aria', gender: 'female', voiceName: 'Kore'   },
  { id: 'f2', name: 'Luna', gender: 'female', voiceName: 'Puck'   },
  { id: 'f3', name: 'Nova', gender: 'female', voiceName: 'Zephyr' },
  { id: 'f4', name: 'Lyra', gender: 'female', voiceName: 'Charon' },
  { id: 'f5', name: 'Iris', gender: 'female', voiceName: 'Fenrir' },
];
