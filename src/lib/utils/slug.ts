function slugifyVi(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, (c) => (c === 'đ' ? 'd' : 'D'))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8).padEnd(6, '0')
}

/** Slug khi tạo thiệp mới, chưa có tên: "chua-co-ten-x7k2p9" */
export function generateInitialSlug(): string {
  return `chua-co-ten-${randomSuffix()}`
}

/** Slug sau khi có tên: "minh-anh-x7k2p9" */
export function generateSlug(brideName?: string | null, groomName?: string | null): string {
  const bride = brideName ? slugifyVi(brideName) || 'chua-co-ten' : 'chua-co-ten'
  const groom = groomName ? slugifyVi(groomName) || 'chua-co-ten' : 'chua-co-ten'
  return `${bride}-${groom}-${randomSuffix()}`
}
