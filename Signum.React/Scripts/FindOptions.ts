import { TypeReference, PseudoType, QueryKey, getLambdaMembers, QueryTokenString } from './Reflection';
import { Lite, Entity } from './Signum.Entities';
import { PaginationMode, OrderType, FilterOperation, FilterType, ColumnOptionsMode, UniqueType, SystemTimeMode, FilterGroupOperation } from './Signum.Entities.DynamicQuery';
import { SearchControlProps } from "./Search";

export { PaginationMode, OrderType, FilterOperation, FilterType, ColumnOptionsMode, UniqueType };

export interface ValueFindOptions {
  queryName: PseudoType | QueryKey;
  filterOptions?: FilterOption[];
}

export interface ValueFindOptionsParsed {
  queryKey: string;
  filterOptions: FilterOptionParsed;
}

export interface ModalFindOptions {
  title?: React.ReactNode;
  message?: React.ReactNode;
  useDefaultBehaviour?: boolean;
  autoSelectIfOne?: boolean;
  searchControlProps?: Partial<SearchControlProps>;
}

export interface FindOptions {
  queryName: PseudoType | QueryKey;
  groupResults?: boolean;
  parentToken?: string | QueryTokenString<any>;
  parentValue?: any;

  includeDefaultFilters?: boolean;
  filterOptions?: FilterOption[];
  orderOptions?: OrderOption[];
  columnOptionsMode?: ColumnOptionsMode;
  columnOptions?: ColumnOption[];
  pagination?: Pagination;
  systemTime?: SystemTime;
}

export interface FindOptionsParsed {
  queryKey: string;
  groupResults: boolean;
  filterOptions: FilterOptionParsed[];
  orderOptions: OrderOptionParsed[];
  columnOptions: ColumnOptionParsed[];
  pagination: Pagination;
  systemTime?: SystemTime;
}


export type FilterOption = FilterConditionOption | FilterGroupOption;

export function isFilterGroupOption(fo: FilterOption): fo is FilterGroupOption {
  return (fo as FilterGroupOption).groupOperation != undefined;
}

export interface FilterConditionOption {
  token: string | QueryTokenString<any>;
  frozen?: boolean;
  operation?: FilterOperation;
  value?: any;
  pinned?: PinnedFilter;
}

export interface FilterGroupOption {
  token?: string | QueryTokenString<any>;
  groupOperation: FilterGroupOperation;
  filters: FilterOption[];
  pinned?: PinnedFilter;
  value?: string; /*For search in multiple columns*/
}

export type FilterOptionParsed = FilterConditionOptionParsed | FilterGroupOptionParsed;

export function isFilterGroupOptionParsed(fo: FilterOptionParsed): fo is FilterGroupOptionParsed {
  return (fo as FilterGroupOptionParsed).groupOperation != undefined;
}

export interface FilterConditionOptionParsed {
  token?: QueryToken;
  frozen: boolean;
  operation?: FilterOperation;
  value: any;
  pinned?: PinnedFilter;
}

export interface PinnedFilter {
  label?: string;
  row?: number;
  column?: number;
  disableOnNull?: boolean;
  splitText?: boolean;
}

export interface FilterGroupOptionParsed {
  groupOperation: FilterGroupOperation;
  frozen: boolean;
  expanded: boolean;
  token?: QueryToken;
  filters: FilterOptionParsed[];
  pinned?: PinnedFilter;
  value?: string; /*For search in multiple columns*/
}

export interface OrderOption {
  token: string | QueryTokenString<any>;
  orderType: OrderType;
}

export interface OrderOptionParsed {
  token: QueryToken;
  orderType: OrderType;
}

export interface ColumnOption {
  token: string | QueryTokenString<any>;
  displayName?: string;
}

export interface ColumnOptionParsed {
  token?: QueryToken;
  displayName?: string;
}

export const DefaultPagination: Pagination = {
  mode: "Paginate",
  elementsPerPage: 20,
  currentPage: 1
};


export type FindMode = "Find" | "Explore";

export enum SubTokensOptions {
  CanAggregate = 1,
  CanAnyAll = 2,
  CanElement = 4,
}

export interface QueryToken {
  toStr: string;
  niceName: string;
  key: string;
  format?: string;
  unit?: string;
  type: TypeReference;
  typeColor: string;
  niceTypeName: string;
  isGroupable: boolean;
  hasOrderAdapter?: boolean;
  preferEquals?: boolean;
  filterType?: FilterType;
  fullKey: string;
  queryTokenType?: QueryTokenType;
  parent?: QueryToken;
  propertyRoute?: string;
}

export type QueryTokenType = "Aggregate" | "Element" | "AnyOrAll";

export function hasAnyOrAll(token: QueryToken | undefined): boolean {
  if (token == undefined)
    return false;

  if (token.queryTokenType == "AnyOrAll")
    return true;

  return hasAnyOrAll(token.parent);
}

export function isPrefix(prefix: QueryToken, token: QueryToken): boolean {
  return prefix.fullKey == token.fullKey || token.fullKey.startsWith(prefix.fullKey + ".");
}

export function hasAggregate(token: QueryToken | undefined): boolean {
  if (token == undefined)
    return false;

  if (token.queryTokenType == "Aggregate")
    return true;

  return hasAggregate(token.parent);
}

export function withoutAggregate(fop: FilterOptionParsed): FilterOptionParsed | undefined {

  if (hasAggregate(fop.token))
    return undefined;

  if (isFilterGroupOptionParsed(fop)) {
    var newFilters = fop.filters.map(f => withoutAggregate(f)).filter(Boolean);
    if (newFilters.length == 0)
      return undefined;
    return ({
      ...fop,
      filters: newFilters,
    }) as FilterOptionParsed;
  };

  return {
    ...fop,
  };
}

