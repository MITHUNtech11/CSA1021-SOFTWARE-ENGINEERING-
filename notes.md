# CSA1021 - Software Engineering: Exam & Viva Revision Guide
## Assignment 1 (CO1): Agile Delivery Strategy for the Omnichannel Order Fulfilment Platform
**Student:** S Mithun Senthil | **Register Number:** 192324056 | **Department:** CSE, SIMATS Engineering

---

## 1. Quick Scenario & Constraint Summary
* **Business Context:** A multi-channel retailer (Website, Mobile App, 12 physical stores) suffers from order failures, stock mismatches, slow refunds, and unclear order status.
* **Core Goal:** Design, simulate, and scale an 8-week MVP delivery strategy before a fixed festival-sale date.
* **Core Constraints:**
  1. **Fixed Deadline:** 8 weeks (4 two-week sprints).
  2. **Zero Historical Velocity:** Brand-new 7-member cross-functional team.
  3. **Hardware & External Dependency Latency:**
     * Payment Gateway Sandbox access delayed to **Week 4** (Sprint 2 end / Sprint 3 start).
     * Physical Barcode Scanner arrives in **Week 5** (Sprint 3).
  4. **Limited Stakeholder Availability:** Warehouse pickers and finance reviewers can attend meetings for **only 90 minutes per week**.
  5. **Scope Challenge:** Management asked for all 9 modules, but team must deliver a thin, fully working **order-to-delivery-to-refund** journey.

---

## 2. High-Yield Task Summaries (Tasks 1 to 7)

### Task 1: Problem Investigation & Delivery Outcomes (5 Marks)
* **5 Key Personas & Their Pain Points:**
  1. *Customer:* Carts get cancelled after payment due to phantom stock; refund delays exceed 14 days.
  2. *Warehouse Picker:* Pick lists show items already claimed or out of physical location; manual reconciliation slows dispatch.
  3. *Support Agent:* "Blind transfers"—no unified visibility into whether an order is in picking, dispatch, or return status.
  4. *Finance Reviewer:* No audit trail linking automated refund requests to manager sign-offs and gateway transaction IDs.
  5. *Development Team:* Undocumented legacy dependencies, lack of sandbox APIs, high risk of double-charging customers.
* **4 Core Investigative Questions:**
  1. *Inventory race conditions:* Why does stock shown as available online fail during warehouse picking?
  2. *Refund governance:* What approval hierarchy prevents unauthorized refund payouts?
  3. *Gateway outages:* How can checkout recover gracefully when the gateway times out without double-charging?
  4. *Status visibility:* Which lifecycle events must be visible to customer self-service vs. internal support?
* **Scope Strategy (In-Scope vs. Deferred):**
  * **In-Scope (MVP Journey):** Authenticated checkout, stock reservation with TTL lock, idempotent payment intent, warehouse pick list, dispatch tracking, customer return request, finance refund approval, fixed low-stock threshold.
  * **Deferred Scope (Roadmap):** Machine learning demand forecasting, recommendation engine, multi-currency checkout, customer loyalty rewards, real-time sales analytics dashboard.
  * *Reason for Deferral:* Analytics and AI models are meaningless if underlying inventory transactions and payment reconciliation are inaccurate.
* **4 Measurable Success Criteria:**
  1. *Zero Over-Allocation:* 100% rejection rate for checkout requests when unreserved stock reaches 0.
  2. *Payment Idempotency:* 0 duplicate payment charges on repeated client retries with identical keys.
  3. *Auditable Refunds:* 100% of approved refunds carry timestamp, approver ID, and gateway reference.
  4. *Support Lookup Speed:* P95 order query latency < 500 ms across store and web channels.
* **Feasibility Triad:**
  * *Technical:* Feasible via modular REST contracts, Redis TTL reservation locks, and mock payment stubs.
  * *Operational:* 90-min/week stakeholder window fits neatly into sprint refinement and review.
  * *Financial:* Zero additional infrastructure expense; uses existing local development environments and open-source stacks.

---

### Task 2: Project Management Approach Design & Justification (6 Marks)
* **Framework Comparison:**
  * *Option A: Scrum with Lean Flow Controls (Selected)*
    * Fixed 2-week timeboxes provide predictable cadences for scarce 90-min stakeholder availability.
    * Work-in-Progress (WIP) limits prevent bottlenecks at testing.
    * Sprint goals protect the team from scope creep prior to the festival date.
  * *Option B: Continuous Kanban with Milestones (Rejected)*
    * Continuous pull lacks rigid cadence to lock down busy finance/warehouse managers.
    * Hard festival date risks slipping without intermediate sprint boundaries.
