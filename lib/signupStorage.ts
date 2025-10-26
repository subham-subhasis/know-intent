interface SignupData {
  emailOrPhone: string;
  isEmail: boolean;
  password: string;
  dateOfBirth?: Date;
  kpis?: string[];
  suggestions?: string;
  countryCode?: string;
}

class SignupStorage {
  private data: SignupData = {
    emailOrPhone: '',
    isEmail: true,
    password: '',
  };

  setData(key: keyof SignupData, value: any) {
    this.data[key] = value as never;
  }

  getData(): SignupData {
    return this.data;
  }

  clear() {
    this.data = {
      emailOrPhone: '',
      isEmail: true,
      password: '',
    };
  }
}

export const signupStorage = new SignupStorage();
