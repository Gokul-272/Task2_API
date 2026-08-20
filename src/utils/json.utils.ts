import fs from "node:fs/promises";
export const readData = async <T>(filename: string): Promise<T[]> => {
  const filePath = `./data/${filename}`;
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as T[];
  } catch (error: unknown) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
};

export const writeData = async <T>(filename: string, data: T[]): Promise<void> => {
  const filePath = `./data/${filename}`;
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonString, "utf-8");
  } catch (error: unknown) {
    throw new Error(`Failed to save ${filename}`);
  }
};
