export interface IQuizJson<T = IQuizAnswer> {
  score_per_question: number;
  is_question_randomized: boolean;
  is_answer_randomized: boolean;
  questions: IQuizQuestion<T>[];
}

export interface IQuizQuestion<T> {
  question_text: string;
  question_image: string | null;
  answers: T[];
}

export interface IQuizAnswer {
  answer_text: string;
  is_correct: boolean;
}
