# FinPlan Advisor

## Current State
Full-stack financial planning tool for Indian advisors with client management, Monte Carlo simulation, SIP calculator, retirement bucket strategy, stress testing, and an advisor dashboard. All monetary values are in INR (₹).

The backend uses an `autoRegisterAndCheck` function that is supposed to auto-register new users on first call, but it has a critical bug: it calls `AccessControl.hasPermission` → `getUserRole` which **traps** ("User is not registered") before the user is ever added to the roles map. The user never gets registered, so every `addClient` / `listClients` / any backend call fails.

## Requested Changes (Diff)

### Add
- Nothing new to add

### Modify
- `autoRegisterAndCheck` in `main.mo`: Before calling `AccessControl.hasPermission`, check if the caller is already in `accessControlState.userRoles`. If not present (and not anonymous), add them as `#user` first. This ensures first-time callers are registered before permission is checked, eliminating the "User is not registered" trap.

### Remove
- Nothing to remove

## Implementation Plan
1. Regenerate backend Motoko with the fixed `autoRegisterAndCheck` logic:
   - Check `accessControlState.userRoles.get(caller)` first
   - If `null`, call `accessControlState.userRoles.add(caller, #user)` to register them
   - Then proceed with `AccessControl.hasPermission` check
   - This mirrors what `AccessControl.initialize` does but inline, so it works regardless of whether `_initializeAccessControlWithSecret` was called first
