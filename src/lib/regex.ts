export function filterReffer(reffer: string) {
  // 定义一个正则表达式来匹配顶级域名
  const regex = /https?:\/\/(?:www\.)?([^/]+)\//;

  // 使用正则表达式提取顶级域名
  const match = reffer.match(regex);

  // 如果匹配成功，match数组的第一个元素将是整个匹配结果，第二个元素是捕获组内容（即顶级域名）
  if (match && match.length >= 2) {
    const topLevelDomain = match[1];
    return topLevelDomain;
  } else {
    return reffer;
  }
}

export function validateUsername(input: string) {
  const regex = /^(?=.*[a-zA-Z\u4e00-\u9fa5])[\u4e00-\u9fa5\w\-#]{5,20}$/;
  return regex.test(input);
}

export function validateTwoDecimalPlaces(input: string) {
  const regex = /^\d+(\.\d{1,2})?$/;
  return regex.test(input);
}

export function RegexEmail(email: string) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

export function RegexPassword(password: string) {
  const regex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>\\[\];'`~\-=_+/])[A-Za-z\d!@#$%^&*(),.?":{}|<>\\[\];'`~\-=_+/]{8,64}$/;
  return regex.test(password);
}

export function RegexIdNumber(idNumber: string) {
  const regex =
    /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i;
  return regex.test(idNumber);
}

export function RegexChinese(text: string) {
  const chineseRegex = /^[\u4e00-\u9fa5]+$/;
  return chineseRegex.test(text);
}

export function RegexCreditCode(text: string) {
  const creditCodeRegex = /^[A-Z0-9]{18}$/;
  return creditCodeRegex.test(text);
}

export function validateLength(password: string) {
  const lengthRegex = /^.{8,32}$/;
  return lengthRegex.test(password);
}

export function validateComplexity(password: string) {
  const upperCase = /[A-Z]/;
  const lowerCase = /[a-z]/;
  const digit = /\d/;
  const specialChar = /[!@#$%^&*(),.?":{}|<>]/;

  let count = 0;
  if (upperCase.test(password)) count++;
  if (lowerCase.test(password)) count++;
  if (digit.test(password)) count++;
  if (specialChar.test(password)) count++;

  return count >= 3;
}

export function validateAllowedCharacters(password: string) {
  const allowedCharsRegex = /^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]+$/;
  return allowedCharsRegex.test(password);
}

export function validatePhoneNumber(phoneNumber: string) {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phoneNumber);
}
