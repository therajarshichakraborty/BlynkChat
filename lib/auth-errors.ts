type AuthError = {
  code?: string;
  status?: number;
  message?: string;
};

export function signInErrorMessage(error: AuthError) {
  if (error.status === 429) return "Too many attempts. Wait a minute and try again.";
  return "Incorrect email, username or password.";
}

export function signUpErrorMessage(error: AuthError) {
  if (error.status === 429) return "Too many attempts. Wait a minute and try again.";
  if (error.code === "USERNAME_IS_ALREADY_TAKEN") return "That username is taken. Try another one.";
  if (error.code === "USER_ALREADY_EXISTS" || error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
    return "We could not create an account with these details. Try logging in instead.";
  }
  return error.message ?? "Something went wrong. Try again.";
}
