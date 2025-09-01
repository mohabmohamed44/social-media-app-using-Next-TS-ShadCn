export interface IRegisterData {
    email: string;
    name: string;
    password: string;
    rePassword: string;
    gender: string;
    /**
     * Date of birth in format 'yyyy-MM-dd' (e.g., '1994-10-07')
     */
    dateOfBirth: string;
}

export interface UserDataInterface {
    _id: string;
    name: string;
    email: string;
    dateOfBirth: string;
    gender: "male" | "female";
    photo: string;
    createdAt: string;
}