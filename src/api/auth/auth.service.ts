// eslint-disable-next-line unicorn/prefer-node-protocol
import { password } from 'bun';
import { StatusCodes } from 'http-status-codes';

import { ErrorResponse, prisma } from '@/common';
import { FileManager, JwtUtils } from '@/utils';

import { type ILogin, type IRegister } from './schema';

export abstract class AuthService {
  static async register(data: IRegister) {
    const isUserExist = await this.findUser(data.email);

    if (isUserExist)
      throw new ErrorResponse(
        StatusCodes.BAD_REQUEST,
        'Email is already registered',
      );

    const hashedPassword = await password.hash(data.password, 'bcrypt');

    let profilePicturePath: string | undefined;

    if (data.profile_picture) {
      profilePicturePath = await FileManager.upload(
        'profile-picture',
        data.profile_picture,
      );
    }

    await prisma.users.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
        profile_picture: profilePicturePath,
      },
      select: {
        id: true,
      },
    });

    return;
  }

  static async login(data: ILogin) {
    const isUserExist = await this.findUser(data.email);

    if (!isUserExist)
      throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Email is not registered');

    const isPasswordValid = await password.verify(
      data.password,
      isUserExist.password,
    );

    if (!isPasswordValid)
      throw new ErrorResponse(StatusCodes.BAD_REQUEST, 'Invalid password');

    const token = JwtUtils.signToken({
      user_id: isUserExist.id,
      email: isUserExist.email,
      role: isUserExist.role,
    });

    return token;
  }

  static async getMe(user_id: string) {
    const [isUserExist, gameLiked] = await prisma.$transaction([
      prisma.users.findUnique({
        where: { id: user_id },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          profile_picture: true,
          total_game_played: true,
        },
      }),
      prisma.likedGames.aggregate({
        where: {
          AND: [{ user_id }, { game: { is_published: true } }],
        },
        _count: { id: true },
      }),
    ]);

    if (!isUserExist)
      throw new ErrorResponse(StatusCodes.NOT_FOUND, 'User not found');

    return {
      ...isUserExist,
      total_game_liked: gameLiked._count.id,
    };
  }

  private static async findUser(email?: string, id?: string) {
    return await prisma.users.findUnique({
      where: {
        email,
        id,
      },
      omit: {
        created_at: true,
        updated_at: true,
      },
    });
  }
}
