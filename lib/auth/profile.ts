import { isValidEmail, isValidName, isValidPhone } from "@/lib/validation";

export function hasCompletedProfile(user: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}): boolean {
  return (
    isValidName(user.firstName) &&
    isValidName(user.lastName) &&
    isValidPhone(user.phone) &&
    isValidEmail(user.email)
  );
}
