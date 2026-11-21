# Assignment #4: Maintenance, Technical-Debt, and Evolution Plan

**Project:** OBS (student information system), repository `obs-ci-lab`
**Scope of this plan:** the current code (`src/student.js`), the tests (`test/student.test.js`), the project settings (`package.json`), the CI workflow (`.github/workflows`), and the plan in `DEPLOYMENT_AND_MONITORING.md`.

The OBS module is small today. It has two functions (`calculateAverage` and `getLetterGrade`), three automated tests, and a CI pipeline on GitHub Actions. This plan shows what is weak now, what to fix first, and how the project can grow safely.

---

## 1. Current technical debt

| ID | Debt item | Evidence | Type | Effect |
|---|---|---|---|---|
| TD1 | `calculateAverage` does not check that grades are numbers | `calculateAverage(["90","80"])` joins the text and returns 4540 | Code debt | Wrong results without any error |
| TD2 | An invalid or empty list returns `0`, the same value as a real average of 0 | `calculateAverage([])` returns `0` | Code debt | Errors and real zeros look the same |
| TD3 | `getLetterGrade` accepts any value | 150 gives `A`; `NaN` and -5 give `F` | Code debt | Bad data becomes a letter grade |
| TD4 | Very few tests | 3 tests; only the letter `A` is tested; no invalid input, no boundary values | Test debt | Changes are risky; bugs are not caught |
| TD5 | Grade boundaries are written inside the function | `if (average >= 90) ...` (four fixed limits) | Design debt | A different grading scale needs a code change |
| TD6 | The deployment plan describes more than the repository contains | The plan mentions containers, three environments, a health check and alerts; the repository has no Dockerfile and no health check | Documentation debt | The team may believe a feature exists when it does not |
| TD7 | No function documentation, and the file name does not match its content | No comments on inputs and outputs; `student.js` holds only grade functions | Documentation debt | New team members need more time to understand the code |
| TD8 | Weak project settings in `package.json` | No `engines` field, so the Node.js version is not declared (the deployment plan says Node.js 20); the `build` script only runs `node --check src/student.js`, one syntax check on one file; no coverage or lint script | Build and configuration debt | The runtime version can differ between machines; new files are not checked; quality is not measured |

---

## 2. Maintenance needs (classified)

| # | Maintenance need | Type | Related debt |
|---|---|---|---|
| M1 | Make `calculateAverage` reject or handle non-numeric grades | Corrective | TD1 |
| M2 | Make `getLetterGrade` reject values outside 0-100 and non-numbers | Corrective | TD3 |
| M3 | Separate "no grades" from a real average of 0 | Corrective | TD2 |
| M4 | Support another grading scale (for example A-, B+) | Adaptive | TD5 |
| M5 | Move from Node.js 20 to a supported Node.js version in the CI workflow and the plan (check the Node.js release schedule: version 20 is due to reach end of life in 2026) | Adaptive | TD6 |
| M6 | Add a credit-weighted average (GPA) | Perfective | - |
| M7 | Add tests for all letter grades, boundary values and invalid input | Preventive | TD4 |
| M8 | Add function documentation; check that the file name in `src` and in the test import match exactly (upper and lower case) | Preventive | TD7 |
| M9 | Build what the deployment plan promises: a Dockerfile and a health check | Perfective | TD6 |
| M10 | Improve `package.json`: add an `engines` field for the Node.js version, a `coverage` script (`node --test --experimental-test-coverage`), and a build step that checks every file in `src` | Preventive | TD8 |

All four maintenance types are covered: corrective (M1-M3), adaptive (M4, M5), perfective (M6, M9), preventive (M7, M8, M10).

Good news from `package.json`: the project has no external dependencies, so there are no old libraries to update. The dependency risk is limited to the Node.js runtime itself (M5).

---

## 3. Change-impact analysis: future feature "Credit-weighted GPA" (M6)

**Feature:** A new function that takes a list of courses, each with a grade and credits, and returns the weighted average. For example, 90 with 3 credits and 80 with 4 credits give (90x3 + 80x4) / 7 = 84.29.

| Area | Impact | Why |
|---|---|---|
| `src/student.js` | Direct | New function; `calculateAverage` stays for simple averages |
| `getLetterGrade` | Indirect (input stays the same) | It receives the new average, so M2 validation must exist first |
| `test/student.test.js` | Direct | New tests needed |
| README and docs | Indirect | New function must be described |
| CI workflow | Indirect | It runs the new tests; no change to the workflow itself |
| Data | New requirement | Every course needs a credit value |

