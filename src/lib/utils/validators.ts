export function validateEmail(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return re.test(email);
}

export function validateUsername(username: string) {
  const usernameRegex =
    /^(?=.*[A-Za-z\u4e00-\u9fa5])[A-Za-z0-9\u4e00-\u9fa5\-_#]{5,20}$/;
  return usernameRegex.test(username);
}

export function validatePassword(password: string) {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s]).{8,32}$/;
  return passwordRegex.test(password);
}

export function validateCNPhone(phoneNumber: string | number): boolean {
  const phoneStr = String(phoneNumber);
  const pattern = /^1[3-9]\d{9}$/;
  return pattern.test(phoneStr);
}
