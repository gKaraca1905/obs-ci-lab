# Deployment Assumptions and Monitoring Plan

## 1. Deployment and infrastructure assumptions
- The OBS (student information system) module runs on Node.js 20.
- The application is packaged as a container, so every environment is the same.
- We use three environments: development, staging, and production.
- Every change is built and tested by the CI pipeline (GitHub Actions) before it is merged.
- A change that fails the pipeline is never deployed.
- Code that passes is deployed to staging first, then to production.
- Infrastructure is described as code (for example, a Dockerfile and the workflow file), so environments are repeatable.
- Releases are small and frequent, which reduces risk.
- If a release causes a serious problem, we roll back to the previous version.

## 2. CI pipeline summary
- Trigger: every push and pull request to the main branch.
- Steps: checkout code, set up Node.js, build (syntax check), run automated tests.
- Evidence: one passing run, one failing run (broken test on purpose), and one passing run after the fix.

## 3. Basic monitoring and feedback signals
| Signal | What we watch | Example alert |
|---|---|---|
| Availability | Is the application up? (health check) | Down for more than 1 minute |
| Error rate | Failed requests and error logs | More than 5% errors in 5 minutes |
| Performance | Response time of login and grade pages | Slower than 2 seconds |
| Resources | CPU and memory use of the container | Above 80% for 10 minutes |
| Pipeline health | Result of every CI run | Any failed run notifies the team |
| User feedback | Bug reports from students and teachers | New critical report |

## 4. Feedback loop
- The team reviews alerts and failed pipeline runs every day.
- Problems found in production become new tasks on the project board.
- Fixes go through the same CI pipeline before they are released.