* **RACI Matrix & Team Responsibilities (7 Roles):**
  * *Product & Analysis Lead (1):* Accountable for backlog, user story acceptance, and stakeholder trade-offs.
  * *Frontend Engineer (1):* Responsible for responsive checkout, customer tracking, and support UI.
  * *Order API Engineer (1):* Responsible for order lifecycle state machine and idempotency contracts.
  * *Inventory & Data Engineer (1):* Responsible for warehouse stock reservation and pick-list generation.
  * *Payments & Security Engineer (1):* Responsible for gateway adapters, encryption, and audit logs.
  * *QA Engineer (1):* Responsible for automated acceptance tests, end-to-end testing, and quality gate sign-off.
  * *DevOps Engineer (1):* Responsible for CI/CD pipelines, containerization, and synthetic test environments.
* **Lean Flow Control Practices:**
  1. *Eliminating Waiting:* Build contract-first payment mock adapter in Sprint 1 so checkout development is not blocked waiting for Week 4 gateway access.
  2. *Eliminating Handovers:* End-to-end vertical user stories rather than horizontal architectural layers.
  3. *Eliminating Rework:* Enforce Definition of Ready with concrete negative acceptance examples (e.g., concurrency races).
  4. *Controlling WIP:* Strict column limits (Dev: 4, Review: 2, Test: 2) to prevent QA starvation or flooding.
* **Tool Justification (Jira Software vs. GitHub Projects):**
  * *Jira Software Selected:* Native support for Scrum boards, story points, custom WIP limits, release versioning, and burn-down reporting.
  * *Limitation & Mitigation:* Free tier limits audit logs and advanced permissions; mitigated via daily CSV backups and local repository branch protections.

---

### Task 3: Prioritized Product Backlog in Jira (8 Marks)
* **4 Core Epics:**
  1. `EPIC-01: ORD` – Core Order & Stock Synchronization
  2. `EPIC-02: PAY` – Payments & Refund Governance
  3. `EPIC-03: WHS` – Warehouse Fulfilment & Tracking
  4. `EPIC-04: OPS` – Platform Hardening, CI/CD & Support
* **13 User Stories Overview (S01 to S13):**
  * `S01` (Must / 3 pts): User Authentication & Role-Based Access Control (Security)
  * `S02` (Must / 5 pts): Stock Reservation with Expiry Lock on Checkout (Order API)
  * `S03` (Must / 5 pts): Idempotent Payment Request & Intent Logging (Payments)
  * `S04` (Must / 3 pts): Warehouse Pick-List Generation for Paid Orders (Inventory)
  * `S05` (Must / 5 pts): Dispatch Workflow & Order Status State Machine (Order API)
  * `S06` (Must / 3 pts): Customer Self-Service Tracking Portal (Frontend)
  * `S07` (Must / 3 pts): Return Request Initiation & Eligibility Validation (Order API)
  * `S08` (Must / 5 pts): Dual-Control Finance Refund Approval Workflow (Security)
  * `S09` (Must / 5 pts): Automated CI/CD Build & Smoke Verification Pipeline (DevOps)
  * `S10` (Should / 3 pts): Support Console Unified Order & Return Lookup (Frontend)
  * `S11` (Should / 3 pts): Rule-Based Low-Stock Reorder Alerting (Inventory)
  * `S12` (Should / 3 pts): Barcode Scanner Item Pick Confirmation (Inventory)
  * `S13` (Could / 3 pts - DEFERRED): Real-Time Executive Sales Analytics Dashboard (Frontend)
* **2 Key Stakeholder Conflict Resolutions:**
  1. *Stock Reservation (S02) vs. Executive Analytics (S13):* Marketing demanded sales dashboards; engineering chose stock reservation. Reason: Visualizing sales is useless if customers are oversold inventory that cannot be fulfilled.
  2. *Dual-Control Refund Approval (S08) vs. Instant Support Refunds:* Support wanted 1-click customer refunds; finance demanded dual approval. Reason: Financial leakage and compliance audits mandate human finance sign-off for payouts.
