# Security Specification for VegasBet

## 1. Data Invariants
- A user can only access and update their own profile `/users/{userId}`.
- Balance modifications must be non-negative.
- Users can only read and write their own subcollections `/users/{userId}/bets/{betId}` and `/users/{userId}/transactions/{txId}`.
- Identity UID must match `request.auth.uid`.

## 2. Dirty Dozen Test Payloads
1. Unauthenticated write to `/users/user123` -> Rejected.
2. User A updating User B's balance in `/users/userB` -> Rejected.
3. User A creating a bet under `/users/userB/bets/bet1` -> Rejected.
4. Setting a negative balance -> Rejected.
5. Setting a 1MB string in `displayName` -> Rejected.
6. Accessing `/users/{userId}` as a non-owner -> Rejected.
7. Deleting another user's transaction -> Rejected.
8. Writing arbitrary fields on `/users/{userId}` without valid uid -> Rejected.
9. Modifying `createdAt` timestamp on update -> Rejected.
10. Querying all users' bets without filtering by owner -> Rejected.
11. Spoofing auth claims or writing unverified user data -> Rejected.
12. Creating a bet with zero or negative stake -> Rejected.
