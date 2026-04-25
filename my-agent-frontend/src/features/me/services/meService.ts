export interface ProfileUpdate {
  name?: string;
  team?: string;
  manager?: string;
}

export const meService = {
  updateProfile: async (_data: ProfileUpdate): Promise<void> => {
    await new Promise((r) => setTimeout(r, 400));
  },
};