* **Quality & Governance Checklists:**
  * **Definition of Ready (DoR):** INVEST compliant, Gherkin acceptance criteria (positive + negative case), dependencies mapped, synthetic test data specified, fits single sprint.
  * **Definition of Done (DoD):** Peer-reviewed, unit test coverage ≥ 85%, server-side authorization verified, zero PII or credit card numbers logged (PCI-DSS), WCAG 2.1 AA accessible, clean CI build.

---

### Task 4: Capacity-Based Release Plan & Delivery Workflow (7 Marks)
* **Capacity Mathematics (The Formula):**
  * Team: 7 engineers.
  * Sprint Duration: 10 working days.
  * Nominal Hours/Day: 6 focused hours/day.
  * **Nominal Capacity:** $7 \times 10 \times 6 = 420\text{ hours}$.
  * **Buffer Reserve (20%):** Dedicated to ceremonies, reviews, defects, and integration ($420 \times 0.20 = 84\text{ hours}$).
  * **Effective Focused Capacity:** $420 - 84 = 336\text{ engineering hours}$.
  * **Provisional Velocity Ceiling:** Established at **16 Story Points** for Sprint 1 (treating points as relative complexity, not fixed hours).
* **Dependency Slicing Strategy:**
  * `S03` (Payment, 5 pts) split into `S03a` (Idempotency Key & Mock Stub, 2 pts, Sprint 1) and `S03b` (Live Sandbox Integration, 3 pts, Sprint 3).
  * `S09` (DevOps, 5 pts) split into `S09a` (Local Build & Smoke Tests, 3 pts, Sprint 1) and `S09b` (CI/CD Pipeline Hardening, 2 pts, Sprint 2).
* **4-Sprint Release Plan:**
  * **Sprint 1 (Weeks 1–2 / 16 pts):** Ordering & Reservation Foundation (`S01`, `S02`, `S03a`, `S04`, `S09a`).
  * **Sprint 2 (Weeks 3–4 / 13 pts):** Dispatch, Tracking, Alerts & CI Pipeline (`S05`, `S06`, `S11`, `S09b`).
  * **Sprint 3 (Weeks 5–6 / 14 pts):** Gateway Sandbox, Barcode Scanner & Refunds (`S03b`, `S07`, `S08`, `S12`).
  * **Sprint 4 (Weeks 7–8 / 3 pts):** Support Visibility, End-to-End Hardening & Release Rehearsal (`S10`). *Light sprint to absorb carryover and festival stabilization.*
* **Development Workflow vs. Order Lifecycle:**
  * *Software Development Workflow:* `Ready` $\rightarrow$ `In Progress` (WIP: 4) $\rightarrow$ `Review` (WIP: 2) $\rightarrow$ `Test` (WIP: 2) $\rightarrow$ `Done`. (Separate `Blocked` lane).
  * *Operational Order Lifecycle:* `Order Placed` $\rightarrow$ `Stock Reserved` $\rightarrow$ `Payment Captured` $\rightarrow$ `Picking` $\rightarrow$ `Dispatched` $\rightarrow$ `Delivered` $\rightarrow$ `Return Requested` $\rightarrow$ `Refunded`.
  * *Expedite Rule:* Maximum 1 urgent production defect permitted in development; requires removing an equivalent estimated story.

---

### Task 5: Delivery Simulation & Design Validation (7 Marks)
* **Pre-Simulation Bottleneck Hypothesis:**
  * The **Test column** and **order-to-payment integration** will bottleneck because only 1 QA engineer is available, and `S02` (Stock Locking) and `S03a` (Payment Stub) converge on transaction persistence.
* **12-Event Simulation Chronology (Key Milestones):**
  * *Event 4:* Session expiry test fails on `S01` $\rightarrow$ story returned to In Progress.
  * *Event 8:* Concurrency defect discovered in `S02` (two checkout carts reserved the same last inventory unit simultaneously) $\rightarrow$ `S02` held in Test.
  * *Event 10:* `S03a` blocked because payment intent requires `S02` order locking fix $\rightarrow$ blocked story-days accumulate.
  * *Event 11:* Database row-lock repair implemented; `S02` passes test $\rightarrow$ Done.
  * *Event 12:* Sprint ends; `S03a` and `S09a` remain incomplete.
* **Empirical Delivery Indicators (Sprint 1):**
  * *Planned vs. Completed:* 11 of 16 points completed (**68.8% Completion Ratio**).
  * *Carryover:* `S03a` (2 pts) and `S09a` (3 pts) carried over to Sprint 2.
  * *Blocked Story-Days:* 2 story-days logged on `S03a`.
  * *Test Queue Waiting:* Capped at 2 items; peak wait reduced to 1 day due to WIP limits.
  * *Reopened Stories:* 2 stories (`S01`, `S02`) reopened due to missing negative test cases.
