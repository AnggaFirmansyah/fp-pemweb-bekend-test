export interface IMathGeneratorSettings {
  operation:
    | 'addition'
    | 'subtraction'
    | 'multiplication'
    | 'division'
    | 'random';
  difficulty: 'easy' | 'medium' | 'hard';
  theme: string;
  question_count: number;
}

export interface IMathGeneratorJson {
  settings: IMathGeneratorSettings;
  score_per_question: number;
  questions: IMathQuestion[];
}

export interface IMathQuestion {
  question: string;
  answer: number;
  options: number[];
}
