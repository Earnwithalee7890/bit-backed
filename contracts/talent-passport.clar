;; Talent Passport Contract
;; Represents the reputation profile and verifiable credentials of a user on Stacks

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))
(define-constant err-unauthorized (err u103))

;; Data Maps
(define-map profiles
  principal
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
)

(define-map username-to-address
  (string-ascii 80)
  principal
)

;; Read-Only Functions
(define-read-only (get-profile (user principal))
  (map-get? profiles user)
)

(define-read-only (get-profile-by-username (username (string-ascii 80)))
  (match (map-get? username-to-address username)
    user (ok (map-get? profiles user))
    (err err-not-found)
  )
)

(define-read-only (get-reputation (user principal))
  (default-to u0 (get reputation-score (map-get? profiles user)))
)

(define-read-only (get-total-backing (user principal))
  (default-to u0 (get total-backing (map-get? profiles user)))
)

;; Public Functions

;; Register a new profile
(define-public (register-profile (username (string-ascii 80)) (bio (string-utf8 256)) (avatar-url (string-ascii 256)) (github (string-ascii 80)) (twitter (string-ascii 80)))
  (let
    (
      (user tx-sender)
    )
    ;; Check if profile already exists for sender
    (asserts? (is-none (map-get? profiles user)) (err err-already-exists))
    ;; Check if username is already taken
    (asserts? (is-none (map-get? username-to-address username)) (err err-already-exists))
    
    ;; Save profile
    (map-set profiles user {
      username: username,
      bio: bio,
      avatar-url: avatar-url,
      github: github,
      twitter: twitter,
      reputation-score: u100, ;; Initial reputation score
      total-backing: u0,
      is-verified: false
    })
    
    ;; Map username to address
    (map-set username-to-address username user)
    (ok true)
  )
)

;; Update existing profile details
(define-public (update-profile (bio (string-utf8 256)) (avatar-url (string-ascii 256)) (github (string-ascii 80)) (twitter (string-ascii 80)))
  (let
    (
      (user tx-sender)
      (existing-profile (unwrap! (map-get? profiles user) (err err-not-found)))
    )
    (map-set profiles user (merge existing-profile {
      bio: bio,
      avatar-url: avatar-url,
      github: github,
      twitter: twitter
    }))
    (ok true)
  )
)

;; Admin verifies a profile
(define-public (verify-profile (user principal) (status bool))
  (begin
    (asserts? (is-eq tx-sender contract-owner) (err err-owner-only))
    (let
      (
        (existing-profile (unwrap! (map-get? profiles user) (err err-not-found)))
      )
      (map-set profiles user (merge existing-profile {
        is-verified: status,
        reputation-score: (+ (get reputation-score existing-profile) (if status u50 u0)) ;; Add 50 points if verified
      }))
      (ok true)
    )
  )
)

;; Internal/Public Helper: Update reputation score & backing.
(define-public (update-reputation-and-backing (user principal) (reputation-change int) (backing-change int))
  (let
    (
      (existing-profile (unwrap! (map-get? profiles user) (err err-not-found)))
      (current-reputation (get reputation-score existing-profile))
      (current-backing (get total-backing existing-profile))
      ;; Handle signed integer reputation change
      (new-reputation (if (>= reputation-change 0)
                          (+ current-reputation (to-uint reputation-change))
                          (if (> current-reputation (to-uint (- 0 reputation-change)))
                              (- current-reputation (to-uint (- 0 reputation-change)))
                              u0)))
      ;; Handle signed integer backing change
      (new-backing (if (>= backing-change 0)
                       (+ current-backing (to-uint backing-change))
                       (if (> current-backing (to-uint (- 0 backing-change)))
                           (- current-backing (to-uint (- 0 backing-change)))
                           u0)))
    )
    ;; In a real setup, we would restrict this to only the staking contract
    (map-set profiles user (merge existing-profile {
      reputation-score: new-reputation,
      total-backing: new-backing
    }))
    (ok true)
  )
)