**Risks:**
- Total credits can be 0, which causes a division by zero.
- Credits can be negative or not a number.
- Users may mix the simple average and the weighted average and compare them by mistake.
- Rounding differences (for example 84.2857 shown as 84.29).

**Tests needed:** the example above; one course only; credits equal to 0; negative credits; non-numeric values; an empty course list.

**Effort estimate:** about 3 story points. Risk: medium.

**Decision:** First add the tests (M7) and the validation fixes (M1-M3). Then build the weighted GPA, so the new feature does not copy the old problems.

---

## 4. Refactoring candidate: `getLetterGrade`

**Why this candidate:**
- Every result in the module passes through it.
- Only one of five letters is tested.
- The boundaries are hard-coded, and invalid input is accepted.

**Plan (safe order):**
1. **Add tests first.** Test the current behavior for A, B, C, D and F and for the boundary values 89, 90, 79, 80, 69, 70, 59 and 60. Run them in CI.
2. **Refactor without changing behavior.** Move the boundaries into one list (a grade scale table) and let the function read from it. The same inputs must give the same letters, and the tests from step 1 prove it.
3. **Fix the validation as a separate change (M2).** Reject non-numbers and values outside 0-100. This changes behavior on purpose, so it is a bug fix and not part of the refactoring.

**Done when:** all tests pass in the GitHub Actions run, the boundaries exist in one place, and the pull request is reviewed.

---

## 5. Modernization and evolution roadmap

| Phase | When | Goal | Main work |
|---|---|---|---|
| 1. Stabilize | Sprint 1-2 | Make the code safe to change | M7 tests; M1-M3 validation fixes; M8 file name check; M10 `engines` field and `coverage` script in `package.json` |
| 2. Improve | Sprint 3-4 | Reduce the debt | Refactor `getLetterGrade` (grade scale table, M4 ready); M5 update the Node.js version in CI; add function documentation; run the coverage script in CI |
| 3. Extend | Sprint 5-6 | Add value | M6 credit-weighted GPA; M9 Dockerfile and a simple health check |
| 4. Modernize | Later | Match the deployment plan | Staging and production deployment; monitoring and alerts from `DEPLOYMENT_AND_MONITORING.md`; consider moving to TypeScript for type safety |

Phase 4 links directly to the existing deployment plan, so the roadmap closes the gap named in TD6.

---

## 6. Three software metrics

| Metric | What it shows | How to measure | Now | Target |
|---|---|---|---|---|
| **Test coverage** | How much of the code the tests run | New script `npm run coverage` (`node --test --experimental-test-coverage`, built into Node.js 20 and newer); the current `npm test` script runs the tests but does not measure coverage | Low: 3 tests, 1 of 5 letters tested | At least 80% of lines; every branch of `getLetterGrade` |
| **Cyclomatic complexity** | How many paths a function has, so how hard it is to test and understand | ESLint `complexity` rule | `getLetterGrade` has 5 paths; `calculateAverage` has 3 | 10 or less per function |
| **Defect density** | Bugs found compared to the size of the code or the number of releases | GitHub Issues with the label `bug` | 0 recorded; 3 known defects found by this review (TD1-TD3) | Record every bug as an issue; the number per release should go down |

---

## 7. Prioritization by value and risk

| Priority | Item | Value | Risk if ignored | Reason |
|---|---|---|---|---|
| 1 | M7: tests for all letters, boundaries and invalid input | High | High | Makes every later change safe |
| 2 | M1-M3: validation and error handling | High | High | Wrong grades are the main business risk |
| 3 | M5: update Node.js version, and M10: declare it in `package.json` (`engines`) | Medium | High | Unsupported runtime means no security fixes, and an undeclared version can differ between machines |
| 4 | M4 and the refactoring in section 4 | Medium | Medium | Easier to change grading rules |
| 5 | M6: credit-weighted GPA | High | Low | Valuable, but not urgent; needs priorities 1-2 first |
| 6 | M8: documentation and naming | Medium | Low | Helps new team members |
| 7 | M9: Dockerfile and health check | Medium | Low | Makes the deployment plan real |

**Summary:** Fix correctness first, make the code safe to change second, and add new features after that.
