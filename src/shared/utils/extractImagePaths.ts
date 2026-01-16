export function extractImagePaths(html: string): string[] {
  const regex = /src="https:\/\/.*?\/storage\/v1\/object\/public\/blog_images\/(.*?)"/g;
  const paths: string[] = [];

  let match;
  while ((match = regex.exec(html)) !== null) {
    paths.push(match[1]);
  }

  return paths;
}
