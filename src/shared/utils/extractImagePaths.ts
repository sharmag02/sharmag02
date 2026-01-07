export function extractImagePaths(html: string): string[] {
  if (!html) return [];

  const regex = /<img[^>]+src="([^">]+)"/g;
  const paths: string[] = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    const url = match[1];

    // Supabase public URL → storage path
    const marker = "/storage/v1/object/public/";
    const index = url.indexOf(marker);

    if (index !== -1) {
      paths.push(url.substring(index + marker.length));
    }
  }

  return paths;
}
