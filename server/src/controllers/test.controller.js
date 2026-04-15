import mongoose from "mongoose";
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
 * @query   category (maps to examType), difficulty, status
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
            const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.examType = { $regex: new RegExp(escapeRegex(category), "i") };  // i -> case insensitive search
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
        const parsedPage = parseInt(page, 10) || 1;
        const parsedLimit = parseInt(limit, 10) || 10;
        
        const MAX_LIMIT = 100;
        const safePage = Math.max(1, parsedPage);
        const safeLimit = Math.min(MAX_LIMIT, Math.max(1, parsedLimit));

        const skip = (safePage - 1) * safeLimit;

        const [tests, total] = await Promise.all([
            Test.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(safeLimit),
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
                    page: safePage,
                    limit: safeLimit,
                    total,
                    totalPages: Math.ceil(total / safeLimit)
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
        // 1 & 2. ATOMIC START ATTEMPT TRANSACTION
        // ============================================
        const session = await mongoose.startSession();
        session.startTransaction();

        let attempt;
        try {
            const now = new Date();
            const expiresAt = new Date(now.getTime() + test.durationMinutes * 60 * 1000);

            // 1. Clean up any expired attempts for this user+test
            await TestAttempt.updateMany(
                { userId: req.user._id, testId: test._id, status: "IN_PROGRESS", expiresAt: { $lte: now } },
                { $set: { status: "EXPIRED" } },
                { session }
            );

            // 2. Atomic find-or-create active attempt
            attempt = await TestAttempt.findOneAndUpdate(
                {
                    userId: req.user._id,
                    testId: test._id,
                    status: "IN_PROGRESS",
                    expiresAt: { $gt: now }
                },
                {
                    $setOnInsert: {
                        userId: req.user._id,
                        testId: test._id,
                        startedAt: now,
                        expiresAt: expiresAt,
                        status: "IN_PROGRESS"
                    }
                },
                { new: true, upsert: true, session }
            );

            // If startedAt exactly matches our `now` object, we just created it.
            const isNewAttempt = attempt.startedAt.getTime() === now.getTime();

            if (isNewAttempt) {
                await Test.findByIdAndUpdate(test._id, { $inc: { attemptedCount: 1 } }, { session });
            }

            await session.commitTransaction();
            session.endSession();
        } catch (txnError) {
            await session.abortTransaction();
            session.endSession();
            throw txnError;
        }

        // ============================================
        // 3. FETCH SECTIONS & QUESTIONS (WITHOUT ANSWERS)
        // ============================================
        const sections = await Section.find({ testId: test._id })
            .sort({ display_order: 1 })
            .lean();

        const sectionIds = sections.map(s => s._id.toString());
        const sectionQuestions = await SectionQuestion.find({ sectionId: { $in: sectionIds } })
            .sort({ questionOrder: 1 })
            .populate({
                path: "questionId",
                select: "-correctOption -explanation"  // NEVER expose answers
            })
            .lean();

        // Group questions by section
        const sectionsWithQuestions = sections.map(section => ({
            _id: section._id,
            name: section.name,
            display_order: section.display_order,
            questions: sectionQuestions
                .filter(sq => sq.sectionId.toString() === section._id.toString())
                .map(sq => ({
                    _id: sq.questionId._id,
                    questionOrder: sq.questionOrder,
                    ...sq.questionId
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
                    startedAt: attempt.startedAt,
                    expiresAt: attempt.expiresAt,
                    status: attempt.status
                },
                test: {
                    _id: test._id,
                    title: test.title,
                    durationMinutes: test.durationMinutes,
                    examType: test.examType
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
 * @body    { attemptId, answers: [{ questionId, selectedOption }] }
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
        if (attempt.userId.toString() !== req.user._id.toString()) {
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
        if (new Date() > attempt.expiresAt) {
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
        // 4. FETCH AND VALIDATE QUESTIONS
        // ============================================
        const sections = await Section.find({ testId: attempt.testId });
        const sectionIds = sections.map(s => s._id.toString());
        const validSectionQs = await SectionQuestion.find({ sectionId: { $in: sectionIds } });
        const validQuestionIds = new Set(validSectionQs.map(sq => sq.questionId.toString()));

        for (const ans of answers) {
            if (!validQuestionIds.has(ans.questionId)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "INVALID_QUESTIONS",
                        message: `Submitted question ID ${ans.questionId} does not belong to this test.`
                    }
                });
            }
        }

        // Check for duplicate submitted answers for the same question
        const submittedSet = new Set(answers.map(a => a.questionId));
        if (submittedSet.size !== answers.length) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "INVALID_QUESTIONS",
                    message: "Duplicate answers detected for a single question."
                }
            });
        }

        const questionIds = Array.from(submittedSet);
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
        // 6. ATOMIC TRANSACTION FOR SUBMISSION
        // ============================================
        const submitSession = await mongoose.startSession();
        submitSession.startTransaction();

        try {
            // Compare & Set logic: Check status again during update
            const updatedAttempt = await TestAttempt.findOneAndUpdate(
                { _id: attempt._id, status: "IN_PROGRESS" },
                {
                    $set: {
                        status: "SUBMITTED",
                        submittedAt: new Date(),
                        finalScore: score
                    }
                },
                { session: submitSession, new: true }
            );

            if (!updatedAttempt) {
                await submitSession.abortTransaction();
                submitSession.endSession();
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "ATTEMPT_CLOSED",
                        message: "This attempt has already been submitted or expired."
                    }
                });
            }

            const answerDocs = answerDetails.map(detail => ({
                attemptId: attempt._id,
                questionId: detail.questionId,
                selectedOption: detail.selectedOption,
                isCorrect: detail.isCorrect
            }));

            await Answer.insertMany(answerDocs, { session: submitSession });

            await submitSession.commitTransaction();
            submitSession.endSession();
        } catch (txnError) {
            await submitSession.abortTransaction();
            submitSession.endSession();
            throw txnError;
        }

        // ============================================
        // 8. RETURN RESPONSE
        // ============================================
        return res.status(200).json({
            success: true,
            data: {
                attemptId: attempt._id,
                finalScore: score,
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
            path: "testId",
            select: "title examType durationMinutes"
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
        if (attempt.userId.toString() !== req.user._id.toString()) {
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
        const answers = await Answer.find({ attemptId: attempt._id })
            .populate({
                path: "questionId",
                select: "text option_a option_b option_c option_d correctOption explanation marks negativeMarks subject"
            });

        // ============================================
        // 3. BUILD RESULT SUMMARY
        // ============================================
        const total = answers.length;
        const correct = answers.filter(a => a.isCorrect).length;
        const incorrect = answers.filter(a => !a.isCorrect && a.selectedOption !== null).length;
        const skipped = answers.filter(a => a.selectedOption === null).length;

        // ============================================
        // 4. RETURN RESPONSE
        // ============================================
        return res.status(200).json({
            success: true,
            data: {
                attempt: {
                    _id: attempt._id,
                    startedAt: attempt.startedAt,
                    submittedAt: attempt.submittedAt,
                    finalScore: attempt.finalScore,
                    status: attempt.status
                },
                test: attempt.testId,
                summary: {
                    total,
                    correct,
                    incorrect,
                    skipped
                },
                answers: answers.map(a => ({
                    _id: a._id,
                    selectedOption: a.selectedOption,
                    isCorrect: a.isCorrect,
                    question: a.questionId
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
