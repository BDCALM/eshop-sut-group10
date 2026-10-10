_2026 AI-First - CS423/CSC15003 Software Testing - Seminar Track_

**T07 - CI/CD & Test-Harness Engineering**

_Tests are useless if they don't run automatically. Pipelines + AI flaky-test triage._

**1. Overview**

Modern testing is inseparable from CI/CD. You'll build a small pipeline that runs the EShop unit \+ API \+ smoke tests on every PR, captures artefacts, posts a coverage badge — and then compares an AI-assisted flaky-test triage tool (e.g., Datadog Flaky Test Management or DiffBlue) against manual log analysis.

**2. Learning Objectives**

By the end of this seminar each team member must be able to:

- Author a GitHub Actions workflow covering build → test → artefact upload.
- Run the same workflow on Jenkins (or GitLab CI) for comparison; note differences.
- Introduce one flaky test; analyse it manually using logs + retry history.
- Use an AI tool (e.g., ChatGPT with logs, Datadog FTM) to surface the same flake.
- Decide where AI adds value vs where it adds noise in CI.

**3. Traditional Tools - pick one as your main**

| Note - the tools listed below are SUGGESTIONS only. The final tool selection is decided JOINTLY by the team and the supervising instructor at Stage S2 (Instructor Review). Teams may add, replace, or drop any tool from this list - provided the choice is justified in the Stage S1 proposal and approved before Stage S3 begins. |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

| Tool               | Why study it                                             |
| :----------------- | :------------------------------------------------------- |
| **GitHub Actions** | YAML-only, free for public; great default.               |
| **Jenkins**        | Self-hosted; mature plugin ecosystem; pipelines as code. |
| **GitLab CI**      | Built-in; secrets + environments tightly integrated.     |

**4. AI-Augmented Direction - pick at least one**

_Demonstrating an AI angle is mandatory. The Department does not provide paid AI accounts; free tiers and student trials are allowed._

| Note - the tools listed below are SUGGESTIONS only. The final tool selection is decided JOINTLY by the team and the supervising instructor at Stage S2 (Instructor Review). Teams may add, replace, or drop any tool from this list - provided the choice is justified in the Stage S1 proposal and approved before Stage S3 begins. |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

| Tool                                | Why study it                                                          |
| :---------------------------------- | :-------------------------------------------------------------------- |
| **Datadog Flaky Test Management**   | Auto-detect flakiness + suggest fixes.                                |
| **ChatGPT / Claude for log triage** | Paste failing test logs; ask for hypothesis + 3 next-checks.          |
| **Sealights / Launchable AI**       | Predict which tests to run for a given commit (test impact analysis). |

**5. Reading List**

- Jez Humble & David Farley — 'Continuous Delivery' (Chs. 4 + 8).
- Google Testing Blog — 'Flaky tests at Google and how we mitigate them'.
- Datadog blog — 'Flaky test analytics' (technical posts).

**6. Study Milestones (Stage S3 internal checklist)**

- 1. Create a workflow that lints + tests EShop backend on push.
- 2. Cache npm + run Jest API tests; upload coverage XML.
- 3. Add a status check + branch protection on main.
- 4. Introduce a sleep-based flake; observe over 10 runs.
- 5. Compare AI-vs-human triage report.

**7. In-class Activity - for the audience teams**

**Title: Pipeline Postmortem**

Audience teams diagnose a broken CI build given only the workflow YAML and a log snippet.

| Time          | Step                                                |
| :------------ | :-------------------------------------------------- |
| **0:00–0:03** | Facilitator distributes failing log + workflow.yml. |
| **0:03–0:13** | Teams write down a hypothesis tree (3 levels deep). |
| **0:13–0:18** | Each team consults an AI tool with the same logs.   |
| **0:18–0:22** | Reveal the real root cause; debrief.                |
| **0:22–0:25** | Each team states one lesson learned.                |

**Audience takeaways:**

- AI excels at structuring log noise; humans excel at hypothesis pruning.
- Flake taxonomy (timing, ordering, environment) is a prerequisite for AI triage.
- Test impact analysis is the next frontier — keep an eye on Launchable / Sealights.

**8. Deliverables**

- Tool_Survey_Proposal.md - submitted in Stage S1.
- User_Guide.md (>= 6 sections) - submitted in Stage S4.
- Demo_Screencast.mp4 (5-8 min) - submitted in Stage S4.
- Activity_Worksheet.md for 'Pipeline Postmortem' - submitted in Stage S5.
- Seminar_Slides.pptx (\<= 15 slides) - submitted in Stage S6.
- [AI-02] / [AI-03] / [AI-04] - submitted in Stage S8.

**9. Topic-Specific Grading Notes**

Generic rubric is in Seminar_Guide.docx Section 6. Topic-specific additions:

- Live demo MUST exercise at least one feature from the traditional tool AND one from the AI tool.
- User guide MUST include a 'failure modes' section listing 3 real ways the tool can mislead users.
- Activity worksheet MUST be reproducible by a peer team in \<= 25 minutes without your help.

_-- End of T07 brief --_
