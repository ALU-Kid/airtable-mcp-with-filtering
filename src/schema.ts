import { z } from "zod";

export const ListRecordsArgumentsSchema = z.object({
  base_id: z.string(),
  table_name: z.string(),
  limit: z.number().int().positive().optional(),
  filterByFormula: z.string().optional(),
  autoPaginate: z.boolean().optional(),
  sort: z
    .array(
      z.object({
        field: z.string(),
        direction: z.enum(["asc", "desc"]),
      })
    )
    .optional(),
});

export type ListRecordsArguments = z.infer<typeof ListRecordsArgumentsSchema>;
