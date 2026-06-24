export type ProfileType = {
  id: string;
  username: string | null;
  bio: string | null;
  email: string | null;
};

export type ProfileFormProps = {
  userEmail: string | null;
  initialUsername?: string | null;
  initialBio?: string | null;
};

export type UpdateProfileInput = {
  username: string;
  bio: string | null;
};

export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };