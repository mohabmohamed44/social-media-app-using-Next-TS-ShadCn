export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  rePassword: string;
  gender: string;
  dateOfBirth: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  rePassword: string;
  gender: string;
  dob: Date | null;
}

export interface UpdatePasswordFormValues {
  currentPassword: string;
  newPassword: string;
}