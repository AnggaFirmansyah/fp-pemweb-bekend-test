import { PrismaClient } from '@prisma/client';
import { resolveSync } from 'bun';
import csv from 'csvtojson';

const prisma = new PrismaClient();

interface IGameTemplates {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo: string;
  is_time_limit_based: string;
  is_life_based: string;
}

export const gameTemplateSeed = async () => {
  try {
    console.log('🌱 Seed game templates');

    const datas: IGameTemplates[] = await csv().fromFile(
      resolveSync('../data/' + 'game-templates.data.csv', __dirname),
    );

    for (const data of datas) {
      await prisma.gameTemplates.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          slug: data.slug,
          name: data.name,
          description: data.description,
          logo: data.logo,
          is_time_limit_based: data.is_time_limit_based === 'true',
          is_life_based: data.is_life_based === 'true',
        },
        update: {
          slug: data.slug,
          name: data.name,
          description: data.description,
          logo: data.logo,
          is_time_limit_based: data.is_time_limit_based === 'true',
          is_life_based: data.is_life_based === 'true',
        },
      });
    }
  } catch (error) {
    console.log(`❌ Error in game templates. ${error}`);

    throw error;
  }
};
