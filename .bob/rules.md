# SpringBoard Bob Rules

This project is a IBM Bob Dev Day Hackathon proof-of-concept.

Project goal:
Use IBM Bob IDE to modernize a legacy Spring Boot 2.x application 
toward Spring Boot 3.x readiness.

Bob should help with:
- Codebase analysis
- Migration planning
- Safe partial refactoring
- Test generation
- Build/test issue iteration
- Documentation

Rules:
- Keep scope small and suitable for a proof-of-concept.
- Do not attempt a full enterprise migration.
- Prefer safe, minimal, reviewable changes.
- Preserve existing application behavior.
- Use Java 17 readiness where Spring Boot 3.x is involved.
- Replace javax.* imports with jakarta.* only where required.
- Use JUnit 5 and Mockito for generated tests.
- Explain every important change in Markdown.
- Avoid unnecessary architecture changes.