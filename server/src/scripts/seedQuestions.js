import { config } from "dotenv";
config();

import mongoose from "mongoose";
import { parse } from "csv-parse/sync";
import fs from "fs";
import crypto from "crypto";
import path from "path";

import Question from "../models/question.model.js";
import Section from "../models/section.model.js";
import SectionQuestion from "../models/section_question.model.js";

const MONGO_URI = process.env.MONGO_URI;

const filePath = path.resolve("src/data/ssc-cgl-v3.csv");
const csv = fs.readFileSync(filePath, "utf-8");
const rows = parse(csv, { columns: true, skip_empty_lines: true });

function generateId(text = "") {
  return crypto.createHash("md5").update(text).digest("hex");
}

async function processRow(row, index) {
  // ✅ Validation
  if (!row.text) throw new Error("Missing question text");

  const options = [
    row.option_a,
    row.option_b,
    row.option_c,
    row.option_d,
  ];
  // check missing options
  if (options.some(opt => !opt)) {
    throw new Error("Missing options");
  }
  // check duplicate options
  if (new Set(options).size !== options.length) {
    throw new Error("Duplicate options");
  }

  const correctOption = Number(row.correct);
  if (isNaN(correctOption) || correctOption < 0 || correctOption > 3) {
    throw new Error(`Invalid correct option: ${row.correct}`);
  }

  const questionId =
    row.question_id ||
    generateId(`${row.text}-${row.subject}-${row.difficulty}`);

  // 1. Question
  const question = await Question.findOneAndUpdate(
    { _id: questionId },
    {
      $setOnInsert: { _id: questionId },
      $set: {
        text: row.text,
        option_a: row.option_a,
        option_b: row.option_b,
        option_c: row.option_c,
        option_d: row.option_d,
        correct_option: correctOption,
        explanation: row.explanation,
        marks: Number(row.marks) || 1,
        negative_marks: Number(row.negative_marks) || 0,
        subject: row.subject,
        difficulty: row.difficulty,
      },
    },
    { upsert: true, returnDocument: "after" }  // upsert -> 'update' or 'insert' || returnDocument -> 'after' -> Returns the document after the update is applied.
  );

  // 2. Section
  const section = await Section.findOneAndUpdate(
    { 
        testId: row.test_id, 
        name: row.section_name 
    },
    {
      $set: {
        section_order: Number(row.section_order) || 1,
      },
      $setOnInsert: {
        testId: row.test_id,
        name: row.section_name,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  // 3. Link
  await SectionQuestion.findOneAndUpdate(
    {
      section_id: section._id,
      question_id: question._id,
    },
    {
      $set: {
        question_order: Number(row.question_order) || 1,
      },
      $setOnInsert: {
        section_id: section._id,
        question_id: question._id,
      },
    },
    { upsert: true }
  );
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  for (const [index, row] of rows.entries()) {
    try {
      await processRow(row, index);
    } catch (err) {
      console.error(`❌ Row ${index + 1} failed:`, err.message);
    }
  }

  console.log(`✅ Processed ${rows.length} rows`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});