/**
 * @desc Calculate the final score for a test submission
 * 
 * For each answer:
 *   - Correct   → +question.marks
 *   - Incorrect → −question.negativeMarks
 *   - Skipped   → 0
 * 
 * @param {Array} answers - Array of { questionId, selectedOption } from the client
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
        if (!answer.questionId) continue;
        
        const question = questionMap.get(answer.questionId.toString());

        if (!question) continue; // safety guard

        const selectedOption = answer.selectedOption;

        if (selectedOption === null || selectedOption === undefined) {
            // Skipped question
            skipped++;
            answerDetails.push({
                questionId: question._id,
                selectedOption: null,
                isCorrect: false
            });
        } else if (selectedOption === question.correctOption) {
            // Correct answer
            score += question.marks;
            correct++;
            answerDetails.push({
                questionId: question._id,
                selectedOption: selectedOption,
                isCorrect: true
            });
        } else {
            // Incorrect answer
            score -= question.negativeMarks;
            incorrect++;
            answerDetails.push({
                questionId: question._id,
                selectedOption: selectedOption,
                isCorrect: false
            });
        }
    }

    return { score, correct, incorrect, skipped, answerDetails };
};
