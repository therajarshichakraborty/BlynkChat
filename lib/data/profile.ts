type ProfileInput = {
  name: string;
  username: string;
  bio: string;
};

export function updateProfile(input: ProfileInput): Promise<ProfileInput> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(input), 600);
  });
}
