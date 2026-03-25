import Test from "../models/test.model.js";
import TestAttempt from "../models/test_attempt.model.js";
import Section from "../models/section.model.js";
import SectionQuestion from "../models/section_question.model.js";
import Question from "../models/question.model.js";
import Answer from "../models/answer.model.js";
import { calculateScore } from "../utils/calculateScore.js";


/**
 * @desc    List all tests with optional filters
 * @route   GET /api/tests
 * @query   category (maps to exam_type), difficulty, status
 * @access  Protected
 */
export const listTests = async (req, res) => {
    try {
        const { category, difficulty, status, page = 1, limit = 10 } = req.query;

        // ============================================
        // 1. BUILD FILTER OBJECT
        // ============================================
        const filter = {};

        if (category) {
            filter.exam_type = { $regex: new RegExp(category, "i") };  // i -> case insensitive search
        }

        if (difficulty) {
            filter.difficulty = difficulty.toUpperCase();
        }

        if (status) {
            filter.status = status.toUpperCase();
        }

        // ============================================
        // 2. QUERY WITH PAGINATION
        // ============================================
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [tests, total] = await Promise.all([
            Test.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Test.countDocuments(filter)
        ]);

        // ============================================
        // 3. RETURN RESPONSE
        // ============================================
        return res.status(200).json({
            success: true,
            data: {
                tests,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            },
            message: "Tests retrieved successfully"
        });

    } catch (error) {
        console.error("List Tests Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to retrieve tests"
            }
        });
    }
};


/**
 * @desc    Start an exam session — creates an attempt and returns questions WITHOUT correct answers
 * @route   GET /api/tests/:id/start
 * @access  Protected + Premium guard
 */
export const startTest = async (req, res) => {
    try {
        // req.test is pre-loaded by checkPremium middleware
        const test = req.test;

        // ============================================
        // 1. CHECK FOR EXISTING IN_PROGRESS ATTEMPT
        // ============================================
        const existingAttempt = await TestAttempt.findOne({
            user_id: req.user._id,
            test_id: test._id,
            status: "IN_PROGRESS"
        });

        if (existingAttempt) {
            // If an active attempt exists and hasn't expired, resume it
            if (new Date() < existingAttempt.expires_at) {
                // Fetch questions for the existing attempt (same flow as below)
                const sections = await Section.find({ test_id: test._id })
                    .sort({ display_order: 1 });

                const sectionIds = sections.map(s => s._id);
                const sectionQuestions = await SectionQuestion.find({ section_id: { $in: sectionIds } })
                    .sort({ question_order: 1 })
                    .populate({
                        path: "question_id",
                        select: "-correct_option -explanation"  // NEVER expose answers
                    });

                // Group questions by section
                const sectionsWithQuestions = sections.map(section => ({
                    _id: section._id,
                    name: section.name,
                    display_order: section.display_order,
                    questions: sectionQuestions
                        .filter(sq => sq.section_id.toString() === section._id.toString())
                        .map(sq => ({
                            _id: sq.question_id._id,
                            question_order: sq.question_order,
                            ...sq.question_id.toObject()
                        }))
                }));

                return res.status(200).json({
                    success: true,
                    data: {
                        attempt: {
                            _id: existingAttempt._id,
                            started_at: existingAttempt.started_at,
                            expires_at: existingAttempt.expires_at,
                            status: existingAttempt.status
                        },
                        test: {
                            _id: test._id,
                            title: test.title,
                            duration_minutes: test.duration_minutes,
                            exam_type: test.exam_type
                        },
                        sections: sectionsWithQuestions
                    },
                    message: "Resuming existing attempt"
                });
            } else {
                // Expired attempt — mark it as EXPIRED
                existingAttempt.status = "EXPIRED";
                await existingAttempt.save();
            }
        }

        // ============================================
        // 2. CREATE NEW ATTEMPT
        // ============================================
        const now = new Date();
        const expiresAt = new Date(now.getTime() + test.duration_minutes * 60 * 1000);

        const attempt = new TestAttempt({
            user_id: req.user._id,
            test_id: test._id,
            started_at: now,
            expires_at: expiresAt,
            status: "IN_PROGRESS"
        });

        await attempt.save();

        // Increment attempted_count on the test
        await Test.findByIdAndUpdate(test._id, { $inc: { attempted_count: 1 } });

        // ============================================
        // 3. FETCH SECTIONS & QUESTIONS (WITHOUT ANSWERS)
        // ============================================
        const sections = await Section.find({ test_id: test._id })
            .sort({ display_order: 1 });

        const sectionIds = sections.map(s => s._id);
        const sectionQuestions = await SectionQuestion.find({ section_id: { $in: sectionIds } })
            .sort({ question_order: 1 })
            .populate({
                path: "question_id",
                select: "-correct_option -explanation"  // NEVER expose answers
            });

        // Group questions by section
        const sectionsWithQuestions = sections.map(section => ({
            _id: section._id,
            name: section.name,
            display_order: section.display_order,
            questions: sectionQuestions
                .filter(sq => sq.section_id.toString() === section._id.toString())
                .map(sq => ({
                    _id: sq.question_id._id,
                    question_order: sq.question_order,
                    ...sq.question_id.toObject()
                }))
        }));

        // ============================================
        // 4. RETURN RESPONSE
        // ============================================
        return res.status(201).json({
            success: true,
            data: {
                attempt: {
                    _id: attempt._id,
                    started_at: attempt.started_at,
                    expires_at: attempt.expires_at,
                    status: attempt.status
                },
                test: {
                    _id: test._id,
                    title: test.title,
                    duration_minutes: test.duration_minutes,
                    exam_type: test.exam_type
                },
                sections: sectionsWithQuestions
            },
            message: "Test session started"
        });

    } catch (error) {
        console.error("Start Test Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to start test session"
            }
        });
    }
};


