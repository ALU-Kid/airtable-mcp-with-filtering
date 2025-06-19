import nock from 'nock';
import axios from 'axios';
import { AirtableClient } from '../src/airtable.js';

// Ensure proxy settings don't interfere with nock
for (const key of ['http_proxy', 'https_proxy', 'HTTP_PROXY', 'HTTPS_PROXY']) {
  delete (process as any).env[key];
}
nock.disableNetConnect();

describe('AirtableClient listRecords', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  test('fetches all pages when autoPaginate is true', async () => {
    const scope = nock('https://api.airtable.com')
      .get('/v0/base/table')
      .query(true)
      .reply(200, { records: [{ id: '1' }], offset: 'abc' })
      .get('/v0/base/table')
      .query((actual) => actual.offset === 'abc')
      .reply(200, { records: [{ id: '2' }] });

    const axiosInstance = axios.create({ baseURL: 'https://api.airtable.com/v0', proxy: false });
    const client = new AirtableClient(axiosInstance);
    const records = await client.listRecords('base', 'table', { autoPaginate: true });
    expect(records).toHaveLength(2);
    scope.done();
  });

  test('includes filterByFormula in all requests', async () => {
    const formula = 'FIELD=1';
    const scope = nock('https://api.airtable.com')
      .get('/v0/base/table')
      .query((q) => q.filterByFormula === formula)
      .reply(200, { records: [{ id: '1' }], offset: 'nxt' })
      .get('/v0/base/table')
      .query((q) => q.offset === 'nxt' && q.filterByFormula === formula)
      .reply(200, { records: [{ id: '2' }] });

    const axiosInstance = axios.create({ baseURL: 'https://api.airtable.com/v0', proxy: false });
    const client = new AirtableClient(axiosInstance);
    const records = await client.listRecords('base', 'table', { autoPaginate: true, filterByFormula: formula });
    expect(records.map(r => r.id)).toEqual(['1', '2']);
    scope.done();
  });
});
