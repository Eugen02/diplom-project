import { enrichTrackWithMetadata } from "./track.record";
import { tr } from "date-fns/locale";
import { UserInterface } from "../../types/interface/User.interface";
import { UserModel } from "../models/user.model";

interface UserRecordInterface {
  getUser: () => Promise<any>;
}

export class UserRecord implements UserRecordInterface {
  async getUser(): Promise<any> {
    const user = await UserModel.find({});

    return user;
  }

  async getUserById(id: string): Promise<any> {
    const user = await UserModel.findById(id).populate("likedTracks").exec();

    const likedTracks = user?.likedTracks || [];

    const likedTracksWithSpotifyMetadata = await Promise.all(
      likedTracks.map(async (track: any) => ({
        ...(await enrichTrackWithMetadata(track)),
        id: track._id,
      }))
    );

    return {
      // @ts-ignore
      ...user?._doc,
      id: user?._id,
      likedTracks: likedTracksWithSpotifyMetadata,
    };
  }

  async getUserByLogin(login: string): Promise<any> {
    const user = await UserModel.findOne({ login });

    return user;
  }

  async createUser(user: UserInterface): Promise<any> {
    const createdUser = await UserModel.create(user);

    return createdUser;
  }

  async updateProfile(
    userId: string,
    updates: { name?: string; surname?: string; avatarUrl?: string }
  ): Promise<any> {
    const updatedUser = await UserModel.findByIdAndUpdate(userId, updates, {
      new: true,
    });

    return updatedUser;
  }

  async updateFavoriteGenres(userId: string, genres: string[]): Promise<any> {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { favoriteGenres: genres },
      { new: true }
    );

    return updatedUser;
  }

  async likeTrack(userId: string, trackId: string): Promise<any> {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        $push: {
          likedTracks: trackId,
        },
      },
      { new: true }
    );

    return updatedUser;
  }

  async unlikeTrack(userId: string, trackId: string): Promise<any> {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        $pull: {
          likedTracks: trackId,
        },
      },
      { new: true }
    );

    return updatedUser;
  }
}

export const userRecord = new UserRecord();
