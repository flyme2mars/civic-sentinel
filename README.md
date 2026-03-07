# CivicSentinel

CivicSentinel is a comprehensive civic accountability platform designed to improve the transparency and efficiency of public grievance redressal in India. Developed for the AI for Bharat Hackathon sponsored by AWS, the platform leverages generative artificial intelligence and serverless cloud infrastructure to create a closed-loop system for municipal issue management.

The platform addresses the common problem of administrative inertia by providing citizens with powerful legal and drafting tools while giving government officials automated systems to verify and close reports.

## System Overview

CivicSentinel integrates three distinct interfaces into a unified workflow to ensure that every reported issue is tracked from submission to verified resolution.

### Citizen Portal
The citizen portal simplifies the reporting process through multimodal input. Users can upload photographs and record voice notes in regional languages. The system uses Amazon Transcribe to process audio and Amazon Bedrock to automatically draft a formal grievance summary, assess its severity, and identify the responsible department. A real-time countdown timer tracks the 48-hour service level agreement (SLA), ensuring that officials remain accountable for timely responses.

### Administrative Dashboard
The administrative portal serves as the central triage hub. Nodal officers can review AI-generated drafts, verify the location data provided by Amazon Location Service, and officially assign grievances to specific departmental branches. The dashboard provides a high-level overview of municipal performance, SLA compliance rates, and critical hotspots requiring immediate attention.

### Departmental Resolution Inbox
Government officials receive branch-specific assignments in a dedicated inbox. To resolve a grievance, officials must provide visual evidence of the completed repair. This evidence is processed by the AI Vision Auditor, which compares the original report with the resolution proof to provide a mathematical assessment of the work quality.

## Key Technical Features

### AI Vision Auditor
The system utilizes Amazon Bedrock (Claude 4.5 Sonnet and Amazon Nova Pro) to perform side-by-side analysis of before and after images. This process verifies that the location matches through landmark detection and confirms that the specific issue has been effectively resolved, preventing the submission of fraudulent or insufficient proof.

### Evaluation Protocol
To facilitate thorough evaluation by hackathon judges, the platform includes an integrated guided tour. This tour uses a spatially aware spotlight system to walk unfamiliar users through the core features of each portal. Additionally, the system provides pre-configured demo scenarios for the CUSAT Campus to ensure accurate testing of departmental routing and AI drafting logic.

### Legal Escalation
In the event of an SLA breach, the platform unlocks escalation tools for the citizen. This includes the automated generation of formal Right to Information (RTI) applications in PDF format and the drafting of public awareness posts for social media platforms.

## Technology Stack

The application is built using a modern, serverless architecture on AWS to ensure scalability and cost-efficiency.

*   **Frontend Framework**: Next.js 15 with Tailwind CSS for a premium monochromatic interface.
*   **Artificial Intelligence**: Amazon Bedrock (Claude 4.5 Sonnet and Amazon Nova Pro) for natural language processing and computer vision.
*   **Media Processing**: Amazon Transcribe for regional language voice-to-text conversion.
*   **Data Storage**: Amazon DynamoDB for grievance records and Amazon S3 for secure evidence storage.
*   **Geospatial Services**: Amazon Location Service for municipal ward mapping and reverse-geocoding.

## Installation and Setup

To run the CivicSentinel prototype locally, follow these steps.

### Prerequisites
*   Node.js 18 or higher.
*   An AWS account with access to Amazon Bedrock, S3, DynamoDB, and Amazon Location Service.

### Configuration
1.  Clone the repository to your local machine.
2.  Install the required dependencies using the package manager:
    ```bash
    npm install
    ```
3.  Create a `.env.local` file in the root directory and populate it with your AWS credentials and configuration:
    ```text
    # AWS Configuration
    NEXT_PUBLIC_AWS_REGION=ap-south-1
    MY_AWS_ACCESS_KEY_ID=your-access-key
    MY_AWS_SECRET_ACCESS_KEY=your-secret-key

    # Database & Storage
    DYNAMODB_TABLE_NAME=your-table-name
    NEXT_PUBLIC_S3_BUCKET_NAME=your-bucket-name

    # AI Models
    BEDROCK_MODEL_ID=apac.amazon.nova-pro-v1:0
    TAVILY_API_KEY=your-tavily-key
    SARVAM_API_KEY=your-sarvam-key

    # System Security
    GOVT_API_TOKEN=sentinel2026
    ```

### Running the Application
Start the development server:
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

## Portal Access
*   **Landing Page**: `/`
*   **Citizen Portal**: `/citizen`
*   **Admin Dashboard**: `/admin/dashboard`
*   **Department Inbox**: `/govt/dashboard`

The Admin and Government portals include a "Judge Access" button on their respective login screens to allow for immediate evaluation without requiring manual token entry.
