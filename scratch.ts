const results = [
  { status: "passed", duration: 1200 },
  { status: "failed", duration: 900 },
  { status: "passed", duration: 1500 }
];

const failedExecsTotal = results.reduce((count, result) => count + (result.status === "failed" ? 1 : 0), 0)


console.log(failedExecsTotal)