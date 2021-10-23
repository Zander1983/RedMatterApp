import { getHumanReadableTimeDifference } from "./time";

type Milliseconds = number;

const getPairDiff = (delta: Milliseconds) => {
  const now = new Date();
  const future = new Date(now.getTime() + delta);
  return [now, future];
};

const testCases = [
  {
    milisecondsDelta: 1000,
    expectedResponse: "1 second",
  },
  {
    milisecondsDelta: 12724,
    expectedResponse: "12 seconds",
  },
  {
    milisecondsDelta: 321,
    expectedResponse: "just now",
  },
  {
    milisecondsDelta: 1000 * 60 * 60 * 24 * 365,
    expectedResponse: "1 year",
  },
  {
    milisecondsDelta: 1000 * 60 * 60 * 24 * 67,
    expectedResponse: "2 months",
  },
  {
    milisecondsDelta: 1000 * 60 * 60 * 24 * 4.23,
    expectedResponse: "4 days",
  },
];

testCases.forEach((testCase) => {
  test("Get human time diff for " + testCase.expectedResponse, () => {
    const [now, future] = getPairDiff(testCase.milisecondsDelta);
    let ret = getHumanReadableTimeDifference(now, future);
    expect(ret).toBe(testCase.expectedResponse);
  });
});
