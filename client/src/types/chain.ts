export interface Model {
  id: string;
  name: string;
}

export interface ChainItem {
  model: Model | undefined;
  animationState: 'add' | 'delete' | 'idle';
}
