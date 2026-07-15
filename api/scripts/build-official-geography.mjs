#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const [provinceSource, communeSource] = process.argv.slice(2)
if (!provinceSource || !communeSource) {
  throw new Error(
    'Usage: node scripts/build-official-geography.mjs <current-provinces.json> <current-wards.json>',
  )
}

const sourceCommit = 'faa205f656149acbd4c6f03ec1407a2e7cd6dff4'
const officialCorrections = new Map([
  ['24496', { name: 'Ea Kly', type: 'commune', normalizedName: 'ea kly' }],
])
const scriptDir = resolve(fileURLToPath(new URL('.', import.meta.url)))
const fixtureDir = resolve(scriptDir, '../seed-fixtures')
const readJson = (path) => JSON.parse(readFileSync(resolve(path), 'utf8'))
const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`
const checksum = (path) =>
  createHash('sha256').update(readFileSync(path)).digest('hex')

const provinces = readJson(provinceSource).map((row) => ({
  code: row.code,
  name: row.name,
  type: row.type,
  normalizedName: row.normalizedName,
}))
const communes = readJson(communeSource).map((sourceRow) => {
  const row = { ...sourceRow, ...officialCorrections.get(sourceRow.code) }
  return {
    code: row.code,
    name: row.name,
    type: row.type,
    normalizedName: row.normalizedName,
    provinceCode: row.provinceCode,
  }
})

const provinceCodes = new Set(provinces.map((row) => row.code))
const communeCodes = new Set(communes.map((row) => row.code))
if (provinces.length !== 34 || provinceCodes.size !== 34) {
  throw new Error(`Expected 34 unique provinces, received ${provinces.length}`)
}
if (communes.length !== 3321 || communeCodes.size !== 3321) {
  throw new Error(`Expected 3321 unique communes, received ${communes.length}`)
}
for (const row of provinces) {
  if (!/^\d{2}$/.test(row.code) || !['city', 'province'].includes(row.type)) {
    throw new Error(`Invalid province row: ${JSON.stringify(row)}`)
  }
}
for (const row of communes) {
  if (
    !/^\d{5}$/.test(row.code) ||
    !provinceCodes.has(row.provinceCode) ||
    !['ward', 'commune', 'special_zone'].includes(row.type)
  ) {
    throw new Error(`Invalid commune row: ${JSON.stringify(row)}`)
  }
}

const provinceTarget = resolve(fixtureDir, 'tinh-thanh.json')
const communeTarget = resolve(fixtureDir, 'phuong-xa-2025.json')
writeFileSync(provinceTarget, stableJson(provinces))
writeFileSync(communeTarget, stableJson(communes))

const metadata = {
  version: 'official-2025.07.01',
  effectiveFrom: '2025-07-01',
  sourceDocument:
    'Quyết định 19/2025/QĐ-TTg — Danh mục và mã số các đơn vị hành chính Việt Nam',
  officialSourceUrl: 'https://danhmuchanhchinh.nso.gov.vn/',
  transformationAid: {
    repository: 'https://github.com/zindont/vietnam-address-kit',
    commit: sourceCommit,
    license: 'MIT',
    sourceConversionTableSha256:
      '213966723785859dedd7c88965d6f12f8c3c508c91796e003804cf60a1054fc2',
  },
  officialCorrections: [
    {
      code: '24496',
      source: 'https://danhmuchanhchinh.nso.gov.vn/DMDVHC.asmx',
      verifiedName: 'Xã Ea Kly',
      verifiedType: 'Xã',
    },
  ],
  counts: { provinces: provinces.length, communes: communes.length },
  checksums: {
    provincesSha256: checksum(provinceTarget),
    communesSha256: checksum(communeTarget),
  },
}
writeFileSync(resolve(fixtureDir, 'dia-ly-metadata.json'), stableJson(metadata))

console.log(
  `Built Decision 19 geography fixtures: ${provinces.length} provinces, ${communes.length} communes`,
)
