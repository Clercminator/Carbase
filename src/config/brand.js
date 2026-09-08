// Change this one value to rename all customer-facing app branding.
export const APP_NAME = 'Carbase'
export const APP_SLUG = APP_NAME.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
