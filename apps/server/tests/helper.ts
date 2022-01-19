import { agent } from 'supertest'
import { app } from '../src/app'

export const request = agent(app)