* **Sprint 2 Adjustments (Feedback Loop):**
  1. Split complex stories into smaller vertical slices (e.g., split `S05` into Status API and Notification slices).
  2. Plan max 10 new points + 5 carried-over points.
  3. Schedule daily 30-min API/QA pairing session to write acceptance tests *before* code is submitted to review.

---

### Task 6: Scaled Delivery Redesign Under Changed Conditions (12 Marks)
* **The Day-4 Shock (5 Changed Parameters):**
  1. Two additional regional warehouses added (multi-warehouse inventory).
  2. Second 7-member cross-functional team (Team B) joins.
  3. Original payments engineer departs.
  4. Regional tax, shipping, and refund approval thresholds required.
  5. Festival release deadline remains **strictly fixed**.
* **Capacity Recalculation & Brooks' Law:**
  * *Brooks' Law:* "Adding manpower to a late software project makes it later." 13 engineers do NOT mean double output.
  * *Team A (6 members remaining):* $6 \times 10 \times 6 = 360\text{ nominal hours}$.
  * *Team B (7 new members):* Only 60% productive in first sprint due to onboarding ($7 \times 10 \times 6 \times 0.60 = 252\text{ nominal hours}$).
  * *Combined Nominal:* $360 + 252 = 612\text{ nominal hours}$.
  * *Cross-Team Coordination Overhead (25% Reserve):* Inter-team meetings, contract alignment, merge queues ($612 \times 0.25 = 153\text{ hours}$).
  * *Effective Focused Capacity:* $612 - 153 = \mathbf{459\text{ hours}}$ (vs. 336 hours baseline).
  * *Net Gain:* **1.37x (~1.4x)** effective capacity, completely disproving the naive 2.0x expectation!
* **Team Responsibilities & Architecture:**
  * **Team A (Core Fulfillment Engine):** Core Order API, Inventory Sync, Multi-Warehouse Allocation, Picking, Tracking.
  * **Team B (Regional Experience & Rules):** Regional Tax/Shipping Policy Engine, Storefront UI, Support Console, Refund Approvals.
  * *Knowledge Transfer:* 3-day paired handover between departing payments engineer and Team B senior engineer.
* **Scaled Agile Coordination Practices:**
  * *Shared Product Backlog:* Single source of truth managed by Lead Product Owner.
  * *Bi-Weekly Cross-Team Dependency Sync:* 30-min sync on Tuesdays and Thursdays to unblock API contracts.
  * *Joint Sprint Demo:* Single integrated end-to-end journey demonstration.
  * *Shared Integration Lane:* Branch protection and automated regression pipeline with a strict **WIP limit of 2**.
* **Comparative Simulation Results:**
  * *Completion Ratio:* Improved from **68.8%** (11/16 pts) in Sprint 1 to **81.8%** (18/22 pts) in the scaled sprint.
  * *Blocked Story-Days:* Dropped from **2 days** to **1 day** due to explicit contract stubs.
  * *Reopened Stories per Completed Story:* Dropped from **0.67** (2/3) to **0.33** (2/6).
* **Defence of the Unchanged Deadline:**
  * The release date is feasible **only because non-core scope was vigorously protected**. Analytics (`S13`), recommendations, and loyalty programs remain deferred.

---

### Task 7: Individual Technical & Ethical Reflection (5 Marks)
1. **Most Significant PM Decision:** Prioritizing end-to-end order journey integrity over module breadth. Delivering a working 4-step backbone is infinitely better than 9 half-finished screens.
2. **Evidence-Driven Pivot:** The Sprint 1 concurrency bug proved that database locking issues instantly halt downstream payment progress. This justified our strict WIP limit of 2 in testing and contract-first API stubs.
3. **Remaining System Vulnerability:** Payment gateway sandbox vs. production behavior divergence (e.g., latency spikes, asynchronous webhook drops under festival traffic).
4. **Ethical Dimensions:**
   * *Data Privacy:* Masking customer PII and zero plain-text card storage (PCI-DSS compliance) in synthetic test databases.
   * *Picker Workload Fairness:* Preventing algorithmic over-dispatching by balancing pick batches with realistic human warehouse walking times.
   * *Accessibility:* Ensuring support consoles and customer portals satisfy WCAG 2.1 AA (contrast, screen-reader compatibility).
   * *Simulation Transparency:* Honestly acknowledging that simulation figures are synthetic models rather than actual developer metrics.
