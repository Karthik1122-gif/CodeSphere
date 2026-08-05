import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Cleanup existing data
  await prisma.auditLog.deleteMany({});
  await prisma.aiChatLog.deleteMany({});
  await prisma.supportMessage.deleteMany({});
  await prisma.grade.deleteMany({});
  await prisma.submissionResult.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.testCase.deleteMany({});
  await prisma.problem.deleteMany({});
  await prisma.test.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash password
  const passwordHash = bcrypt.hashSync("Password123", 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      role: "ADMIN",
      name: "System Administrator",
      email: "admin@hitam.edu.in",
      rollNo: "ADM001",
      department: "Administration",
      passwordHash,
    },
  });

  const faculty = await prisma.user.create({
    data: {
      role: "FACULTY",
      name: "Dr. K. Srinivas",
      email: "faculty@hitam.edu.in",
      rollNo: "FAC102",
      department: "Computer Science & Engineering",
      passwordHash,
    },
  });

  const student = await prisma.user.create({
    data: {
      role: "STUDENT",
      name: "Banoth Rahul",
      email: "student@hitam.edu.in",
      rollNo: "22E81A0501",
      department: "Computer Science & Engineering",
      section: "CSE-A",
      passwordHash,
    },
  });

  console.log(`Created users: admin (${admin.email}), faculty (${faculty.email}), student (${student.email})`);

  // 2. Create Test
  const testDate = new Date();
  const test = await prisma.test.create({
    data: {
      title: "Data Structures & Algorithms - MidTerm",
      subject: "Design and Analysis of Algorithms (CS302)",
      createdById: faculty.id,
      difficulty: "MEDIUM",
      durationMinutes: 60,
      opensAt: new Date(testDate.getTime() - 2 * 60 * 60 * 1000), // opened 2 hours ago
      closesAt: new Date(testDate.getTime() + 24 * 60 * 60 * 1000), // closes tomorrow
      status: "PUBLISHED",
      languagesAllowed: "cpp,python,javascript",
    },
  });

  console.log(`Created test: ${test.title}`);

  // 3. Create Problems
  // Problem 1: Two Sum
  const p1 = await prisma.problem.create({
    data: {
      testId: test.id,
      title: "Two Sum",
      statementMd: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

### Input Format
- First line contains \`N\`, the number of elements in the array.
- Second line contains \`N\` space-separated integers representing elements of the array.
- Third line contains a single integer \`target\`.

### Output Format
- Print the indices of the two elements space-separated in ascending order (e.g. \`0 1\`).`,
      constraints: `2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9`,
      points: 50,
      orderIndex: 1,
    },
  });

  // Problem 2: Factorial Check
  const p2 = await prisma.problem.create({
    data: {
      testId: test.id,
      title: "Factorial Calculation",
      statementMd: `Compute the factorial of a given non-negative integer \`N\`.

The factorial of a non-negative integer \`N\` is the product of all positive integers less than or equal to \`N\`.

By definition, \`0! = 1\`.

### Input Format
- A single integer \`N\`.

### Output Format
- A single integer representing \`N!\`.`,
      constraints: `0 <= N <= 12`,
      points: 50,
      orderIndex: 2,
    },
  });

  console.log(`Created problems: ${p1.title}, ${p2.title}`);

  // 4. Create Test Cases
  // For Two Sum
  await prisma.testCase.createMany({
    data: [
      {
        problemId: p1.id,
        input: "4\n2 7 11 15\n9",
        expectedOutput: "0 1",
        isSample: true,
        points: 20,
        generatedBy: "manual",
      },
      {
        problemId: p1.id,
        input: "3\n3 2 4\n6",
        expectedOutput: "1 2",
        isSample: false,
        points: 15,
        generatedBy: "manual",
      },
      {
        problemId: p1.id,
        input: "2\n3 3\n6",
        expectedOutput: "0 1",
        isSample: false,
        points: 15,
        generatedBy: "manual",
      },
    ],
  });

  // For Factorial
  await prisma.testCase.createMany({
    data: [
      {
        problemId: p2.id,
        input: "5",
        expectedOutput: "120",
        isSample: true,
        points: 20,
        generatedBy: "manual",
      },
      {
        problemId: p2.id,
        input: "0",
        expectedOutput: "1",
        isSample: false,
        points: 15,
        generatedBy: "manual",
      },
      {
        problemId: p2.id,
        input: "3",
        expectedOutput: "6",
        isSample: false,
        points: 15,
        generatedBy: "manual",
      },
      {
        problemId: p2.id,
        input: "12",
        expectedOutput: "479001600",
        isSample: false,
        points: 10,
        generatedBy: "manual",
      },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
