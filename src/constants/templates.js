export const TEMPLATE_CATEGORIES = {
  floral: 'Floral',
  nature: 'Nature',
  indoor: 'Indoor',
  studio: 'Studio',
}
export const TEMPLATE_CATEGORY_OPTIONS = Object.keys(TEMPLATE_CATEGORIES).map((key) => ({
  value: key,
  title: TEMPLATE_CATEGORIES[key],
}))

