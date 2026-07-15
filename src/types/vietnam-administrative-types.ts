export interface VietnamProvince {
  code: string
  name: string
  type: string
}

export interface VietnamCommune {
  code: string
  name: string
  type: string
  normalizedName: string
  provinceCode: string
  provinceName: string
}

export interface VietnamAdministrativeSnapshot {
  version: string
  effectiveFrom: string
  sourceDocument: string
  provinces: VietnamProvince[]
  communes: VietnamCommune[]
}
