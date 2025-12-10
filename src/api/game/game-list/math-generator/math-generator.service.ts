import { type Prisma, type ROLE } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { v4 } from 'uuid';

import {
  ErrorResponse,
  type IMathGeneratorJson,
  type IMathQuestion,
  prisma,
} from '@/common'; // Ini akan error jika langkah no 1 belum dilakukan
import { FileManager } from '@/utils';

import { type ICheckMathAnswer, type ICreateMathGenerator } from './schema';

export abstract class MathGeneratorService {
  // Pastikan slug ini SAMA PERSIS dengan di database (game-templates.data.csv)
  private static readonly SLUG = 'math-generator';

  static async createGame(data: ICreateMathGenerator, user_id: string) {
    // Cek nama game unik
    const exist = await prisma.games.findUnique({ where: { name: data.name } });
    if (exist) throw new ErrorResponse(StatusCodes.BAD_REQUEST, 'Game name already exists');

    // Ambil Template ID
    const template = await prisma.gameTemplates.findUnique({
      where: { slug: this.SLUG },
    });
    if (!template) throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Template Math Generator not found. Did you run seed?');

    // Generate Soal
    const generatedQuestions = this.generateQuestions(
      data.operation,
      data.min_number,
      data.max_number,
      data.question_count
    );

    const newGameId = v4();
    let thumbnailPath = '';
    
    // Upload gambar jika ada
    if (data.thumbnail_image) {
      thumbnailPath = await FileManager.upload(`game/math/${newGameId}`, data.thumbnail_image);
    }

    // Susun JSON Config
    const gameJson: IMathGeneratorJson = {
      settings: {
        operation: data.operation,
        min_number: data.min_number,
        max_number: data.max_number,
        question_count: data.question_count,
      },
      score_per_question: data.score_per_question,
      questions: generatedQuestions,
    };

    // Simpan ke DB
    return await prisma.games.create({
      data: {
        id: newGameId,
        name: data.name,
        description: data.description,
        thumbnail_image: thumbnailPath,
        is_published: data.is_publish_immediately,
        creator_id: user_id,
        game_template_id: template.id,
        game_json: gameJson as unknown as Prisma.InputJsonValue,
      },
      select: { id: true },
    });
  }

  static async getGamePlay(game_id: string, is_public: boolean, user_id?: string, role?: ROLE) {
    const game = await prisma.games.findUnique({
      where: { id: game_id },
      include: { game_template: true },
    });

    if (!game || game.game_template.slug !== this.SLUG) {
      throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Game not found');
    }

    if (is_public && !game.is_published) {
      throw new ErrorResponse(StatusCodes.FORBIDDEN, 'Game is not published');
    }

    if (!is_public && role !== 'SUPER_ADMIN' && game.creator_id !== user_id) {
      throw new ErrorResponse(StatusCodes.FORBIDDEN, 'Access denied');
    }

    // Casting JSON
    const json = game.game_json as unknown as IMathGeneratorJson;

    // Mapping agar frontend mudah menampilkan (index & text)
    const cleanQuestions = json.questions.map((q, index) => ({
      index,
      question_text: q.question_text,
      options: q.options,
    }));

    return {
      id: game.id,
      name: game.name,
      description: game.description,
      thumbnail_image: game.thumbnail_image,
      score_per_question: json.score_per_question,
      settings: json.settings,
      questions: cleanQuestions,
    };
  }

  static async checkAnswer(game_id: string, data: ICheckMathAnswer) {
    const game = await prisma.games.findUnique({
      where: { id: game_id },
    });

    if (!game) throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Game not found');

    const json = game.game_json as unknown as IMathGeneratorJson;
    let correctCount = 0;
    
    const results = data.answers.map((ans) => {
      const actualQuestion = json.questions[ans.question_index];
      
      if (!actualQuestion) {
        return {
          question_index: ans.question_index,
          is_correct: false,
          correct_answer: 'Invalid Index',
        };
      }

      // Logic: Bandingkan string jawaban yang dipilih dengan kunci jawaban
      const isCorrect = actualQuestion.correct_answer === ans.selected_answer;
      if (isCorrect) correctCount++;

      return {
        question_index: ans.question_index,
        is_correct: isCorrect,
        correct_answer: actualQuestion.correct_answer, 
      };
    });

    const maxScore = json.questions.length * json.score_per_question;
    const score = json.questions.length > 0 ? (correctCount / json.questions.length) * 100 : 0;

    return {
      score: Math.round(score * 100) / 100,
      correct_count: correctCount,
      total_questions: json.questions.length,
      max_score: maxScore,
      results,
    };
  }

  // --- Helper Logic Generator (Sama dengan Frontend) ---
  private static generateQuestions(
    operation: 'addition' | 'subtraction' | 'multiplication' | 'division',
    min: number,
    max: number,
    count: number
  ): IMathQuestion[] {
    const questions: IMathQuestion[] = [];

    for (let i = 0; i < count; i++) {
      let num1 = this.randomInt(min, max);
      let num2 = this.randomInt(min, max);
      let answer = 0;
      let display = '';

      switch (operation) {
        case 'addition':
          answer = num1 + num2;
          display = `${num1} + ${num2}`;
          break;
        case 'subtraction':
          if (num1 < num2) [num1, num2] = [num2, num1]; // Swap biar positif
          answer = num1 - num2;
          display = `${num1} - ${num2}`;
          break;
        case 'multiplication':
          answer = num1 * num2;
          display = `${num1} × ${num2}`;
          break;
        case 'division':
          // Agar hasil pembagian bulat: num1 = num2 * result
          answer = num2; // Kita jadikan num2 sebagai jawaban
          num1 = num2 * this.randomInt(min, max); // num1 kita sesuaikan
          display = `${num1} ÷ ${num2}`;
          break;
      }

      // Generate Distractors (Pengecoh)
      const options = new Set<string>();
      options.add(answer.toString());
      
      let safety = 0;
      while (options.size < 4 && safety < 50) {
        const offset = this.randomInt(1, 10) * (Math.random() < 0.5 ? 1 : -1);
        const wrong = answer + offset;
        // Pastikan tidak negatif dan tidak duplikat
        if (wrong >= 0 && wrong !== answer) options.add(wrong.toString());
        safety++;
      }
      
      // Fallback jika loop macet
      while(options.size < 4) options.add((this.randomInt(0, max + 20) + options.size).toString());

      // Shuffle options
      const optionsArray = Array.from(options).sort(() => Math.random() - 0.5);

      questions.push({
        question_text: `${display} = ?`,
        correct_answer: answer.toString(),
        options: optionsArray,
      });
    }
    return questions;
  }

  private static randomInt(min: number, max: number) {
    if (min > max) return min;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}