# Codex Ticket Handoff Template

Use this template when giving Codex a ticket.

Copy the template, fill in the ticket ID and details, then send it to Codex.

---

```txt
We are working on the Cinematic Comic Video Converter.

Before coding, review these files:

- AGENTS.md
- README.md
- docs/planning/Full_Design_Document.md
- docs/planning/MVP_Technical_Design.md
- docs/Tickets.md
- docs/Repo_Current_State.md
- docs/Manual_Verification_Guide.md
- docs/Known_Issues_And_Followups.md

Implement only the following ticket:

[PASTE TICKET HERE]

Important rules:

- Implement this ticket only.
- Do not implement future-ticket features.
- Do not refactor unrelated code.
- Do not add AI detection unless the ticket asks for it.
- Do not add video export unless the ticket asks for it.
- Keep the source comic page as the base canvas.
- Camera shots should be stored in source image coordinate space.
- Run available checks before finishing.

At the end, return this completion report:

Summary:
Files changed:
Commands run:
Build/test results:
Manual verification steps:
Risks or limitations:
Suggested follow-up tickets:
Docs that should be updated:
```
```

## Example Command Style With ChatGPT

Ask ChatGPT:

```txt
/codex T0001
```

Expected result:

ChatGPT should generate a complete Codex-ready prompt for ticket T0001 using the format above.

