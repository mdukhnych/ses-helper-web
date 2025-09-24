export interface IUser {
  id: string | null;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  shop: string;
  role: "admin" |"director" | "seller";
}