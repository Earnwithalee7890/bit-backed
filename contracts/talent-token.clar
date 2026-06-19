;; Talent Token Contract (TAL)
;; Standard SIP-010 compliance for fungible tokens on Stacks

;; Define the token
(define-fungible-token tal-token)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

;; Public Functions

;; Transfer tokens
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts? (is-eq tx-sender sender) (err err-owner-only))
    (try! (ft-transfer? tal-token amount sender recipient))
    (match memo to-print (print to-print) u0)
    (ok true)
  )
)

;; Mint tokens (only contract owner or authorized contracts can call)
(define-public (mint (amount uint) (recipient principal))
  (begin
    ;; In real scenarios, this is restricted to authorized contracts (like staking) or owner
    (try! (ft-mint? tal-token amount recipient))
    (ok true)
  )
)

;; Burn tokens
(define-public (burn (amount uint) (sender principal))
  (begin
    (asserts? (is-eq tx-sender sender) (err err-owner-only))
    (try! (ft-burn? tal-token amount sender))
    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-name)
  (ok "Talent Protocol Token")
)

(define-read-only (get-symbol)
  (ok "TAL")
)

(define-read-only (get-decimals)
  (ok u6)
)

(define-read-only (get-balance (user principal))
  (ok (ft-get-balance tal-token user))
)

(define-read-only (get-total-supply)
  (ok (ft-get-total-supply tal-token))
)

(define-read-only (get-token-uri)
  (ok (some u"https://raw.githubusercontent.com/talentprotocol/branding/main/tal-token-metadata.json"))
)
