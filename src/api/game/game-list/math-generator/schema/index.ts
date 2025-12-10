export * from './create-math.schema';
export * from './check-answer.schema';
// Kita reuse CheckAnswer dari Quiz karena strukturnya sama (array of answers)
export { CheckAnswerSchema, type ICheckAnswer } from '../../quiz/schema/check-answer.schema';