export interface AISuggestedProblem {
  title: string;
  statementMd: string;
  constraints: string;
  points: number;
  testCases: {
    input: string;
    expectedOutput: string;
    isSample: boolean;
    points: number;
  }[];
}

const TEMPLATE_PROBLEMS: Record<string, Record<string, AISuggestedProblem>> = {
  arrays: {
    EASY: {
      title: "Find Maximum Element",
      statementMd: `Write a program to find the maximum element in a given array of integers.

### Input Format
- First line contains \`N\`, the number of elements in the array.
- Second line contains \`N\` space-separated integers.

### Output Format
- Print a single integer representing the maximum element in the array.`,
      constraints: "1 <= N <= 10^5\n-10^9 <= arr[i] <= 10^9",
      points: 20,
      testCases: [
        { input: "5\n1 5 3 9 2", expectedOutput: "9", isSample: true, points: 10 },
        { input: "3\n-10 -5 -20", expectedOutput: "-5", isSample: false, points: 5 },
        { input: "1\n42", expectedOutput: "42", isSample: false, points: 5 },
      ],
    },
    MEDIUM: {
      title: "Merge Intervals",
      statementMd: `Given an array of intervals where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.

### Input Format
- First line contains \`N\`, the number of intervals.
- The next \`N\` lines each contain two space-separated integers representing the start and end of an interval.

### Output Format
- Print each merged interval on a new line, with start and end space-separated. Sorted by start time.`,
      constraints: "1 <= N <= 10^4\n0 <= start_i <= end_i <= 10^4",
      points: 50,
      testCases: [
        { input: "4\n1 3\n2 6\n8 10\n15 18", expectedOutput: "1 6\n8 10\n15 18", isSample: true, points: 20 },
        { input: "2\n1 4\n4 5", expectedOutput: "1 5", isSample: false, points: 15 },
        { input: "3\n1 4\n0 2\n5 6", expectedOutput: "0 4\n5 6", isSample: false, points: 15 },
      ],
    },
    HARD: {
      title: "Sliding Window Maximum",
      statementMd: `You are given an array of integers \`nums\`, there is a sliding window of size \`K\` which is moving from the very left of the array to the very right. You can only see the \`K\` numbers in the window. Each time the sliding window moves right by one position.

Return the max sliding window.

### Input Format
- First line contains two integers: \`N\` (size of array) and \`K\` (window size).
- Second line contains \`N\` space-separated integers.

### Output Format
- Print the sliding window maximums space-separated on a single line.`,
      constraints: "1 <= N <= 10^5\n1 <= K <= N\n-10^4 <= nums[i] <= 10^4",
      points: 100,
      testCases: [
        { input: "8 3\n1 3 -1 -3 5 3 6 7", expectedOutput: "3 3 5 5 6 7", isSample: true, points: 40 },
        { input: "2 1\n1 -1", expectedOutput: "1 -1", isSample: false, points: 30 },
        { input: "4 2\n9 11 8 9", expectedOutput: "11 11 9", isSample: false, points: 30 },
      ],
    },
  },
  strings: {
    EASY: {
      title: "Valid Palindrome",
      statementMd: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.

### Input Format
- A single line containing string \`s\`.

### Output Format
- Print \`true\` or \`false\`.`,
      constraints: "1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.",
      points: 20,
      testCases: [
        { input: "A man, a plan, a canal: Panama", expectedOutput: "true", isSample: true, points: 10 },
        { input: "race a car", expectedOutput: "false", isSample: false, points: 5 },
        { input: " ", expectedOutput: "true", isSample: false, points: 5 },
      ],
    },
    MEDIUM: {
      title: "Longest Substring Without Repeating Characters",
      statementMd: `Given a string \`s\`, find the length of the longest substring without repeating characters.

### Input Format
- A single line containing the string \`s\`.

### Output Format
- A single integer representing the length.`,
      constraints: "0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.",
      points: 50,
      testCases: [
        { input: "abcabcbb", expectedOutput: "3", isSample: true, points: 20 },
        { input: "bbbbb", expectedOutput: "1", isSample: false, points: 15 },
        { input: "pwwkew", expectedOutput: "3", isSample: false, points: 15 },
      ],
    },
  },
  search: {
    EASY: {
      title: "Binary Search",
      statementMd: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

### Input Format
- First line contains two space-separated integers: \`N\` (array size) and \`target\`.
- Second line contains \`N\` space-separated integers.

### Output Format
- A single integer index or \`-1\`.`,
      constraints: "1 <= N <= 10^4\n-10^4 < nums[i], target < 10^4\nAll integers in nums are unique.",
      points: 25,
      testCases: [
        { input: "6 9\n-1 0 3 5 9 12", expectedOutput: "4", isSample: true, points: 15 },
        { input: "6 2\n-1 0 3 5 9 12", expectedOutput: "-1", isSample: false, points: 10 },
      ],
    },
    MEDIUM: {
      title: "Search in Rotated Sorted Array",
      statementMd: `There is an integer array \`nums\` sorted in ascending order (with distinct values).
Prior to being passed to your function, \`nums\` is possibly rotated at an unknown pivot index \`k\` (1 <= k < nums.length).

Given the array \`nums\` after the rotation and an integer \`target\`, return the index of \`target\` if it is in \`nums\`, or \`-1\` if it is not in \`nums\`.
You must write an algorithm with \`O(log n)\` runtime complexity.

### Input Format
- First line contains \`N\` and \`target\`.
- Second line contains \`N\` space-separated integers.

### Output Format
- Index of \`target\` or \`-1\`.`,
      constraints: "1 <= N <= 5000\n-10^4 <= nums[i], target <= 10^4",
      points: 50,
      testCases: [
        { input: "7 0\n4 5 6 7 0 1 2", expectedOutput: "4", isSample: true, points: 20 },
        { input: "7 3\n4 5 6 7 0 1 2", expectedOutput: "-1", isSample: false, points: 15 },
        { input: "1 0\n0", expectedOutput: "0", isSample: false, points: 15 },
      ],
    },
  },
};

export async function generateAIProblem(topic: string, difficulty: "EASY" | "MEDIUM" | "HARD"): Promise<AISuggestedProblem> {
  // If there's an API Key, we could fetch from standard LLM.
  // For the local developer experience and quick seeding, we use our templates.
  const normalizedTopic = topic.toLowerCase();
  
  let category = "arrays";
  if (normalizedTopic.includes("string") || normalizedTopic.includes("text") || normalizedTopic.includes("char")) {
    category = "strings";
  } else if (normalizedTopic.includes("search") || normalizedTopic.includes("binary") || normalizedTopic.includes("find")) {
    category = "search";
  }

  const categoryTemplates = TEMPLATE_PROBLEMS[category];
  const problem = categoryTemplates[difficulty] || categoryTemplates["MEDIUM"];

  // Add random customization based on user topic input
  return {
    ...problem,
    title: topic.trim().length > 3 ? `${problem.title} (${topic.trim()})` : problem.title,
  };
}
