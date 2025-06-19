import axios, { AxiosInstance } from "axios";

export interface SortParam {
  field: string;
  direction: "asc" | "desc";
}

export interface ListRecordsOptions {
  limit?: number;
  filterByFormula?: string;
  sort?: SortParam[];
  autoPaginate?: boolean;
}

export class AirtableClient {
  private axios: AxiosInstance;

  constructor(apiKeyOrAxios: string | AxiosInstance) {
    if (typeof apiKeyOrAxios === "string") {
      this.axios = axios.create({
        baseURL: "https://api.airtable.com/v0",
        headers: { Authorization: `Bearer ${apiKeyOrAxios}` },
      });
    } else {
      this.axios = apiKeyOrAxios;
    }
  }

  async listRecords(
    baseId: string,
    tableName: string,
    opts: ListRecordsOptions = {}
  ): Promise<any[]> {
    const {
      limit,
      filterByFormula,
      sort,
      autoPaginate = false,
    } = opts;

    const params: Record<string, any> = {};
    if (limit) params.maxRecords = limit;
    if (filterByFormula) params.filterByFormula = filterByFormula;
    if (sort) params.sort = sort;

    if (!autoPaginate) {
      const res = await this.axios.get(`/${baseId}/${tableName}`, { params });
      return res.data.records;
    }

    let offset: string | undefined;
    let records: any[] = [];
    do {
      const res = await this.axios.get(`/${baseId}/${tableName}`, {
        params: { ...params, offset },
      });
      records = records.concat(res.data.records);
      offset = res.data.offset;
      if (limit && records.length >= limit) {
        records = records.slice(0, limit);
        break;
      }
    } while (offset);

    return records;
  }
}

async function paginationTest() {
  let call = 0;
  const responses = [
    { data: { records: [{ id: "1" }], offset: "abc" } },
    { data: { records: [{ id: "2" }] } },
  ];
  const mockAxios = {
    get: async () => responses[call++],
  } as unknown as AxiosInstance;

  const client = new AirtableClient(mockAxios);
  const records = await client.listRecords("base", "table", { autoPaginate: true });
  if (records.length !== 2) {
    throw new Error("Pagination test failed");
  }
  console.log("Pagination test passed");
}

if (
  process.argv[1] &&
  (process.argv[1].endsWith("airtable.ts") || process.argv[1].endsWith("airtable.js"))
) {
  paginationTest().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
