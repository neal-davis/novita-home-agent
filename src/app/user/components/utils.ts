import { RegexEmail, RegexPassword } from "@/lib/regex";

export const validateConfig: Record<
  string,
  (value: string) => [boolean, string]
> = {
  email: (email: string) => {
    if (RegexEmail(email)) {
      return [true, ""];
    } else {
      return [false, "Please enter a valid email address."];
    }
  },
  pwd: (pwd: string) => {
    if (RegexPassword(pwd)) {
      return [true, ""];
    } else {
      return [
        false,
        "Password must be at least 8 characters less than 64 characters and contain at least 1 letter, 1 number and 1 special character.",
      ];
    }
  },
  firstName: (firstName: string) => {
    if (firstName.length > 0) {
      return [true, ""];
    } else {
      return [false, "Please enter your first name."];
    }
  },
  lastName: (lastName: string) => {
    if (lastName.length > 0) {
      return [true, ""];
    } else {
      return [false, "Please enter your last name."];
    }
  },
};
