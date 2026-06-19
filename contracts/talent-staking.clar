;; Talent Staking Contract
;; Allows users to stake TAL tokens to support talents, increasing their reputation score and generating yield

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-invalid-amount (err u200))
(define-constant err-no-stake (err u201))
(define-constant err-insufficient-balance (err u202))

;; Data Maps
;; Maps (staker, talent) -> (staked-amount, last-reward-block)
(define-map stakes
  { staker: principal, talent: principal }
  { amount: uint, block-height: uint }
)

;; Read-Only Functions
(define-read-only (get-stake (staker principal) (talent principal))
  (default-to { amount: u0, block-height: u0 } (map-get? stakes { staker: staker, talent: talent }))
)

;; Calculate pending rewards
;; Simple algorithm: 1 token staked for 1 block generates 0.0001 TAL (100 micro-TAL) reward
(define-read-only (calculate-rewards (staker principal) (talent principal))
  (let
    (
      (stake-info (get-stake staker talent))
      (amount (get amount stake-info))
      (start-block (get block-height stake-info))
      (blocks-passed (- block-height start-block))
    )
    (if (> amount u0)
      ;; reward = amount * blocks * 100 / 1000000 (e.g., 0.01% per block)
      (/ (* (* amount blocks-passed) u100) u1000000)
      u0
    )
  )
)

;; Public Functions

;; Stake TAL on a talent
(define-public (stake (talent principal) (amount uint))
  (let
    (
      (staker tx-sender)
      (stake-info (get-stake staker talent))
      (current-staked (get amount stake-info))
      (new-staked (+ current-staked amount))
    )
    (asserts? (> amount u0) (err-invalid-amount))
    
    ;; 1. Transfer TAL from staker to contract
    (try! (contract-call? .talent-token transfer amount staker (as-contract tx-sender) none))
    
    ;; 2. Update the stake details
    (map-set stakes
      { staker: staker, talent: talent }
      { amount: new-staked, block-height: block-height }
    )
    
    ;; 3. Update talent profile reputation and total backing
    ;; 1 token = 1 reputation point & 1 backing units
    (try! (contract-call? .talent-passport update-reputation-and-backing talent (to-int amount) (to-int amount)))
    
    (ok true)
  )
)

;; Unstake TAL from a talent
(define-public (unstake (talent principal) (amount uint))
  (let
    (
      (staker tx-sender)
      (stake-info (get-stake staker talent))
      (current-staked (get amount stake-info))
    )
    (asserts? (> amount u0) (err-invalid-amount))
    (asserts? (>= current-staked amount) (err-insufficient-balance))
    
    ;; 1. Calculate and distribute pending rewards before modifying stake amount
    (let
      (
        (rewards (calculate-rewards staker talent))
      )
      (if (> rewards u0)
        (try! (as-contract (contract-call? .talent-token mint rewards staker)))
        u0
      )
    )
    
    ;; 2. Transfer TAL back from contract to staker
    (try! (as-contract (contract-call? .talent-token transfer amount tx-sender staker none)))
    
    ;; 3. Update stake details
    (map-set stakes
      { staker: staker, talent: talent }
      { amount: (- current-staked amount), block-height: block-height }
    )
    
    ;; 4. Update talent profile backing and reputation (negative change)
    (try! (contract-call? .talent-passport update-reputation-and-backing talent (- 0 (to-int amount)) (- 0 (to-int amount))))
    
    (ok true)
  )
)

;; Claim pending rewards
(define-public (claim-rewards (talent principal))
  (let
    (
      (staker tx-sender)
      (stake-info (get-stake staker talent))
      (amount (get amount stake-info))
      (rewards (calculate-rewards staker talent))
    )
    (asserts? (> amount u0) (err-no-stake))
    (asserts? (> rewards u0) (err-invalid-amount))
    
    ;; Mint new rewards to staker
    (try! (as-contract (contract-call? .talent-token mint rewards staker)))
    
    ;; Update block-height to now
    (map-set stakes
      { staker: staker, talent: talent }
      { amount: amount, block-height: block-height }
    )
    (ok true)
  )
)
