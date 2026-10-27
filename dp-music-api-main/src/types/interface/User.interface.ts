export interface UserInterface {
  id?: string;
  login: string;
  password: string;
  name: string;
  surname?: string;
  age?: number;
  avatarUrl?: string;
  likedTracks?: string[];
  favoriteGenres?: string[];
}