/**
 * @desc    Submit all answers — server validates timer and calculates score
 * @route   POST /api/tests/:id/submit
 * @body    { attemptId, answers: [{ question_id, selected_option }] }
 * @access  Protected
 */
export const submitTest = async (req, res) => {
    try {
        const { attemptId, answers } = req.body;

        // ============================================
        // 1. VALIDATE INPUT
        // ============================================
        if (!attemptId || !answers || !Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "attemptId and answers array are required"
                }
            });
        }

        // ============================================
        // 2. FIND & VALIDATE ATTEMPT
        // ============================================
        const attempt = await TestAttempt.findById(attemptId);

        if (!attempt) {
            return res.status(404).json({
                success: false,
                error: {
                    code: "ATTEMPT_NOT_FOUND",
                    message: "Test attempt not found"
                }
            });
        }

        // Ownership check
        if (attempt.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: {
                    code: "ACCESS_DENIED",
                    message: "This attempt does not belong to you"
                }
            });
        }

        // Status check
        if (attempt.status !== "IN_PROGRESS") {
            return res.status(400).json({
                success: false,
                error: {
                    code: "ATTEMPT_CLOSED",
                    message: `This attempt has already been ${attempt.status.toLowerCase()}`
                }
            });
        }

        // ============================================
        // 3. SERVER-SIDE TIMER VALIDATION
        // ============================================
        if (new Date() > attempt.expires_at) {
            attempt.status = "EXPIRED";
            await attempt.save();

            return res.status(400).json({
                success: false,
                error: {
                    code: "TIME_EXPIRED",
                    message: "Test session has expired. Submission rejected."
                }
            });
        }

        // ============================================
        // 4. FETCH QUESTIONS FOR SCORE CALCULATION
        // ============================================
        const questionIds = answers.map(a => a.question_id);
        const questions = await Question.find({ _id: { $in: questionIds } });

        // Build a map for O(1) lookups
        const questionMap = new Map();
        for (const q of questions) {
            questionMap.set(q._id.toString(), q);
        }

        // ============================================
        // 5. CALCULATE SCORE (via utility)
        // ============================================
        const { score, correct, incorrect, skipped, answerDetails } = calculateScore(answers, questionMap);

        // ============================================
        // 6. BULK-CREATE ANSWER DOCUMENTS
        // ============================================
        const answerDocs = answerDetails.map(detail => ({
            attempt_id: attempt._id,
            question_id: detail.question_id,
            selected_option: detail.selected_option,
            is_correct: detail.is_correct
        }));

        await Answer.insertMany(answerDocs);

        // ============================================
        // 7. UPDATE ATTEMPT STATUS & SCORE
        // ============================================
        attempt.status = "SUBMITTED";
        attempt.submitted_at = new Date();
        attempt.final_score = score;
        await attempt.save();

        // ============================================
        // 8. RETURN RESPONSE
        // ============================================
        return res.status(200).json({
            success: true,
            data: {
                attemptId: attempt._id,
                final_score: score,
                summary: {
                    total: answers.length,
                    correct,
                    incorrect,
                    skipped
                }
            },
            message: "Test submitted successfully"
        });

    } catch (error) {
        console.error("Submit Test Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to submit test"
            }
        });
    }
};


