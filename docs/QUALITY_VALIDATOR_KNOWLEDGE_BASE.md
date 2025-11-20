# QUALITY VALIDATOR KNOWLEDGE BASE

**Auto-Generated Knowledge Base** - Updated: 2025-11-20T00:00:00.000Z

This knowledge base is automatically maintained by the Quality Validator Agent.

---

## Common Issues

### TypeScript Validation Failures

**Problem:**
Generated code passes syntax checks but fails TypeScript type validation.

**Solution:**
1. Run `tsc --noEmit` to check types without compiling
2. Verify all imports have correct type definitions
3. Check that shared/schema.ts types are properly exported
4. Ensure Zod schemas match TypeScript interfaces
5. Use LSP diagnostics for real-time type checking

**Pattern:**
For TypeScript validation:
- Always use LSP before applying changes
- Import types from shared/schema.ts
- Match Zod schemas to TypeScript types
- Check generic type parameters
- Verify return types match expectations

---

### Accessibility (a11y) Issues

**Problem:**
Generated UI components fail accessibility validation.

**Solution:**
1. Add data-testid to all interactive elements
2. Ensure proper ARIA labels on buttons/links
3. Verify keyboard navigation works
4. Check color contrast ratios
5. Add alt text to images
6. Use semantic HTML elements

**Pattern:**
Accessibility checklist:
- data-testid on all interactive elements
- aria-label or label text on inputs
- alt text on images
- semantic HTML (button, nav, main, etc.)
- keyboard navigation support
- sufficient color contrast
- focus indicators visible

---

## Best Practices

### Pre-Apply Validation
- Run LSP diagnostics before applying
- Check syntax with parser
- Validate file permissions
- Verify imports exist
- Test compilation

### Quality Metrics
- TypeScript: 0 errors required
- Accessibility: WCAG AA minimum
- Performance: Lighthouse score >90
- Security: No exposed secrets
- Code style: Matches existing patterns

### Learning Loop
- Track common validation failures
- Update validation rules based on patterns
- Share quality insights with other agents
- Auto-fix known issues when possible

---
