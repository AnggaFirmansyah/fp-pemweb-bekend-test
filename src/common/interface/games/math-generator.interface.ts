export interface IMathGeneratorSettings {
  // Tambahkan 'random'
  operation: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'random';
  difficulty: 'easy' | 'medium' | 'hard'; // Ganti min/max dengan difficulty
  theme: string; // Tambahkan theme
  question_count: number;
}

export interface IMathGeneratorJson {
  settings: IMathGeneratorSettings;
  score_per_question: number;
  questions: IMathQuestion[];
}

// Sesuaikan field dengan Frontend (Question interface)
export interface IMathQuestion {
  question: string;      // Sebelumnya question_text
  answer: number;        // Sebelumnya correct_answer (string) -> jadi number
  options: number[];     // Sebelumnya string[] -> jadi number[]
}