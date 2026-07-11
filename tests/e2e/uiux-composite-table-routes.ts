export const COMPOSITE_TABLE_ROUTES = [
  { name: 'repair-list', path: '/sua-chua-bao-hanh', minWidth: 768 },
  { name: 'repair-kt', path: '/sua-chua-bao-hanh-kt' },
  { name: 'finance-thu-chi', path: '/tai-chinh/thu-chi' },
  { name: 'warehouse-ton-kho', path: '/quan-ly-kho/ton-kho' },
  { name: 'warehouse-ton-kho-lk-xac', path: '/quan-ly-kho/ton-kho-lk-xac' },
  { name: 'warehouse-ds-tra-lk', path: '/quan-ly-kho/ds-tra-lk' },
  { name: 'warehouse-ds-tra-lk-xac', path: '/quan-ly-kho/ds-tra-lk-xac' },
  { name: 'warehouse-thu-hoi-lk', path: '/quan-ly-kho/thu-hoi-lk' },
] as const

export const COMPOSITE_TABLE_PATHS = new Set<string>(
  COMPOSITE_TABLE_ROUTES.map((route) => route.path),
)
