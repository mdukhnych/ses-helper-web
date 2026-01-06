export interface IUser {
  id: string | null;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  shopId: string;
  role: "admin" |"shop" | "seller";
}