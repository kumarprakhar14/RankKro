import mongoose from "mongoose";
import Test from "../models/test.model.js";
import Section from "../models/section.model.js";
import SectionQuestion from "../models/section_question.model.js";
import Question from "../models/question.model.js";
import TestAttempt from "../models/test_attempt.model.js";
import User from "../models/user.model.js";


/**
 * @desc    List all tests (admin view with section counts)
 * @route   GET /api/admin/tests
 * @query   exam_type, status, page, limit
 * @access  Admin
 */
export const listTests = async (req, res) => {
    try {
        const { exam_type, status, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (exam_type) {
            const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.exam_type = { $regex: new RegExp(escapeRegex(exam_type), "i") };
        }
        if (status) filter.status = status.toUpperCase();

        const parsedPage = parseInt(page, 10) || 1;
        const parsedLimit = parseInt(limit, 10) || 20;

        const MAX_LIMIT = 100;
        const safePage = Math.max(1, parsedPage);
        const safeLimit = Math.min(MAX_LIMIT, Math.max(1, parsedLimit));

        const skip = (safePage - 1) * safeLimit;

        const [tests, total] = await Promise.all([
            Test.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(safeLimit)
                .lean(),
            Test.countDocuments(filter)
        ]);

        // Attach section count to each test
        const testIds = tests.map(t => t._id);
        const sectionCounts = await Section.aggregate([
            { $match: { test_id: { $in: testIds } } },
            { $group: { _id: "$test_id", count: { $sum: 1 } } }
        ]);

        const countMap = {};
        sectionCounts.forEach(s => { countMap[s._id.toString()] = s.count; });

        const testsWithMeta = tests.map(t => ({
            ...t,
            section_count: countMap[t._id.toString()] || 0
        }));

        return res.status(200).json({
            success: true,
            data: {
                tests: testsWithMeta,
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
        console.error("Admin List Tests Error:", error.message);
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
 * @desc    Create a new test with optional sections
 * @route   POST /api/admin/tests
 * @body    { id, title, exam_type, duration_minutes, difficulty, status, is_pyq, sections: [{ name, display_order }] }
 * @access  Admin
 */
export const createTest = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id, title, exam_type, duration_minutes, difficulty, status, is_pyq, sections } = req.body;

        if (!id || !title || !exam_type || !duration_minutes) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Missing required fields: id, title, exam_type, duration_minutes"
                }
            });
        }

        // Create test
        const test = new Test({
            id,
            title,
            exam_type,
            duration_minutes,
            difficulty: difficulty || "MEDIUM",
            status: status || "FREE",
            is_pyq: is_pyq || false
        });

        await test.save({ session });

        // Create sections if provided
        let createdSections = [];
        if (sections && Array.isArray(sections) && sections.length > 0) {
            const sectionDocs = sections.map((s, index) => ({
                test_id: test._id,
                name: s.name,
                display_order: s.display_order !== undefined ? s.display_order : index + 1
            }));
            createdSections = await Section.insertMany(sectionDocs, { session });
        }

        await session.commitTransaction();
        session.endSession();

        console.log(`Admin created test: ${id} with ${createdSections.length} sections`);

        return res.status(201).json({
            success: true,
            data: { test, sections: createdSections },
            message: "Test created successfully"
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                error: {
                    code: "DUPLICATE_ERROR",
                    message: "A test with this ID already exists"
                }
            });
        }

        console.error("Admin Create Test Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to create test"
            }
        });
    }
};


/**
 * @desc    Update test metadata (title, status, PYQ tag, etc.)
 * @route   PUT /api/admin/tests/:testId
 * @body    Any test fields to update
 * @access  Admin
 */
export const updateTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const updates = req.body;

        // Don't allow changing attempted_count via this endpoint
        delete updates.attempted_count;

        const test = await Test.findByIdAndUpdate(
            testId,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!test) {
            return res.status(404).json({
                success: false,
                error: {
                    code: "TEST_NOT_FOUND",
                    message: "Test not found"
                }
            });
        }

        console.log(`Admin updated test: ${test.id}`);

        return res.status(200).json({
            success: true,
            data: { test },
            message: "Test updated successfully"
        });

    } catch (error) {
        console.error("Admin Update Test Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to update test"
            }
        });
    }
};


/**
 * @desc    Get test detail with all sections and their questions
 * @route   GET /api/admin/tests/:testId
 * @access  Admin
 */