5. **Next Technical Enquiries Before Real Rollout:**
   * Run 10x concurrency load testing on the database reservation lock.
   * Test physical barcode scanner response times over warehouse Wi-Fi dead-zones.
   * Conduct end-to-end financial reconciliation audit with banking partners.

---

## 3. High-Probability Exam & Viva Verification Questions

### Q1: "Why did you use Story Points instead of estimating in Developer Hours?"
> **Answer:** Story points measure **relative complexity, uncertainty, and effort**, not elapsed time. Hours create a false sense of precision, vary wildly across junior vs. senior developers, and do not account for external delays. Points allow the team to estimate work collaboratively using Fibonacci sequences and establish an empirical velocity over time.

### Q2: "How did you justify deferring the Sales Analytics module (S13)?"
> **Answer:** Sales analytics is a 'Could Have' reporting feature. If core inventory reservation (`S02`) or payment idempotency (`S03`) fails, the platform oversells stock and charges customers twice. An executive dashboard showing corrupt, inaccurate data provides zero business value. Core transactional integrity must precede business intelligence.

### Q3: "Explain how you calculated capacity after Team B was added. Why didn't velocity double?"
> **Answer:** By Brooks' Law, adding 7 developers creates immediate onboarding overhead and communication debt ($N(N-1)/2$ communication channels). Team B was only 60% effective in its first sprint, and cross-team coordination required a 25% reserve. The resulting effective capacity was 459 hours—a **1.4x increase, not 2.0x**.

### Q4: "What is the difference between the Software Development Workflow and the Order Lifecycle?"
> **Answer:** The *Development Workflow* tracks engineering task completion (`Ready` $\rightarrow$ `In Progress` $\rightarrow$ `Review` $\rightarrow$ `Test` $\rightarrow$ `Done`) with WIP limits to manage engineering flow. The *Order Lifecycle* is the business state machine of a customer transaction (`Placed` $\rightarrow$ `Reserved` $\rightarrow$ `Paid` $\rightarrow$ `Picked` $\rightarrow$ `Dispatched` $\rightarrow$ `Delivered`). Confusing the two leads to inaccurate reporting and poor project visibility.

### Q5: "What did the Sprint 1 simulation prove about your WIP limits?"
> **Answer:** The simulation confirmed that capping the Test queue at 2 items exposed the single QA engineer bottleneck on Day 4. Instead of developers continuing to pile unfinished work into testing, the WIP limit forced engineers to stop pulling new stories and assist in fixing the `S02` concurrency bug, reducing queue wait times from 2 days to 1 day.

---

## 4. Key Formulas & Ratios Reference Sheet

| Metric / Formula | Value | Strategic Significance |
| :--- | :--- | :--- |
| **Nominal Sprint 1 Capacity** | $7 \times 10 \times 6 = 420\text{ hrs}$ | Total available engineering hours without interruptions. |
| **Buffer Reserve (Sprint 1)** | $20\% = 84\text{ hrs}$ | Dedicated to ceremonies, defects, and integration risks. |
| **Focused Sprint 1 Capacity** | $420 - 84 = 336\text{ hrs}$ | Realistic productive engineering capacity. |
| **Provisional Velocity** | $16\text{ Story Points}$ | Initial conservative planning ceiling for Sprint 1. |
| **Sprint 1 Completion Ratio** | $\frac{11}{16} = 68.8\%$ | 3 stories completed; 2 carried over ($S03a$, $S09a$). |
| **Scaled Nominal Capacity** | $360\text{h (Team A)} + 252\text{h (Team B)} = 612\text{ hrs}$ | Team B discounted at 40% onboarding overhead. |
| **Coordination Reserve (Scaled)** | $25\% = 153\text{ hrs}$ | Cross-team sync, contract alignment, integration lane. |
| **Scaled Focused Capacity** | $612 - 153 = 459\text{ hrs}$ | **1.37x (~1.4x)** capacity multiplier over baseline. |
| **Scaled Completion Ratio** | $\frac{18}{22} = 81.8\%$ | Demonstrated improvement under modular division. |
| **Reopened Stories Ratio** | Dropped from $0.67 \rightarrow 0.33$ | Direct proof of improved DoR acceptance examples. |
