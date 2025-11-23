export interface Model {
  id: string;
  name: string;
}

export interface ChainItem {
  model: Model | undefined;
  animationState: 'add' | 'delete' | 'idle';
}

export interface ChainWithId {
  id: number;
  items: ChainItem[];
}
