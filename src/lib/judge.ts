import { spawn } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import { db } from "./db";

interface RunResult {
  passed: boolean;
  actualOutput?: string;
  runtimeMs: number;
  memoryKb?: number;
  errorType?: "COMPILE_ERROR" | "RUNTIME_ERROR" | "TIME_LIMIT_EXCEEDED" | "WRONG_ANSWER";
}

// Ensure the base temp directory exists
const TEMP_BASE_DIR = path.join(process.cwd(), "src", "temp");

async function ensureTempDir() {
  try {
    await fs.mkdir(TEMP_BASE_DIR, { recursive: true });
  } catch (err) {
    // Already exists or can't write
  }
}

function runProcess(
  cmd: string,
  args: string[],
  input: string,
  timeoutMs: number = 3000
): Promise<{ stdout: string; stderr: string; code: number | null; signal: string | null; timeMs: number }> {
  return new Promise((resolve) => {
    const start = performance.now();
    const child = spawn(cmd, args);

    let stdout = "";
    let stderr = "";
    let killed = false;

    // Timeout monitoring
    const timer = setTimeout(() => {
      killed = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code, signal) => {
      clearTimeout(timer);
      const timeMs = Math.round(performance.now() - start);
      
      resolve({
        stdout,
        stderr,
        code: killed ? null : code,
        signal: killed ? "SIGKILL" : signal,
        timeMs: killed ? timeoutMs : timeMs,
      });
    });

    // Write input and close stdin
    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();
  });
}

export async function judgeSubmission(submissionId: string): Promise<void> {
  await ensureTempDir();

  // 1. Fetch submission, problem, and test cases
  const submission = await db.submission.findUnique({
    where: { id: submissionId },
    include: {
      problem: {
        include: {
          testCases: true,
        },
      },
    },
  });

  if (!submission) {
    console.error(`Submission ${submissionId} not found`);
    return;
  }

  // Update submission status to RUNNING
  await db.submission.update({
    where: { id: submissionId },
    data: { status: "RUNNING" },
  });

  const { language, sourceCode, problem } = submission;
  const testCases = problem.testCases;

  const runId = `run_${submissionId}_${Date.now()}`;
  const runDir = path.join(TEMP_BASE_DIR, runId);
  await fs.mkdir(runDir, { recursive: true });

  let fileExt = "";
  if (language === "python") fileExt = "py";
  else if (language === "cpp") fileExt = "cpp";
  else if (language === "javascript") fileExt = "js";
  else {
    fileExt = "txt"; // Unknown
  }

  const sourcePath = path.join(runDir, `solution.${fileExt}`);
  await fs.writeFile(sourcePath, sourceCode, "utf8");

  try {
    // 2. Compilation (only for C++)
    let isCompiled = true;
    let compileError = "";
    let exePath = "";

    if (language === "cpp") {
      exePath = path.join(runDir, "solution.exe");
      const compileResult = await runProcess(
        "g++",
        ["-O3", "-std=c++17", "-o", exePath, sourcePath],
        "",
        5000 // 5 seconds compile timeout
      );

      if (compileResult.code !== 0) {
        isCompiled = false;
        compileError = compileResult.stderr || "Compilation failed";
      }
    }

    const results: (RunResult & { testCaseId: string })[] = [];

    if (!isCompiled) {
      // Create empty failed results for all test cases with COMPILE_ERROR
      for (const tc of testCases) {
        results.push({
          testCaseId: tc.id,
          passed: false,
          errorType: "COMPILE_ERROR",
          actualOutput: compileError,
          runtimeMs: 0,
        });
      }
    } else {
      // 3. Run against each test case
      for (const tc of testCases) {
        let cmd = "";
        let args: string[] = [];

        if (language === "python") {
          cmd = "python";
          args = [sourcePath];
        } else if (language === "cpp") {
          cmd = exePath;
          args = [];
        } else if (language === "javascript") {
          cmd = "node";
          args = [sourcePath];
        }

        const runRes = await runProcess(cmd, args, tc.input, 3000); // 3 seconds execution limit

        if (runRes.signal === "SIGKILL") {
          results.push({
            testCaseId: tc.id,
            passed: false,
            errorType: "TIME_LIMIT_EXCEEDED",
            runtimeMs: 3000,
          });
        } else if (runRes.code !== 0) {
          results.push({
            testCaseId: tc.id,
            passed: false,
            errorType: "RUNTIME_ERROR",
            actualOutput: runRes.stderr || "Runtime error occurred",
            runtimeMs: runRes.timeMs,
          });
        } else {
          const cleanActual = runRes.stdout.replace(/\r\n/g, "\n").trim();
          const cleanExpected = tc.expectedOutput.replace(/\r\n/g, "\n").trim();
          const passed = cleanActual === cleanExpected;

          results.push({
            testCaseId: tc.id,
            passed,
            errorType: passed ? undefined : "WRONG_ANSWER",
            actualOutput: runRes.stdout,
            runtimeMs: runRes.timeMs,
            memoryKb: Math.floor(Math.random() * 2000) + 1200, // mock memory usage
          });
        }
      }
    }

    // 4. Save results to Database
    await db.$transaction(async (tx) => {
      // Create submission results
      for (const res of results) {
        await tx.submissionResult.create({
          data: {
            submissionId,
            testCaseId: res.testCaseId,
            passed: res.passed,
            actualOutput: res.actualOutput,
            runtimeMs: res.runtimeMs,
            memoryKb: res.memoryKb,
            errorType: res.errorType,
          },
        });
      }

      // Check overall score
      const passedCount = results.filter((r) => r.passed).length;
      const totalCount = testCases.length;
      const hasError = results.some((r) => r.errorType !== undefined);
      
      const allPassed = passedCount === totalCount;
      const submissionStatus = allPassed ? "COMPLETED" : "ERROR";

      await tx.submission.update({
        where: { id: submissionId },
        data: { status: submissionStatus },
      });

      // 5. Automatic LMS Grading
      const autoScore = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

      // Find if grade entry already exists
      const existingGrade = await tx.grade.findFirst({
        where: {
          studentId: submission.studentId,
          testId: problem.testId,
        },
      });

      if (existingGrade) {
        // Only update if the new autoScore is higher (standard LMS best submission policy)
        if (autoScore > existingGrade.autoScore) {
          await tx.grade.update({
            where: { id: existingGrade.id },
            data: {
              submissionId,
              autoScore,
              finalMarks: autoScore, // default final marks to autoScore
            },
          });
        }
      } else {
        await tx.grade.create({
          data: {
            submissionId,
            studentId: submission.studentId,
            testId: problem.testId,
            autoScore,
            finalMarks: autoScore,
            status: "PENDING",
          },
        });
      }

      // Create Audit Log
      await tx.auditLog.create({
        data: {
          action: "JUDGE_COMPLETED",
          entity: "SUBMISSION",
          entityId: submissionId,
          metadataJson: JSON.stringify({ passedCount, totalCount, autoScore }),
        },
      });
    });
  } catch (err) {
    console.error("Error during judging process:", err);
    await db.submission.update({
      where: { id: submissionId },
      data: { status: "ERROR" },
    });
  } finally {
    // 6. Cleanup files
    try {
      await fs.rm(runDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      console.error("Failed to delete temp run directory:", cleanupErr);
    }
  }
}
