import { createClient } from 'redis'

const client = createClient({ url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` })

client.on('error', (err) => console.log('Redis Client Error', err))
client.connect().then(() => console.log('Redis is connected and ready to work!'))

export const Redis = client