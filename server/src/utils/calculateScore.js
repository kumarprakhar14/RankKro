/**
 * @desc Calculate the final score for a test submission
 * 
 * For each answer:
 *   - Correct   → +question.marks
 *   - Incorrect → −question.negative_marks
 *   - Skipped   → 0
 * 
 * @param {Array} answers - Array of { question_id, selected_option } from the client
 * @param {Map|Object} questionMap - Map of questionId → question document
 * @returns {{ score: number, correct: number, incorrect: number, skipped: number, answerDetails: Array }}
 */
export const calculateScore = (answers, questionMap) => {
    let score = 0;
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;
    const answerDetails = [];

    for (const answer of answers) {
        const question = questionMap.get(answer.question_id.toString());

        if (!question) continue; // safety guard

        const selectedOption = answer.selected_option;

        if (selectedOption === null || selectedOption === undefined) {
            // Skipped question
            skipped++;
            answerDetails.push({
                question_id: question._id,
                selected_option: null,
                is_correct: false
            });
        } else if (selectedOption === question.correct_option) {
            // Correct answer
            score += question.marks;
            correct++;
            answerDetails.push({
                question_id: question._id,
                selected_option: selectedOption,
                is_correct: true
            });
        } else {
            // Incorrect answer
            score -= question.negative_marks;
            incorrect++;
            answerDetails.push({
                question_id: question._id,
                selected_option: selectedOption,
                is_correct: false
            });
        }
    }

    return { score, correct, incorrect, skipped, answerDetails };
};
