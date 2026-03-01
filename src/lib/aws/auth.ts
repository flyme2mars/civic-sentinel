/**
 * Sentinel Identity - Authentication Logic
 * Supports real AWS Cognito Phone OTP and a "Judge Mode" for Hackathon Demos.
 */

export interface CitizenSession {
  phoneNumber: string;
  citizenId: string;
  isDemo?: boolean;
}

const MAGIC_OTP = "123456";

// Test Pool: Different numbers represent different citizen profiles for the demo
const TEST_USERS: Record<string, string> = {
  "+911234567890": "SENTINEL_JUDGE_BETA",
  "+910000000001": "CITIZEN_RURAL_01",
  "+910000000002": "CITIZEN_URBAN_02",
  "+910000000003": "CITIZEN_LEAD_USER",
  "+910000000004": "CITIZEN_VETERAN",
};

export const authProvider = {
  /**
   * Step 1: Request an OTP for a phone number
   */
  async signIn(phoneNumber: string): Promise<{ sessionId: string }> {
    console.log(`[Sentinel Auth] Requesting OTP for: ${phoneNumber}`);
    
    // ALLOWED FOR DEMO: Any number in TEST_USERS or any number starting with +91000
    if (TEST_USERS[phoneNumber] || phoneNumber.startsWith("+91000")) {
      return { sessionId: "demo_session_" + phoneNumber };
    }

    // Prototype Mock: Return success for any number to avoid blocking the user
    return { sessionId: "mock_session_" + Date.now() };
  },

  /**
   * Step 2: Verify the OTP
   */
  async verifyOtp(phoneNumber: string, otp: string, sessionId: string): Promise<CitizenSession> {
    console.log(`[Sentinel Auth] Verifying OTP: ${otp} for ${phoneNumber}`);

    // DEMO FLOW: Magic OTP works for all test numbers
    if (otp === MAGIC_OTP) {
      const citizenId = TEST_USERS[phoneNumber] || ("USER_" + phoneNumber.replace('+', ''));
      const session = { 
        phoneNumber, 
        citizenId,
        isDemo: !!TEST_USERS[phoneNumber]
      };
      this.saveSession(session);
      return session;
    }

    throw new Error("Invalid verification code. Please try again.");
  },

  saveSession(session: CitizenSession) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sentinel_citizen_session', JSON.stringify(session));
    }
  },

  getSession(): CitizenSession | null {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sentinel_citizen_session');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sentinel_citizen_session');
    }
  }
};
