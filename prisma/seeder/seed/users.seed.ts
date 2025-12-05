import path from 'node:path';

import { PrismaClient, type ROLE } from '@prisma/client';
import { file, password, resolveSync } from 'bun';
import csv from 'csvtojson';

const prisma = new PrismaClient();

interface IUsers {
  id: string;
  username: string;
  email: string;
  password: string;
  role: ROLE;
}

export const userSeed = async (is_production?: boolean) => {
  try {
    console.log('🌱 Seed users');

    const datas: IUsers[] = await csv().fromFile(
      resolveSync(
        '../data/' + (is_production ? 'users-prod.data.csv' : 'users.data.csv'),
        __dirname,
      ),
    );

    for (const data of datas) {
      const hashedPassword = await password.hash(data.password, 'bcrypt');

      const profilePicture = file(
        resolveSync('../data/' + 'images/' + 'default_image.jpg', __dirname),
      );

      const profilePicturePath = `uploads/profile-picture/user-${data.id}${path.extname(profilePicture.name || '.jpg')}`;

      await Bun.write(`./${profilePicturePath}`, profilePicture, {
        createPath: true,
      });

      await prisma.users.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          email: data.email,
          username: data.username,
          password: hashedPassword,
          profile_picture: profilePicturePath,
          role: data.role,
        },
        update: {
          email: data.email,
          username: data.username,
          password: hashedPassword,
          profile_picture: profilePicturePath,
          role: data.role,
        },
      });
    }
  } catch (error) {
    console.log(`❌ Error in users. ${error}`);

    throw error;
  }
};
