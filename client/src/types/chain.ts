export enum MediaType {
  Text = 'text',
  Audio = 'audio',
  Video = 'video',
  Image = 'image',
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  inputType: MediaType;
  outputType: MediaType;
}

export interface ChainItem {
  model: Model | null;
  animationState: 'add' | 'delete' | 'idle';
}

export interface ChainWithId {
  id: number;
  items: ChainItem[];
}
