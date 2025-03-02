'use server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { AppDataSource } from '@/db/data-source'
import { Settings } from '@db/entities/settings.entity'
import { redirect } from 'next/navigation'

export const getEndpointSettings = async () => {
  const session = await getServerSession(authOptions);

  if (!session || session?.user?.role !== "admin") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }

  try {
    const settingsRepository = AppDataSource.getRepository(Settings)

    const settings: Settings[] | null = await settingsRepository.find();


    await AppDataSource.destroy()

    return {
      endpoint: settings[0].url
    }
  } catch(e: any) {
    return {
      success: false,
    }
  }

}

export type State = {
  errors?: {
    endpoint?: string[];
  };
  message?: string | null;
};

export const updateEndpointSettings = async (endpoint: string | undefined) => {
  const session = await getServerSession(authOptions);

  if (!session || session?.user?.role !== "admin") {
    redirect('/pages/misc/401-not-authorized');
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }

  try {
    const settingsRepository = AppDataSource.getRepository(Settings)

    const settings = await settingsRepository.find();

    if (settings.length) {
      await settingsRepository.update(settings[0].id, { url: endpoint });
    } else {
      await settingsRepository.save({ url: endpoint });
    }

    return { success: true }
  } catch (e) {
    console.error("Error updating settings:", e);

    return { success: false }
  }
}