/**
 * @desc    Fetch full result — correct answers and explanations revealed post-submission
 * @route   GET /api/tests/:id/result/:attemptId
 * @access  Protected
 */
export const getResult = async (req, res) => {
    try {
        const { attemptId } = req.params;

        // ============================================
        // 1. FIND & VALIDATE ATTEMPT
        // ============================================
        const attempt = await TestAttempt.findById(attemptId).populate({
            path: "test_id",
            select: "title exam_type duration_minutes"
        });

        if (!attempt) {
            return res.status(404).json({
                success: false,
                error: {
                    code: "ATTEMPT_NOT_FOUND",
                    message: "Test attempt not found"
                }
            });
        }

        // Ownership check
        if (attempt.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: {
                    code: "ACCESS_DENIED",
                    message: "This attempt does not belong to you"
                }
            });
        }

        // Must be submitted before revealing answers
        if (attempt.status !== "SUBMITTED") {
            return res.status(400).json({
                success: false,
                error: {
                    code: "NOT_SUBMITTED",
                    message: "Results are only available after submission"
                }
            });
        }

        // ============================================
        // 2. FETCH ANSWERS WITH FULL QUESTION DETAILS
        // ============================================
        const answers = await Answer.find({ attempt_id: attempt._id })
            .populate({
                path: "question_id",
                select: "text option_a option_b option_c option_d correct_option explanation marks negative_marks subject"
            });

        // ============================================
        // 3. BUILD RESULT SUMMARY
        // ============================================
        const total = answers.length;
        const correct = answers.filter(a => a.is_correct).length;
        const incorrect = answers.filter(a => !a.is_correct && a.selected_option !== null).length;
        const skipped = answers.filter(a => a.selected_option === null).length;

        // ============================================
        // 4. RETURN RESPONSE
        // ============================================
        return res.status(200).json({
            success: true,
            data: {
                attempt: {
                    _id: attempt._id,
                    started_at: attempt.started_at,
                    submitted_at: attempt.submitted_at,
                    final_score: attempt.final_score,
                    status: attempt.status
                },
                test: attempt.test_id,
                summary: {
                    total,
                    correct,
                    incorrect,
                    skipped
                },
                answers: answers.map(a => ({
                    _id: a._id,
                    selected_option: a.selected_option,
                    is_correct: a.is_correct,
                    question: a.question_id
                }))
            },
            message: "Result retrieved successfully"
        });

    } catch (error) {
        console.error("Get Result Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to retrieve result"
            }
        });
    }
};
