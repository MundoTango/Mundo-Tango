# MR BLUE VISUAL EDITOR KNOWLEDGE BASE

**Auto-Generated Knowledge Base** - Updated: 2025-11-20T00:00:00.000Z

This knowledge base is automatically maintained by the Mr Blue Visual Editor Agent.

---

## Common Issues

### Code Generation Fails with TypeScript Errors

**Problem:**
User requests code generation but the generated code has TypeScript type errors that prevent compilation.

**Solution:**
1. Always check existing imports and types in the target files
2. Use the correct type definitions from shared/schema.ts3. Verify that all dependencies are installed in package.json
4. Run LSP diagnostics before finalizing code changes

**Pattern:**
When generating code, always:
- Read existing file structure first
- Import types from shared schema
- Validate with TypeScript compiler
- Check LSP before applying changes

---

## Best Practices

### Preference Learning
- Extract preferences from every user interaction
- Build preference context before each code generation
- Apply learned preferences automatically without asking

### Error Prevention
- Query error patterns before generating code
- Check for known failures matching the current request
- Apply suggested fixes from error knowledge base

### Code Quality
- Always validate generated code with LSP
- Run syntax checks before applying
- Ensure all imports are correct
- Verify file paths exist

---
