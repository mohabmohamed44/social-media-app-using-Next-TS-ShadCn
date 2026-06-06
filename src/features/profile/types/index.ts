export interface IUserProfile {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  photo?: string;
  username?: string;
  posts?: number;
  followers?: number;
  following?: number;
}

export interface UpdateProfileData {
  name?: string;
  dateOfBirth?: string;
  gender?: string;
}