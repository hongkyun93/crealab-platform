# User Roles vs User Types Code Audit

## Executive Summary
- **`role` (`profiles.role`)**: The **primary source of truth** for user identity and permissions. Used for routing, auth logic, and feature access.
- **`user_type` (`profiles.user_type`)**: A **secondary/legacy field** used for high-level grouping (e.g., grouping MCN/Agency under 'brand' for shared UI logic). It is often used as a fallback.
- **`role` (`team_members.role`)**: A **completely separate field** defining a user's permission level within a specific team (e.g., Owner, Manager), unrelated to their global system role.

---

## 1. Role (`profiles.role`)
**Definition:** The specific, granular identity of a user.
**Location:** Database `profiles` table.
**Values:** `'brand'`, `'creator'`, `'mcn'`, `'agency'`, `'admin'`

### Usage in Codebase
| Context | File | Purpose |
| :--- | :--- | :--- |
| **Login Redirect** | `app/login/page.tsx` | Determines destination: `/brand` (for brand/mcn/agency), `/creator`, or `/admin`. |
| **Auth Callback** | `app/auth/callback/route.ts` | Used to sync Supabase Auth metadata with the database profile. |
| **Auth Context** | `components/providers/auth-provider.tsx` | The primary value mapped to the application-wide `User.type` property. |
| **Onboarding** | `app/onboarding/page.tsx` | The value selected by the user to determine their account type. |

---

## 2. User Type (`profiles.user_type`)
**Definition:** A broad categorization field (Buyer vs Seller).
**Location:** Database `profiles` table.
**Values:** `'brand'` (includes Brand, Agency, MCN) vs `'creator'`.

### Usage in Codebase
| Context | File | Purpose |
| :--- | :--- | :--- |
| **Legacy/Fallback** | `components/providers/auth-provider.tsx` | Used as a fallback if `role` is missing: `type: profile.role || profile.user_type`. |
| **Onboarding** | `app/onboarding/page.tsx` | Automatically set based on role selection: <br>`brand/agency/mcn` → `'brand'`<br>`creator` → `'creator'` |
| **Database Migrations** | `documents/*.sql` | Often used in migration scripts to broadly target "influencers" vs "brands". |
| **Testing Scripts** | `scripts/*.ts` | Frequently used in test scripts to verify user creation logic. |

---

## 3. Team Role (`team_members.role`) - **DISTINCT FIELD**
**Definition:** Permission level within a generic Team. **NOT** the same as the user's system role.
**Location:** Database `team_members` table.
**Values:**
- `'owner'`: Team creator, full access.
- `'manager'`: Can manage members/campaigns.
- `'employee'`: Standard employee access.
- `'creator'`: Read-only or specific creator access within a team.
- `'member'`: Basic access.

### Usage in Codebase
| Context | File | Purpose |
| :--- | :--- | :--- |
| **Team Settings** | `app/settings/team/page.tsx` | Managed via the "Team Settings" UI. Controls what a user can do *inside that specific team*. |
| **Team Logic** | `lib/types/team.ts` | Defined in the `TeamRole` type definition. |

---

## Conclusion & Recommendation
1. **Trust `profiles.role`**: Always prioritize `role` for business logic and feature flags.
2. **Maintain `user_type`**: Keep populating it for backward compatibility and broad "Buyer vs Seller" checks, but do not rely on it for specific features (like MCN vs Brand).
3. **Be Careful with "Creator"**: The term "Creator" exists as a system role (`profiles.role = 'creator'`) AND as a team permission level (`team_members.role = 'creator'`). Context is key.
