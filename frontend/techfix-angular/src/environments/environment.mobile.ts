// Environment para builds móviles (Android / iOS)
// El apiUrl apunta a la URL de producción de tu backend.
// Si el backend corre en la misma red local durante desarrollo,
// usa la IP de tu máquina, ej: 'http://192.168.1.100:5000/api'
export const environment = {
  production: true,
  isMobile: true,
  apiUrl: 'https://willow-jason-minds-reaching.trycloudflare.com/api',
};
