export interface IUserProfile {
  _id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  photo: string;
}

export interface IProfileState {
  userProfile: IUserProfile | null;
  loading: boolean;
  error: string | null;
}
