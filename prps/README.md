# Find-a-Day -- Project Refactor Plans (PRPs)

## Execution Roadmap

| PRP | Title | Priority | Effort | Status |
|-----|-------|----------|--------|--------|
| [PRP1](PRP1-secure-firebase-rules.md) | Secure Firebase Rules & Prevent Unauthorized Writes | CRITICAL | Medium | Planned |
| [PRP2](PRP2-data-architecture-refactor.md) | Data Architecture Refactor -- Flatten Availability Data | CRITICAL | Large | Planned |
| [PRP3](PRP3-query-listener-optimization.md) | Query & Listener Optimization -- Eliminate Duplicate Downloads | HIGH | Medium | Planned |
| [PRP4](PRP4-heatmap-frontend-performance.md) | Heatmap & Frontend Performance -- Fix O(n) Lookups | HIGH | Small | Planned |
| [PRP5](PRP5-concurrency-transaction-safety.md) | Concurrency & Transaction Safety | HIGH | Medium | Planned |
| [PRP6](PRP6-system-limits-guardrails.md) | System Limits & Guardrails | MEDIUM | Small | Planned |
| [PRP7](PRP7-abuse-prevention-rate-limiting.md) | Abuse Prevention & Rate Limiting | MEDIUM | Medium | Planned |
| [PRP8](PRP8-cron-cleanup-improvements.md) | Cron/Cleanup Improvements | MEDIUM | Small | Planned |
| [PRP9](PRP9-stress-testing-infrastructure.md) | Stress Testing Infrastructure | LOW | Medium | Planned |

## Dependency Graph

```
PRP1 (Security) -----> can be done independently
PRP2 (Data Arch) ----> depends on PRP1 for full rule coverage
PRP3 (Listeners) ----> depends on PRP2 for meta/ restructure
PRP4 (Performance) --> can be done independently (standalone perf fix)
PRP5 (Concurrency) --> can be done independently; benefits from PRP2
PRP6 (Guardrails) ---> can be done independently; overlaps with PRP1 rules
PRP7 (Rate Limit) ---> can be done independently
PRP8 (Cron) ---------> can be done independently; depends on PRP3 if meta/ exists
PRP9 (Stress Test) --> should be done after PRP2-PRP6 to test final architecture
```

## Recommended Execution Order

1. **PRP1** -- Security first (closes critical vulnerability)
2. **PRP4** -- Quick win (small effort, immediate perf improvement)
3. **PRP6** -- Quick win (adds guardrails, small effort)
4. **PRP2** -- Major architecture change (biggest impact)
5. **PRP3** -- Listener optimization (builds on PRP2)
6. **PRP5** -- Concurrency fixes (benefits from PRP2)
7. **PRP7** -- Rate limiting (independent, medium effort)
8. **PRP8** -- Cron improvements (small, independent)
9. **PRP9** -- Stress testing (validates all previous PRPs)
