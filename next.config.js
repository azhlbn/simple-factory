/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Делаем переменные окружения доступными на клиенте
  env: {
    PINATA_API_KEY: process.env.PINATA_API_KEY,
    PINATA_API_SECRET: process.env.PINATA_API_SECRET
  }
}

module.exports = nextConfig
