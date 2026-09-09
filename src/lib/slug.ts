/**
 * Kebab-case a display name into a stable slug: "St Vinnies — Kingston"
 * becomes "st-vinnies-kingston". Non-ASCII letters are folded to ASCII.
 *
 * @param name - Display name to slugify
 * @returns kebab-case slug
 */
export function toSlug(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[øØ]/g, 'o')
    .replace(/[æÆ]/g, 'ae')
    .replace(/[åÅ]/g, 'a')
    .replace(/đ/g, 'd')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}
