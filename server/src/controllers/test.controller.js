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
            const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.exam_type = { $regex: new RegExp(escapeRegex(category), "i") };  // i -> case insensitive search
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
            const expiresAt = new Date(now.getTime() + test.duration_minutes * 60 * 1000);

            // 1. Clean up any expired attempts for this user+test
            await TestAttempt.updateMany(
                { user_id: req.user._id, test_id: test._id, status: "IN_PROGRESS", expires_at: { $lte: now } },
                { $set: { status: "EXPIRED" } },
                { session }
            );

            // 2. Atomic find-or-create active attempt
            attempt = await TestAttempt.findOneAndUpdate(
                {
                    user_id: req.user._id,
                    test_id: test._id,
                    status: "IN_PROGRESS",
                    expires_at: { $gt: now }
                },
                {
                    $setOnInsert: {
                        user_id: req.user._id,
                        test_id: test._id,
                        started_at: now,
                        expires_at: expiresAt,
                        status: "IN_PROGRESS"
                    }
                },
                { new: true, upsert: true, session }
            );

            // If started_at exactly matches our `now` object, we just created it.
            const isNewAttempt = attempt.started_at.getTime() === now.getTime();

            if (isNewAttempt) {
                await Test.findByIdAndUpdate(test._id, { $inc: { attempted_count: 1 } }, { session });
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
        const sectionQuestions = await SectionQuestion.find({ section_id: { $in: sectionIds } })
            .sort({ question_order: 1 })
            .populate({
                path: "question_id",
                select: "-correct_option -explanation"  // NEVER expose answers
            })
            .lean();

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
                    ...sq.question_id
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
        // 4. FETCH AND VALIDATE QUESTIONS
        // ============================================
        const sections = await Section.find({ testId: attempt.test_id });
        const sectionIds = sections.map(s => s._id.toString());
        const validSectionQs = await SectionQuestion.find({ section_id: { $in: sectionIds } });
        const validQuestionIds = new Set(validSectionQs.map(sq => sq.question_id.toString()));

        for (const ans of answers) {
            if (!validQuestionIds.has(ans.question_id)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "INVALID_QUESTIONS",
                        message: `Submitted question ID ${ans.question_id} does not belong to this test.`
                    }
                });
            }
        }

        // Check for duplicate submitted answers for the same question
        const submittedSet = new Set(answers.map(a => a.question_id));
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
                        submitted_at: new Date(),
                        final_score: score
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
                attempt_id: attempt._id,
                question_id: detail.question_id,
                selected_option: detail.selected_option,
                is_correct: detail.is_correct
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
