import { type Prisma, type ROLE } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { v4 } from 'uuid';

import {
  ErrorResponse,
  type IMathGeneratorJson,
  type IMathQuestion,
  prisma,
} from '@/common';
import { FileManager } from '@/utils';

import { type ICheckMathAnswer, type ICreateMathGenerator } from './schema';

export abstract class MathGeneratorService {
  // Pastikan slug ini ada di database (prisma/seeder/data/game-templates.data.csv)
  private static readonly SLUG = 'math-generator';

  static async createGame(data: ICreateMathGenerator, user_id: string) {
    const exist = await prisma.games.findUnique({ where: { name: data.name } });
    if (exist) throw new ErrorResponse(StatusCodes.BAD_REQUEST, 'Game name already exists');

    const template = await prisma.gameTemplates.findUnique({
      where: { slug: this.SLUG },
    });
    if (!template) throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Template Math Generator not found');

    // Generate Soal Server-Side
    const generatedQuestions = this.generateQuestions(
      data.operation,
      data.min_number,
      data.max_number,
      data.question_count
    );

    const newGameId = v4();
    let thumbnailPath = '';
    if (data.thumbnail_image) {
      thumbnailPath = await FileManager.upload(`game/math/${newGameId}`, data.thumbnail_image);
    }

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

    const json = game.game_json as unknown as IMathGeneratorJson;

    // Bersihkan data sensitif (kunci jawaban) sebelum dikirim ke frontend
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

      // Validasi jawaban (string comparison)
      const isCorrect = actualQuestion.correct_answer === ans.selected_answer;
      if (isCorrect) correctCount++;

      return {
        question_index: ans.question_index,
        is_correct: isCorrect,
        correct_answer: actualQuestion.correct_answer, 
      };
    });

    // Hitung skor total
    const totalScore = correctCount * json.score_per_question;
    const maxScore = json.questions.length * json.score_per_question;

    return {
      score: totalScore,
      max_score: maxScore,
      correct_count: correctCount,
      total_questions: json.questions.length,
      results,
    };
  }

  // --- Logic Generator Soal ---
  private static generateQuestions(
    operation: 'addition' | 'subtraction' | 'multiplication' | 'division',
    min: number,
    max: number,
    count: number
  ): IMathQuestion[] {
    const questions: IMathQuestion[] = [];

    for (let i = 0; i < count; i++) {
      let num1 = 0, num2 = 0, result = 0;
      let symbol = '';

      switch (operation) {
        case 'addition':
          num1 = this.randomInt(min, max);
          num2 = this.randomInt(min, max);
          result = num1 + num2;
          symbol = '+';
          break;
        case 'subtraction':
          // Pastikan hasil tidak negatif
          num1 = this.randomInt(min, max);
          num2 = this.randomInt(min, num1);
          result = num1 - num2;
          symbol = '-';
          break;
        case 'multiplication':
          // Batasi angka agar hasil tidak terlalu besar
          const limit = Math.max(min, 12); 
          num1 = this.randomInt(min, limit); 
          num2 = this.randomInt(min, limit);
          result = num1 * num2;
          symbol = '×';
          break;
        case 'division':
          // Logika pembagian bersih (tanpa koma)
          num2 = this.randomInt(2, 10); // Pembagi kecil
          result = this.randomInt(min, max); // Hasil jawaban
          num1 = num2 * result; // Angka yang dibagi
          symbol = '÷';
          break;
      }

      // Generate Pengecoh (Distractors)
      const options = new Set<number>();
      options.add(result);
      
      let attempt = 0;
      while (options.size < 4 && attempt < 20) {
        const offset = this.randomInt(1, 10) * (Math.random() < 0.5 ? 1 : -1);
        const wrong = result + offset;
        if (wrong >= 0 && wrong !== result) options.add(wrong);
        attempt++;
      }
      
      // Fallback jika loop macet
      while(options.size < 4) options.add(this.randomInt(0, max + 20));

      questions.push({
        question_text: `${num1} ${symbol} ${num2}`,
        correct_answer: result.toString(),
        options: Array.from(options).sort(() => Math.random() - 0.5).map(String),
      });
    }
    return questions;
  }

  private static randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}