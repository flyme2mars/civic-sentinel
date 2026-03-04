# CivicSentinel 🛡️

**CivicSentinel** is an AI-powered civic accountability platform built for the **AI for Bharat Hackathon** (Hack2Skill, sponsored by AWS).

## 🚀 The Vision
Indian citizens often face "complaint fatigue" where local issues (potholes, waste, water) are reported but ignored or poorly repaired. CivicSentinel uses AWS Serverless architecture and Amazon Bedrock to:
- **Process Multimodal Input:** Voice notes in regional languages and photos.
- **Auto-Identify Jurisdiction:** Route complaints to the correct municipal department.
- **Enforce SLA:** A visible 48-hour "Doomsday Clock" for officials.
- **Escalate Automatically:** If the SLA is breached, it generates RTI requests and social media threads.
- **Vision Auditor:** Uses AI to compare "Before" and "After" photos to prevent deceptive repairs.

## 🛠️ Tech Stack (AWS focus)
- **Frontend:** Next.js (App Router, TypeScript)
- **Compute:** AWS Lambda
- **API:** Amazon API Gateway
- **Storage:** Amazon S3
- **Intelligence:** Amazon Bedrock (Claude 3.5 Sonnet)
- **Database:** Amazon DynamoDB (Proposed)

## 📁 Project Structure
- `src/app/(citizen)`: Frontend routes for citizens to report issues.
- `src/app/govt/dashboard`: Secure portal for government officials to manage and resolve grievances.
- `src/components/govt`: Specialized dashboard components (Sidebar, DetailDrawer, AI Auditor UI).
- `src/lib/aws`: AWS SDK configurations (Bedrock, S3, DynamoDB) and AI agent logic.

## 🛠️ Key Features (Govt Dashboard)
- **Secure Official Access:** Token-based authentication portal for authorized personnel.
- **Dynamic Grievance Pipeline:** Real-time tracking of issues across 'Inbox', 'Active', and 'Resolved' states.
- **AI Vision Auditor:** Uses Amazon Bedrock (Claude 3.5 Sonnet) to compare "Initial Report" images with "Resolution Evidence" to verify repair quality and prevent fraud.
- **Automated Workflow:** Official resolution submission triggers S3 uploads and immediate AI verification.
- **SLA Tracking:** Integrated countdowns for the 48-hour resolution target.

## 🤝 Collaboration Guide for Team Members
1. **Clone the Repo:** `git clone <repo-url>`
2. **Install Dependencies:** `npm install`
3. **Environment Variables:** Create a `.env.local` based on `.env.example`.
4. **Development:** Run `npm run dev` to start the local server.
5. **Route Groups:** 
   - **Public/Citizen:** `/`
   - **Government Dashboard:** `/govt/dashboard` (Requires Access Token)
   - **Admin Dashboard:** `/admin/dashboard`

## 📚 Research Context
Based on our research:
- Official state portals average **64 days** for resolution. Our **48-hour** target is a competitive differentiator.
- The "Vision Auditor" addresses the #1 citizen complaint: **Poor quality of repairs**.
- Automation of **Section 2(j)(i) RTI requests** provides the legal "teeth" needed for true accountability.

---
Built with ❤️ for the Bharat Hackathon.
