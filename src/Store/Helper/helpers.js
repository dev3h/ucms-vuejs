export const getCookie = (name) => {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=')
    return parts[0] === name ? decodeURIComponent(parts[1]) : r
  }, '')
}
export const filterPasswordInput = (value) => {
  return value.normalize('NFD').replace(/[\u0300-\u036f\s]/g, '');
}