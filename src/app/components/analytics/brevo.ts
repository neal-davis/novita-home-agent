export function initBrevo(user: {
  email: string;
  uid: number;
  role: number;
  uuid: string;
}) {
  if (window && user.email && window.sendinblue) {
    window.sendinblue.identify(user.email, {
      uid: user.uid,
      role: user.role,
      uuid: user.uuid,
    });
    window.__user__ = {
      email: user.email,
    };
  }
}
