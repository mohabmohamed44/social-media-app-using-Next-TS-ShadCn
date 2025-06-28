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