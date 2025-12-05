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
  private static readonly SLUG = 'math-generator';

  static async createGame(data: ICreateMathGenerator, user_id: string) {
    const exist = await prisma.games.findUnique({ where: { name: data.name } });
    if (exist) throw new ErrorResponse(StatusCodes.BAD_REQUEST, 'Game name already exists');

    const template = await prisma.gameTemplates.findUnique({
      where: { slug: this.SLUG },
    });
    if (!template) throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Template Math Generator not found');

    const generatedQuestions = this.generateQuestions(
      data.question_count,
      data.min_range,
      data.max_range,
      {
        add: data.allow_addition,
        sub: data.allow_subtraction,
        mul: data.allow_multiplication,
        div: data.allow_division,
      }
    );

    const newGameId = v4();
    let thumbnailPath = '';
    if (data.thumbnail_image) {
      thumbnailPath = await FileManager.upload(`game/math/${newGameId}`, data.thumbnail_image);
    }

    const gameJson: IMathGeneratorJson = {
      config: {
        question_count: data.question_count,
        min_range: data.min_range,
        max_range: data.max_range,
        allow_addition: data.allow_addition,
        allow_subtraction: data.allow_subtraction,
        allow_multiplication: data.allow_multiplication,
        allow_division: data.allow_division,
      },
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

  private static generateQuestions(
    count: number,
    min: number,
    max: number,
    ops: { add: boolean; sub: boolean; mul: boolean; div: boolean }
  ): IMathQuestion[] {
    const questions: IMathQuestion[] = [];
    const activeOps: string[] = [];
    if (ops.add) activeOps.push('+');
    if (ops.sub) activeOps.push('-');
    if (ops.mul) activeOps.push('x');
    if (ops.div) activeOps.push(':');

    if (activeOps.length === 0) activeOps.push('+');

    for (let i = 0; i < count; i++) {
      const operator = activeOps[Math.floor(Math.random() * activeOps.length)];
      let num1 = 0; 
      let num2 = 0; 
      let result = 0;

      switch (operator) {
        case '+':
          num1 = this.randomInt(min, max);
          num2 = this.randomInt(min, max);
          result = num1 + num2;
          break;
        case '-':
          num1 = this.randomInt(min, max);
          num2 = this.randomInt(min, num1);
          result = num1 - num2;
          break;
        case 'x':
          num1 = this.randomInt(min, Math.max(12, Math.floor(max / 2))); 
          num2 = this.randomInt(min, 12);
          result = num1 * num2;
          break;
        case ':':
          num2 = this.randomInt(2, 12);
          result = this.randomInt(min, max);
          num1 = num2 * result;
          break;
      }

      const options = new Set<number>();
      options.add(result);
      let safetyCounter = 0;
      while (options.size < 4 && safetyCounter < 50) {
        const offset = this.randomInt(-10, 10);
        const distractor = result + offset;
        if (distractor >= 0 && distractor !== result) options.add(distractor);
        safetyCounter++;
      }

      questions.push({
        question_text: `${num1} ${operator} ${num2} = ?`,
        correct_answer: result.toString(),
        options: Array.from(options).sort(() => Math.random() - 0.5).map(String),
      });
    }
    return questions;
  }

  private static randomInt(min: number, max: number) {
    if (min > max) return min;
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

    const cleanQuestions = json.questions.map((q, index) => ({
      index,
      question_text: q.question_text,
      options: q.options,
    }));

    return {
      id: game.id,
      name: game.name,
      description: game.description,
      questions: cleanQuestions,
    };
  }

  // --- PERBAIKAN UTAMA ADA DI SINI ---
  static async checkAnswer(game_id: string, data: ICheckMathAnswer) {
    const game = await prisma.games.findUnique({
      where: { id: game_id },
    });

    if (!game) throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Game not found');

    const json = game.game_json as unknown as IMathGeneratorJson;
    
    let correctCount = 0;
    
    // Kita berikan tipe eksplisit pada parameter 'ans' agar TypeScript tidak bingung
    const results = data.answers.map((ans: { question_index: number; selected_answer: string }) => {
      const actualQuestion = json.questions[ans.question_index];
      
      if (!actualQuestion) {
        return {
          question_index: ans.question_index,
          is_correct: false,
          correct_answer: 'Invalid Question',
        };
      }

      const isCorrect = actualQuestion.correct_answer === ans.selected_answer;
      if (isCorrect) correctCount++;

      return {
        question_index: ans.question_index,
        is_correct: isCorrect,
        correct_answer: actualQuestion.correct_answer, 
      };
    });

    const score = (correctCount / json.questions.length) * 100;

    return {
      score,
      correct_count: correctCount,
      total_questions: json.questions.length,
      results,
    };
  }
}