export const getTestDetail = async (req, res) => {
    try {
        const { testId } = req.params;

        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({
                success: false,
                error: {
                    code: "TEST_NOT_FOUND",
                    message: "Test not found"
                }
            });
        }

        // Fetch sections with their assigned questions
        const sections = await Section.find({ test_id: test._id })
            .sort({ display_order: 1 })
            .lean();

        const sectionIds = sections.map(s => s._id);
        const sectionQuestions = await SectionQuestion.find({ section_id: { $in: sectionIds } })
            .sort({ question_order: 1 })
            .populate({
                path: "question_id",
                select: "id text subject marks correct_option"
            });

        // Group questions by section
        const sectionsWithQuestions = sections.map(section => ({
            ...section,
            questions: sectionQuestions
                .filter(sq => sq.section_id.toString() === section._id.toString())
                .map(sq => ({
                    _id: sq._id,
                    question_order: sq.question_order,
                    question: sq.question_id
                }))
        }));

        return res.status(200).json({
            success: true,
            data: { test, sections: sectionsWithQuestions },
            message: "Test detail retrieved successfully"
        });

    } catch (error) {
        console.error("Admin Get Test Detail Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to retrieve test detail"
            }
        });
    }
};


/**
 * @desc    Assign questions to a section within a test
 * @route   POST /api/admin/tests/:testId/sections/:sectionId/questions
 * @body    { questions: [{ question_id, question_order }] }
 * @access  Admin
 */
export const assignQuestions = async (req, res) => {
    try {
        const { testId, sectionId } = req.params;
        const { questions } = req.body;

        // Validate test exists
        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({
                success: false,
                error: {
                    code: "TEST_NOT_FOUND",
                    message: "Test not found"
                }
            });
        }

        // Validate section exists and belongs to this test
        const section = await Section.findOne({ _id: sectionId, test_id: testId });
        if (!section) {
            return res.status(404).json({
                success: false,
                error: {
                    code: "SECTION_NOT_FOUND",
                    message: "Section not found or does not belong to this test"
                }
            });
        }

        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "questions array is required with at least one entry"
                }
            });
        }

        // Validate that all question IDs exist
        const questionIds = questions.map(q => q.question_id);
        const existingQuestions = await Question.find({ _id: { $in: questionIds } });

        if (existingQuestions.length !== questionIds.length) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "One or more question IDs are invalid"
                }
            });
        }

        // Build section-question mappings
        const sectionQuestionDocs = questions.map(q => ({
            section_id: sectionId,
            question_id: q.question_id,
            question_order: q.question_order
        }));

        let insertedCount = 0;
        try {
            const created = await SectionQuestion.insertMany(sectionQuestionDocs, { ordered: false });
            insertedCount = created.length;
        } catch (insertError) {
            if (insertError.code === 11000) {
                // Partial success is possible with ordered: false
                insertedCount = insertError.insertedDocs?.length || insertError.result?.nInserted || 0;

                if (insertedCount === 0) {
                    return res.status(409).json({
                        success: false,
                        error: {
                            code: "DUPLICATE_ERROR",
                            message: "All provided questions are already assigned to this section."
                        }
                    });
                }
                // Allow it to proceed to success block for partial insertions
            } else {
                throw insertError; // Throw up to the main catch block for other DB errors
            }
        }

        console.log(`Admin assigned ${insertedCount} questions to section ${section.name} in test ${test.id}`);

        return res.status(201).json({
            success: true,
            data: { assigned: insertedCount },
            message: `${insertedCount} questions assigned to section "${section.name}"`
        });

    } catch (error) {
        console.error("Admin Assign Questions Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to assign questions"
            }
        });
    }
};


/**
 * @desc    Platform-wide analytics and monitoring
 * @route   GET /api/admin/analytics
 * @access  Admin
 */
export const getAnalytics = async (req, res) => {
    try {
        const [
            totalUsers,
            premiumUsers,
            totalTests,
            totalQuestions,
            totalAttempts,
            submittedAttempts
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ plan: "PREMIUM" }),
            Test.countDocuments(),
            Question.countDocuments(),
            TestAttempt.countDocuments(),
            TestAttempt.countDocuments({ status: "SUBMITTED" })
        ]);

        // Top 5 most attempted tests
        const topTests = await TestAttempt.aggregate([
            { $group: { _id: "$test_id", attempts: { $sum: 1 } } },
            { $sort: { attempts: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "tests",
                    localField: "_id",
                    foreignField: "_id",
                    as: "test"
                }
            },
            { $unwind: "$test" },
            {
                $project: {
                    _id: 1,
                    attempts: 1,
                    title: "$test.title",
                    exam_type: "$test.exam_type"
                }
            }
        ]);

        // Recent 7-day signup count
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentSignups = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

        return res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    premium: premiumUsers,
                    free: totalUsers - premiumUsers,
                    recentSignups
                },
                content: {
                    totalTests,
                    totalQuestions
                },
                attempts: {
                    total: totalAttempts,
                    submitted: submittedAttempts,
                    inProgress: totalAttempts - submittedAttempts
                },
                topTests
            },
            message: "Analytics retrieved successfully"
        });

    } catch (error) {
        console.error("Admin Analytics Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to retrieve analytics"
            }
        });
    }
};
