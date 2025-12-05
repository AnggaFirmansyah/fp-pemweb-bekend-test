import { type Prisma, type Users } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { validate as isValidUuid } from 'uuid';

import { ErrorResponse, prisma } from '@/common';
import { FileManager, paginate } from '@/utils';

import { type IUserPaginationQuery } from './schema';
import { type IUpdateUser } from './schema/update-user.schema';

export abstract class UserService {
  static async getAllUsers(query: IUserPaginationQuery) {
    const args: {
      where: Prisma.UsersWhereInput;
      select: Prisma.UsersSelect;
      orderBy: Prisma.UsersOrderByWithRelationInput[];
    } = {
      where: {
        AND: [
          {
            role: query.role,
          },
          {
            id:
              query.search && isValidUuid(query.search)
                ? query.search
                : undefined,
          },
          {
            OR: [
              {
                username:
                  query.search && !isValidUuid(query.search)
                    ? { contains: query.search, mode: 'insensitive' }
                    : undefined,
              },
              {
                email:
                  query.search && !isValidUuid(query.search)
                    ? { contains: query.search, mode: 'insensitive' }
                    : undefined,
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        created_at: true,
        profile_picture: true,
      },
      orderBy: [
        {
          id: query.orderById,
        },
        {
          username: query.orderByName,
        },
        {
          created_at: query.orderByCreatedAt || 'desc',
        },
      ],
    };

    const users = await paginate<Users, typeof args>(
      prisma.users,
      query.page,
      query.perPage,
      args,
    );

    return users;
  }

  static async getUserDetail(user_id: string) {
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

  static async updateUser(user_id: string, data: IUpdateUser) {
    const user = await this.findExistUser(user_id);

    let updatedPicturePath: string | undefined;

    if (data.profile_picture) {
      updatedPicturePath = await FileManager.upload(
        'profile-picture',
        data.profile_picture,
      );
      await FileManager.remove(user.profile_picture);
    }

    const updatedUser = await prisma.users.update({
      where: { id: user_id },
      data: {
        username: data.username,
        profile_picture: updatedPicturePath,
      },
      omit: {
        password: true,
        updated_at: true,
      },
    });

    return updatedUser;
  }

  static async deleteUser(user_id: string) {
    const user = await this.findExistUser(user_id);

    await prisma.users.delete({
      where: { id: user_id },
    });

    await FileManager.remove(user.profile_picture);
  }

  private static async findExistUser(user_id: string) {
    const user = await prisma.users.findUnique({
      where: { id: user_id },
      omit: {
        password: true,
        updated_at: true,
      },
    });

    if (!user) throw new ErrorResponse(StatusCodes.NOT_FOUND, 'User not found');

    return user;
  }
}
