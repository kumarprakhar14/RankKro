import Question from "../models/question.model.js";
import SectionQuestion from "../models/section_question.model.js";


/**
 * @desc    List all questions with optional filters
 * @route   GET /api/admin/questions
 * @query   subject, search, page, limit
 * @access  Admin
 */
export const listQuestions = async (req, res) => {
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    try {
        const { subject, search, page = 1, limit = 20 } = req.query;

        const filter = {};

        if (subject) {
            filter.subject = { $regex: new RegExp(escapeRegex(subject), "i") };
        }

        if (search) {
            filter.text = { $regex: new RegExp(escapeRegex(search), "i") };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [questions, total] = await Promise.all([
            Question.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Question.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                questions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            },
            message: "Questions retrieved successfully"
        });

    } catch (error) {
        console.error("Admin List Questions Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to retrieve questions"
            }
        });
    }
};


/**
 * @desc    Add a single question
 * @route   POST /api/admin/questions
 * @body    { id, text, option_a, option_b, option_c, option_d, correct_option, explanation, marks, negative_marks, subject }
 * @access  Admin
 */
export const createQuestion = async (req, res) => {
    try {
        const {
            id, text, option_a, option_b, option_c, option_d,
            correct_option, explanation, marks, negative_marks, subject, difficulty
        } = req.body;

        // Basic validation
        if (!id || !text || !option_a || !option_b || !option_c || !option_d || correct_option === undefined || !subject || !difficulty) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Missing required fields: id, text, option_a-d, correct_option, subject, difficulty"
                }
            });
        }

        if (correct_option < 0 || correct_option > 3) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "correct_option must be 0-3 (A=0, B=1, C=2, D=3)"
                }
            });
        }

        const question = new Question({
            _id: id,
            text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option,
            explanation: explanation || "",
            marks: marks || 1,
            negative_marks: negative_marks || 0,
            subject,
            difficulty: difficulty || "Easy"
        });

        await question.save();

        console.log(`Admin created question: ${id}`);

        return res.status(201).json({
            success: true,
            data: { question },
            message: "Question created successfully"
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                error: {
                    code: "DUPLICATE_ERROR",
                    message: "A question with this ID already exists"
                }
            });
        }

        console.error("Admin Create Question Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to create question"
            }
        });
    }
};


/**
 * @desc    Edit an existing question
 * @route   PUT /api/admin/questions/:questionId
 * @body    Any question fields to update
 * @access  Admin
 */
export const updateQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const updates = req.body;

        // Validate correct_option if provided
        if (updates.correct_option !== undefined) {
            if (updates.correct_option < 0 || updates.correct_option > 3) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "correct_option must be 0-3 (A=0, B=1, C=2, D=3)"
                    }
                });
            }
        }

        const question = await Question.findByIdAndUpdate(
            questionId,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!question) {
            return res.status(404).json({
                success: false,
                error: {
                    code: "QUESTION_NOT_FOUND",
                    message: "Question not found"
                }
            });
        }

        console.log(`Admin updated question: ${question.id}`);

        return res.status(200).json({
            success: true,
            data: { question },
            message: "Question updated successfully"
        });

    } catch (error) {
        console.error("Admin Update Question Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to update question"
            }
        });
    }
};
