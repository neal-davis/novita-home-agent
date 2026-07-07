export function checkUserPassword(password: string):boolean {
    if (password.length < 8) {
        return false;
    }
    let checkCount = 0;
    
    if (/[A-Z]/.test(password)) {
        checkCount++;
    }
    
    if (/[a-z]/.test(password)) {
        checkCount++;
    }
    
    if (/\d/.test(password)) {
        checkCount++;
    }
    
    if (/[!@#$%^&*]/.test(password)) {
        checkCount++;
    }
    return checkCount >= 3;
}