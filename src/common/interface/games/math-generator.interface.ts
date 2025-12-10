export interface IMathGeneratorSettings {
  operation: 'addition' | 'subtraction' | 'multiplication' | 'division';
  min_number: number;
  max_number: number;
  question_count: number;
}

export interface IMathGeneratorJson {
  settings: IMathGeneratorSettings;
  score_per_question: number;
  questions: IMathQuestion[];
}

export interface IMathQuestion {
  question_text: string;
  options: string[];
  correct_answer: string;
}