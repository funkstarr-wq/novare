import nextEnv from '@next/env'

// Same .env loading as `next dev` and `payload run`; values already in the environment win.
nextEnv.loadEnvConfig(process.cwd())
