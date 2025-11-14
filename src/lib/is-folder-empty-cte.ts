import prisma from './prisma.js';

export async function isFolderEmptyCTE(folderId: string) {
  const result = await prisma.$queryRawUnsafe<
    { file_count: string | number | bigint }[]
  >(`
      WITH RECURSIVE folder_tree AS (
        SELECT id
        FROM folders
        WHERE id = '${folderId}'

        UNION ALL

        SELECT f.id
        FROM folders f
        JOIN folder_tree ft ON f."parent_folder_id" = ft.id
      )
      SELECT COUNT(*) AS file_count
      FROM files
      WHERE folder_id IN (SELECT id FROM folder_tree);
    `);

  return Number(result[0].file_count) === 0;
}
