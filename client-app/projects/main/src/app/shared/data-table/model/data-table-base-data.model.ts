export type DataTableBaseData = { [key: string]: any } & {
  rowClass?: string | (() => string);
}
