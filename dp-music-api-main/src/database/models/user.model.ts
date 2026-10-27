import { model, Schema, Model, Document } from "mongoose";
import { addVirtualsToSchema } from "../../utils/addVirtualsToSchema";
import { ModelsNamesEnum } from "../../types/enum/ModelsNamesEnum";

interface UserDocInterface extends Document {
  login: string;
  password: string;
  name: string;
  surname?: string;
  age?: number;
  avatarUrl?: string;
  likedTracks: string[];
  favoriteGenres: string[];
}

interface UserModelInterface extends Model<UserDocInterface> {}

const UserSchema: Schema = new Schema(
  {
    login: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    surname: {
      type: String,
      required: false,
    },

    age: {
      type: Number,
      required: false,
    },

    avatarUrl: {
      type: String,
      required: false,
    },

    likedTracks: [
      {
        type: Schema.Types.ObjectId,
        ref: ModelsNamesEnum.TRACK,
        default: [],
      },
    ],

    favoriteGenres: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

addVirtualsToSchema(UserSchema);

export const UserModel = model<UserDocInterface, UserModelInterface>(
  ModelsNamesEnum.USER,
  UserSchema
);
