/**
 * Chunk an array into smaller arrays of a given size.
 */
export function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Helper to create many entries via the Contentful Management SDK.
 * `client` is expected to be an instance of the Management client.
 */
export async function batchCreateEntries(client: any, spaceId: string, environmentId: string, contentTypeId: string, entries: any[]) {
  const created: any[] = [];
  for (const entry of entries) {
    const createdEntry = await client.entry.createOrUpdate({
      spaceId,
      environmentId,
      contentTypeId,
      entryId: entry.fields.code['en-US'], // use code as entryId to guarantee uniqueness
      fields: entry.fields,
    });
    created.push(createdEntry);
  }
  return created;
}

/**
 * Publish an array of entries.
 */
export async function publishEntries(client: any, spaceId: string, environmentId: string, entries: any[]) {
  for (const entry of entries) {
    await client.entry.publish({
      spaceId,
      environmentId,
      entryId: entry.sys.id,
    });
  }
}