export function getTokenParents(token: QueryToken | null | undefined): QueryToken[] {
  const result: QueryToken[] = [];
  while (token) {
    result.insertAt(0, token);
    token = token.parent;
  }
  return result;
}

export function toQueryToken(cd: ColumnDescription): QueryToken {
  return {
    toStr: cd.displayName,
    niceName: cd.displayName,
    key: cd.name,
    fullKey: cd.name,
    unit: cd.unit,
    format: cd.format,
    type: cd.type,
    typeColor: cd.typeColor,
    niceTypeName: cd.niceTypeName,
    filterType: cd.filterType,
    isGroupable: cd.isGroupable,
    hasOrderAdapter: cd.hasOrderAdapter,
    preferEquals: cd.preferEquals,
    propertyRoute: cd.propertyRoute
  };
}

export type FilterRequest = FilterConditionRequest | FilterGroupRequest;

export function isFilterGroupRequest(fr: FilterRequest): fr is FilterGroupRequest {
  return (fr as FilterGroupRequest).groupOperation != null;
}

export interface FilterGroupRequest {
  groupOperation: FilterGroupOperation;
  token?: string;
  filters: FilterRequest[];
}

export interface FilterConditionRequest {
  token: string;
  operation: FilterOperation;
  value: any;
}

export interface OrderRequest {
  token: string;
  orderType: OrderType
}

export interface ColumnRequest {
  token: string;
  displayName: string;
}

export interface QueryEntitiesRequest {
  queryKey: string;
  filters: FilterRequest[];
  orders: OrderRequest[];
  count: number | null;
}

export interface QueryRequest {
  queryKey: string;
  groupResults: boolean;
  filters: FilterRequest[];
  orders: OrderRequest[];
  columns: ColumnRequest[];
  pagination: Pagination;
  systemTime?: SystemTime;
}

export type AggregateType = "Count" | "Average" | "Sum" | "Min" | "Max";

export interface QueryValueRequest {
  queryKey: string;
  filters: FilterRequest[];
  valueToken?: string;
  systemTime?: SystemTime;
}

export interface ResultColumn {
  displayName: string;
  token: QueryToken;
}

export interface ResultTable {
  queryKey: string;
  entityColumn: string;
  columns: string[];
  rows: ResultRow[];
  pagination: Pagination
  totalElements: number;
}


export interface ResultRow {
  entity?: Lite<Entity>;
  columns: any[];
}

export interface Pagination {
  mode: PaginationMode;
  elementsPerPage?: number;
  currentPage?: number;
}

export interface SystemTime {
  mode: SystemTimeMode;
  startDate?: string;
  endDate?: string;
}

export module PaginateMath {
  export function startElementIndex(p: Pagination) {
    return (p.elementsPerPage! * (p.currentPage! - 1)) + 1;
  }

  export function endElementIndex(p: Pagination, rows: number) {
    return startElementIndex(p) + rows - 1;
  }

  export function totalPages(p: Pagination, totalElements: number) {
    return Math.max(1, Math.ceil(totalElements / p.elementsPerPage!)); //Round up
  }

  export function maxElementIndex(p: Pagination) {
    return (p.elementsPerPage! * (p.currentPage! + 1)) - 1;
  }
}





export interface QueryDescription {
  queryKey: string;
  columns: { [name: string]: ColumnDescription };
}

export interface ColumnDescription {
  name: string;
  type: TypeReference;
  filterType: FilterType;
  typeColor: string;
  niceTypeName: string;
  unit?: string;
  format?: string;
  displayName: string;
  isGroupable: boolean;
  hasOrderAdapter?: boolean;
  preferEquals?: boolean;
  propertyRoute?: string;
}

export function isList(fo: FilterOperation) {
  return fo == "IsIn" ||
    fo == "IsNotIn";
}


export const filterOperations: { [a: string /*FilterType*/]: FilterOperation[] } = {};
filterOperations["String"] = [
  "Contains",
  "EqualTo",
  "StartsWith",
  "EndsWith",
  "Like",
  "NotContains",
  "DistinctTo",
  "NotStartsWith",
  "NotEndsWith",
  "NotLike",
  "IsIn",
  "IsNotIn"
];

filterOperations["DateTime"] = [
  "EqualTo",
  "DistinctTo",
  "GreaterThan",
  "GreaterThanOrEqual",
  "LessThan",
  "LessThanOrEqual",
  "IsIn",
  "IsNotIn"
];

filterOperations["Integer"] = [
  "EqualTo",
  "DistinctTo",
  "GreaterThan",
  "GreaterThanOrEqual",
  "LessThan",
  "LessThanOrEqual",
  "IsIn",
  "IsNotIn"
];

filterOperations["Decimal"] = [
  "EqualTo",
  "DistinctTo",
  "GreaterThan",
  "GreaterThanOrEqual",
  "LessThan",
  "LessThanOrEqual",
  "IsIn",
  "IsNotIn"
];

filterOperations["Enum"] = [
  "EqualTo",
  "DistinctTo",
  "GreaterThan",
  "GreaterThanOrEqual",
  "LessThan",
  "LessThanOrEqual",
  "IsIn",
  "IsNotIn",
];

filterOperations["Guid"] = [
  "EqualTo",
  "DistinctTo",
  "IsIn",
  "IsNotIn"
];

filterOperations["Lite"] = [
  "EqualTo",
  "DistinctTo",
  "IsIn",
  "IsNotIn"
];

filterOperations["Embedded"] = [
  "EqualTo",
  "DistinctTo",
];

filterOperations["Boolean"] = [
  "EqualTo",
  "DistinctTo",
];
