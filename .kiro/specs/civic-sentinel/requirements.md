# Requirements Document: CivicSentinel

## Introduction

CivicSentinel is a next-generation civic accountability platform built for the **AI for Bharat Hackathon**. It empowers Indian citizens by bridging the gap between reporting an issue and its actual resolution through a closed-loop system powered by AWS Generative AI. The system provides an autonomous AI agent that assists citizens in drafting formal reports, a real-time "Doomsday Clock" for accountability, and an AI Vision Auditor that mathematically verifies government repairs before closure.

## Glossary

- **CivicSentinel**: The unified digital platform for citizen grievance redressal and departmental oversight.
- **AI_Agent**: The autonomous drafting system powered by **Amazon Bedrock (Claude 4.5 Sonnet and Amazon Nova Pro)**.
- **Vision_Auditor**: The AI component that compares "Before" and "After" photos to verify the quality of municipal work.
- **SLA**: Service Level Agreement – the 48-hour legal response deadline for government officials.
- **Doomsday_Clock**: The visual countdown timer on the citizen dashboard that tracks the 48-hour SLA.
- **RTI_Generator**: The automated legal escalation system that drafts PDF RTI applications upon SLA breach.
- **Social_Escalator**: The AI-powered tool that generates viral social media copies for public awareness on X (Twitter).
- **Citizen**: The end-user reporting civic issues.
- **Admin**: The municipal Nodal Officer responsible for triage and final approval.
- **Official**: The departmental official (e.g., PWD, KWA) responsible for resolving the issue on the ground.

## Requirements

### Requirement 1: Multi-Modal AI Reporting
**User Story:** As a citizen, I want to report issues using photos and voice notes, so that I can easily submit complaints without navigating complex bureaucratic forms.
#### Acceptance Criteria
1. WHEN a citizen uploads photos, THE AI_Agent SHALL analyze the images to identify the issue type and severity.
2. WHEN a citizen records a voice note, THE CivicSentinel SHALL use **Amazon Transcribe** to convert the audio into a textual description.
3. THE AI_Agent SHALL automatically draft a professional title, summary, and identify the responsible municipal department.
4. THE system SHALL provide "Demo Scenarios" (e.g., CUSAT Campus waste) to allow judges to evaluate the full AI drafting flow without being on-site.

### Requirement 2: Intelligent Spatial Routing
**User Story:** As a citizen, I want my complaint automatically mapped to the correct ward and department, so that I don't need to research local jurisdictions.
#### Acceptance Criteria
1. THE system SHALL use **Amazon Location Service** to reverse-geocode GPS coordinates into landmarks, wards, and city details.
2. THE AI_Agent SHALL use geocoded data to predict the target department (e.g., PWD for roads, KWA for water).
3. THE Admin SHALL have the ability to review AI predictions and officially "Assign" the grievance to a specific local branch.

### Requirement 3: Automated SLA Accountability
**User Story:** As a citizen, I want to see exactly how much time the department has left to fix my issue, so that I can hold them accountable for delays.
#### Acceptance Criteria
1. UPON assignment, THE CivicSentinel SHALL initiate a 48-hour **Doomsday_Clock**.
2. THE clock SHALL be visible to the citizen and transition to a "Breached" state if the deadline passes without resolution.
3. THE clock SHALL intelligently halt when the department submits a resolution for review.

### Requirement 4: AI-Powered Quality Audit
**User Story:** As a government admin, I want AI to verify the quality of repairs, so that I don't need to manually visit every site to confirm resolution.
#### Acceptance Criteria
1. WHEN an Official uploads "After" photos, THE Vision_Auditor SHALL compare them against the original "Before" evidence.
2. THE Vision_Auditor SHALL return a mathematical confidence score and a natural language assessment of the repair.
3. THE system SHALL display an **AI Auditor Warning** to the Admin if the repair quality is flagged as insufficient.

### Requirement 5: Dual-Key Final Closure
**User Story:** As a citizen, I want the final say in whether an issue is actually fixed, so that departments cannot close tickets without my satisfaction.
#### Acceptance Criteria
1. AFTER Admin approval, THE status SHALL move to `RESOLVED`.
2. THE citizen SHALL see a **Resolution Review Panel** showing the AI's assessment and the "After" photos.
3. THE ticket SHALL only move to the final `CLOSED` state once the citizen clicks "Confirm Resolution."
4. THE citizen SHALL have the option to "Dispute" the fix, triggering an escalation.

### Requirement 6: Legal & Social Escalation
**User Story:** As a citizen, I want to escalate my grievance if the SLA is breached, so that I can take legal or public action against municipal negligence.
#### Acceptance Criteria
1. IF the SLA expires, THE CivicSentinel SHALL unlock the **Case Action Center**.
2. THE RTI_Generator SHALL produce a pre-filled, court-ready **Right to Information (RTI)** PDF citing the specific grievance ID and delay.
3. THE Social_Escalator SHALL generate viral post copies for X (Twitter) and provide a grid of evidence images for manual attachment.

### Requirement 7: High-Fidelity Evaluation Mode
**User Story:** As a hackathon judge, I want to quickly test the system's edge cases, so that I can verify the architecture without waiting 48 hours.
#### Acceptance Criteria
1. THE system SHALL include an **Evaluation Protocol** (Guided Tour) that uses a spatially aware spotlight to explain the workflow.
2. THE Admin and Govt portals SHALL include **"Judge Access"** buttons to bypass authentication for the purpose of the demo.
3. THE system SHALL include pre-mapped scenarios for CUSAT Campus to ensure 100% accurate departmental routing during the presentation.
