# Open Source

The project should remain transparent and easy for contributors to understand.

- Document product and architecture changes in `docs/project-context/`
- Keep privacy and user control visible in the implementation and docs
- Treat optional user-provided AI keys as opt-in, not required infrastructure
- Keep local secret scaffolding explicit: `.env` stays ignored, `.env.example` documents the contract, and docs must say when a key is only reserved for future use
- Preserve a clear paper trail for recommendation and ML decisions
- Prefer page-specific extraction contracts over opaque, hardcoded-only recommendation behavior
- Keep generated artifacts reproducible and documented, but do not commit oversized local evaluation binaries that exceed normal Git hosting limits
