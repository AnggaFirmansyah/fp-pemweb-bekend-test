export interface IMathGeneratorJson {
  config: {
    question_count: number;
    allow_addition: boolean;
    allow_subtraction: boolean;
    allow_multiplication: boolean;
    allow_division: boolean;
    min_range: number;
    max_range: number;
  };
  questions: IMathQuestion[];
}

export interface IMathQuestion {
  question_text: string;
  options: string[]; // Pilihan jawaban (misal A, B, C, D)
  correct_answer: string; // Jawaban benar
}