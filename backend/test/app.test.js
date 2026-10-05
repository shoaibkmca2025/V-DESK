import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { startTestDb, stopTestDb } from './db.js';

const app = createApp();

describe('platform', () => {
  beforeAll(startTestDb);
  afterAll(stopTestDb);

  it('GET /health answers without touching the database', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { status: 'ok' } });
  });

  it('GET /ready reports the database connection', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ready');
    expect(mongoose.connection.readyState).toBe(1);
  });

  it('unknown routes return the standard error envelope with a request id', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: 'ROUTE_NOT_FOUND' });
    expect(res.body.error.requestId).toBe(res.headers['x-request-id']);
  });

  it('reuses a caller-supplied X-Request-Id', async () => {
    const res = await request(app).get('/health').set('X-Request-Id', 'abc-123');
    expect(res.headers['x-request-id']).toBe('abc-123');
  });

  it('rejects malformed JSON with 400 INVALID_JSON', async () => {
    const res = await request(app).post('/api/v1/leads').set('Content-Type', 'application/json').send('{"name":');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_JSON');
  });

  it('sends security headers and allows the frontend origin', async () => {
    const res = await request(app).get('/health').set('Origin', 'http://localhost:5173');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });
});
