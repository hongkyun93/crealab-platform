---
description: Synchronization policy for Collaboration Workspace UI
---

# Collaboration Workspace Synchronization

Whenever changes are made to the **Collaboration Workspace (Deal Room)** UI or logic in either the Brand or Creator dashboard, the following steps MUST be followed to maintain consistency:

## 1. Identify Target Files
- Brand Workspace: `/app/brand/page.tsx`
- Creator Workspace: `/app/creator/page.tsx`

## 2. Synchronization Rules
- **UI Consistency**: Ensure high-fidelity design elements (sidebar, tabs, typography, shadows) are identical unless a role-specific difference is required.
- **Role Adaptation**: 
    - In Brand view, "User" is the Brand, and "Other Party" is the Creator (Influencer).
    - In Creator view, "User" is the Creator, and "Other Party" is the Brand.
    - Update avatars, names, and labels (e.g., "Brand Message" vs "My Message") accordingly.
- **Logic Sync**:
    - Message sending/receiving logic must be consistent.
    - Contract generation and signing flow must remain aligned in both views.
    - Workflow status steps must match for both parties.

## 3. Implementation Workflow
- After modifying one dashboard, proactively check the other dashboard's implementation.
- Copy the relevant JSX/logic and adapt the roles.
- Run `npm run build` to ensure both files remain error-free.
