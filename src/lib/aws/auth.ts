

export interface CitizenSession {
  phoneNumber: string;
  citizenId: string;
  citizenName: string;
  isDemo?: boolean;
}

const MAGIC_OTP = "123456";

const TEST_USERS: Record<string, { id: string, name: string }> = {
  "+911234567890": { id: "SENTINEL_JUDGE_BETA", name: "Judge Evaluation" },
  "+910000000001": { id: "CITIZEN_RURAL_01", name: "Akshai Krishna S" },
  "+910000000002": { id: "CITIZEN_URBAN_02", name: "Abhinand" },
  "+910000000003": { id: "CITIZEN_LEAD_USER", name: "Jishnu PN" },
  "+910000000004": { id: "CITIZEN_VETERAN", name: "Sreeram J Menon" },
};

export const authProvider = {

  async signIn(phoneNumber: string): Promise<{ sessionId: string }> {
    console.log(`[Sentinel Auth] Requesting OTP for: ${phoneNumber}`);
    
    if (TEST_USERS[phoneNumber] || phoneNumber.startsWith("+91000")) {
      return { sessionId: "demo_session_" + phoneNumber };
    }

    return { sessionId: "mock_session_" + Date.now() };
  },

  async verifyOtp(phoneNumber: string, otp: string, sessionId: string, customName?: string): Promise<CitizenSession> {
    console.log(`[Sentinel Auth] Verifying OTP: ${otp} for ${phoneNumber}`);

    if (otp === MAGIC_OTP) {
      const testUser = TEST_USERS[phoneNumber];
      const citizenId = testUser ? testUser.id : ("USER_" + phoneNumber.replace('+', ''));
      const citizenName = testUser ? testUser.name : (customName || "Citizen User");
      
      const session = { 
        phoneNumber, 
        citizenId,
        citizenName,
        isDemo: !!testUser
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
