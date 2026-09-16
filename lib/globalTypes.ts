export interface IUser {
  _id: string;
  email: string;
  role: string;
  status: string;
}

export interface AuthContextType {
  user: IUser | null;
  isLoading: boolean;
  login: (token: string, userData: IUser) => void;
  logout: () => void;
}
