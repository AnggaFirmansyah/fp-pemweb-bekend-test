module.exports = {
  apps: [
    {
      name: 'fp-be-development',
      script: 'dotenv -e .env.development -- ./server',
      cdw: '/root/FP-PemrogramanWebsite-BE-2025/development',
      env_file: '.env.development',
      shutdown_with_message: true
    },
    {
      name: 'fp-be-production',
      script: 'dotenv -e .env.production -- ./server',
      cdw: '/root/FP-PemrogramanWebsite-BE-2025/production',
      env_file: '.env.production',
      shutdown_with_message: true
    }
  ]
}
