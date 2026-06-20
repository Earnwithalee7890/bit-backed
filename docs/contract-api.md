# BitBacked Stacks Clarity Contract API Reference

Welcome to the **BitBacked Stacks L2 Smart Contract Developer API Reference**. This document outlines the maps, constants, public functions, read-only interfaces, and error codes for the three core Clarity contracts driving the Bitcoin reputation and backing layer on Stacks Mainnet.

---

## 1. Talent Passport Contract (`talent-passport`)

The `talent-passport` contract serves as the global on-chain reputation registry. It manages developer profiles, links, verification status, and reputation score updates.

### Error Codes
| Constant Name | Exit Code | Description |
|---|---|---|
| `err-owner-only` | `u100` | Operation restricted to the contract owner. |
| `err-not-found` | `u101` | Requested profile does not exist. |
| `err-already-exists` | `u102` | Username or passport is already registered. |
| `err-unauthorized` | `u103` | Operation unauthorized by the caller. |

### Data Maps

#### `profiles`
Stores the complete state profile of a developer passport.
*   **Key**: `principal` (user)
*   **Value Schema**:
    ```clarity
    {
      username: (string-ascii 80),
      bio: (string-utf8 256),
      avatar-url: (string-ascii 256),
      github: (string-ascii 80),
      twitter: (string-ascii 80),
      reputation-score: uint,
      total-backing: uint,
      is-verified: bool
    }
    ```

#### `username-to-address`
Ensures username uniqueness and supports address lookup.
*   **Key**: `(string-ascii 80)` (username)
*   **Value**: `principal` (user)

### Read-Only Functions

#### `get-profile`
Retrieves a developer profile by their wallet address.
*   **Parameters**: `(user principal)`
*   **Returns**: `(optional profile)`

#### `get-profile-by-username`
Retrieves a developer profile using their unique username.
*   **Parameters**: `(username (string-ascii 80))`
*   **Returns**: `(response profile uint)` (returns `err-not-found` if username is not registered)

#### `get-reputation`
Gets the reputation score of a user. Returns `u0` if no profile exists.
*   **Parameters**: `(user principal)`
*   **Returns**: `uint`

#### `get-total-backing`
Gets the total backing pool quantity of TAL staked on a user. Returns `u0` if no profile exists.
*   **Parameters**: `(user principal)`
*   **Returns**: `uint`

### Public Functions

#### `register-profile`
Registers a new developer passport. Inits with `u100` reputation score.
*   **Parameters**:
    *   `username`: `(string-ascii 80)`
    *   `bio`: `(string-utf8 256)`
    *   `avatar-url`: `(string-ascii 256)`
    *   `github`: `(string-ascii 80)`
    *   `twitter`: `(string-ascii 80)`
*   **Returns**: `(response bool uint)`

#### `update-profile`
Updates a user's own profile info (bio, avatar, socials).
*   **Parameters**:
    *   `bio`: `(string-utf8 256)`
    *   `avatar-url`: `(string-ascii 256)`
    *   `github`: `(string-ascii 80)`
    *   `twitter`: `(string-ascii 80)`
*   **Returns**: `(response bool uint)`

#### `verify-profile`
Enables the contract owner to verify or revoke a developer passport. Grants `+50` reputation points upon verification.
*   **Parameters**:
    *   `user`: `principal`
    *   `status`: `bool`
*   **Returns**: `(response bool uint)`

#### `update-reputation-and-backing`
Internal helper called by staking systems to increment or decrement reputation scores and backing tokens.
*   **Parameters**:
    *   `user`: `principal`
    *   `reputation-change`: `int`
    *   `backing-change`: `int`
*   **Returns**: `(response bool uint)`

---

## 2. Talent Token Contract (`talent-token`)

The `talent-token` contract implements the Stacks standard **SIP-010** fungible token interface representing the utility utility/governance token `TAL`.

### Error Codes
| Constant Name | Exit Code | Description |
|---|---|---|
| `err-owner-only` | `u100` | Operation restricted to the transaction sender or authorized contracts. |
| `err-not-found` | `u101` | Resource or address not found. |

