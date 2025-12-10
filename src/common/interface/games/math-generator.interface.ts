export interface IMathGeneratorJson {
  settings: {
    operation: 'addition' | 'subtraction' | 'multiplication' | 'division';
    min_number: number;
    max_number: number;
    question_count: number;
  };
  questions: IMathQuestion[];
  score_per_question: number; // Simpan score config juga
}

export interface IMathQuestion {
  question_text: string;
  options: string[];
  correct_answer: string;
}