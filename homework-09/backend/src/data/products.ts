import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Product } from "../types";

// Загрузка данных товаров из файла JSON.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "../../data.json");

/**
 * Загружает список товаров из файла data.json.
 * @returns Массив товаров Product[]
 */
export async function loadProducts(): Promise<Product[]> {
  const raw = await readFile(dataPath, "utf-8");
  const parsed = JSON.parse(raw) as Product[];
  return parsed;
}