### Read-Only Functions

#### `get-name`
Returns the human-readable name of the token.
*   **Returns**: `(ok "Talent Protocol Token")`

#### `get-symbol`
Returns the ticker symbol.
*   **Returns**: `(ok "TAL")`

#### `get-decimals`
Returns token decimal places (fixed to `u6`).
*   **Returns**: `(ok u6)`

#### `get-balance`
Returns the balance of TAL for the requested user.
*   **Parameters**: `(user principal)`
*   **Returns**: `(ok uint)`

#### `get-total-supply`
Returns total supply of TAL minted on-chain.
*   **Returns**: `(ok uint)`

#### `get-token-uri`
Returns standard metadata URI path.
*   **Returns**: `(ok (some u"https://raw.githubusercontent.com/talentprotocol/branding/main/tal-token-metadata.json"))`

### Public Functions

#### `transfer`
Standard SIP-010 token transfer function.
*   **Parameters**:
    *   `amount`: `uint`
    *   `sender`: `principal`
    *   `recipient`: `principal`
    *   `memo`: `(optional (buff 34))`
*   **Returns**: `(response bool uint)`

#### `mint`
Mints new TAL tokens. Restricted to authorized protocols (such as staking reward payouts).
*   **Parameters**:
    *   `amount`: `uint`
    *   `recipient`: `principal`
*   **Returns**: `(response bool uint)`

#### `burn`
Destroys a quantity of TAL tokens from a user balance.
*   **Parameters**:
    *   `amount`: `uint`
    *   `sender`: `principal`
*   **Returns**: `(response bool uint)`

---

## 3. Talent Staking Contract (`talent-staking`)

The `talent-staking` contract handles backing pools, enabling users to stake TAL tokens on developer profiles to boost developer reputation and earn block-based yields.

### Error Codes
| Constant Name | Exit Code | Description |
|---|---|---|
| `err-invalid-amount` | `u200` | Staked or unstaked amount must be greater than zero. |
| `err-no-stake` | `u201` | No active stake exists to perform this action. |
| `err-insufficient-balance` | `u202` | Staker doesn't have enough staked balance to unstake. |

### Data Maps

#### `stakes`
Maps stakers backing developer profiles.
*   **Key**: `{ staker: principal, talent: principal }`
*   **Value Schema**:
    ```clarity
    {
      amount: uint,
      block-height: uint
    }
    ```

### Read-Only Functions

#### `get-stake`
Gets the staking details between a backing user and a talent.
*   **Parameters**:
    *   `staker`: `principal`
    *   `talent`: `principal`
*   **Returns**: `{ amount: uint, block-height: uint }`

#### `calculate-rewards`
Calculates pending unclaimed TAL staking yields.
*   **Formula**:
    $$\text{Yield} = \frac{\text{Staked Amount} \times \text{Blocks Passed} \times 100}{1,000,000}$$
    *(Yield is equal to 0.01% of staked amount per block)*
*   **Parameters**:
    *   `staker`: `principal`
    *   `talent`: `principal`
*   **Returns**: `uint`

### Public Functions

#### `stake`
Stakes TAL tokens to back a talent. Transports tokens to the staking escrow, updates developer backing, and increases reputation score.
*   **Parameters**:
    *   `talent`: `principal`
    *   `amount`: `uint`
*   **Returns**: `(response bool uint)`

#### `unstake`
Unstakes TAL tokens from backing a talent. Automatically claims pending reward yields, burns/refunds escrowed tokens, and reduces the developer's reputation score and backing pool.
*   **Parameters**:
    *   `talent`: `principal`
    *   `amount`: `uint`
*   **Returns**: `(response bool uint)`

#### `claim-rewards`
Claims pending reward yields without unstaking the principal balance. Resets the block height marker.
*   **Parameters**:
    *   `talent`: `principal`
*   **Returns**: `(response bool uint)`
