# Rules for AI Assistant (Antigravity) — Project Level (Crealab / CreadyPick)

These rules apply specifically to the Crealab/CreadyPick codebase and extend the global rules.

## Mobile Layout Rules (ABSOLUTE — Never Break These)

1. **No Horizontal Scroll — Ever**: NEVER use `overflow-x-auto`, `overflow-x-scroll`, or any horizontal scrolling technique for mobile layout optimization, regardless of context (tabs, filters, tags, chips, etc.). If content overflows on mobile, solve it with `flex-wrap`, reduced sizing (`text-xs`, `px-2`, `py-1`), grid layouts, or collapsing/hiding items. Horizontal scroll is NEVER an acceptable solution.

2. **Mobile Optimization Must Not Break Desktop**: Any mobile layout change MUST be scoped strictly using Tailwind responsive prefixes (`sm:`, `md:`, `lg:`). A mobile-only fix must NEVER alter the appearance or behavior of the desktop web layout. Always double-check that classes applied without a responsive prefix do not unintentionally affect larger viewports.

## General Code Rules

3. **Permission Required for Deletion/Change**: Do not delete or significantly change existing features without explicit user permission.
4. **Preserve Original Functionality**: When simplifying or refactoring UI code, ensure ALL original functionality and fields are preserved unless explicitly instructed to remove them.
5. **No Guesswork in Debugging**: Read the code thoroughly to find the exact root cause before making any changes. Do NOT make changes based on guesses.
6. **Analyze First, Edit Later**: When the user asks a question, provide a precise answer with the root cause and a proposed solution plan first. Do NOT edit code immediately. Wait for permission.
