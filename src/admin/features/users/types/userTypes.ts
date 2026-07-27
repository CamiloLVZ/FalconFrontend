import type { Passenger } from "../../passengers/types/passengerTypes";

export interface AdminUser {
  id: number;
  email: string;
  disabled: boolean;
  roles: string[];
  passengerProfile: Passenger | null;
}

export interface UpdateUserCredentials {
  email?: string;
  password?: string;
}
