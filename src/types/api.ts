export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type ApiSuccess<T> = {
  success: true
  message: string
  meta?: PaginationMeta
  data: T
}

export type ApiFieldError = {
  path: string
  message: string
}

export type ApiFailure = {
  success: false
  message: string
  errors?: ApiFieldError[]
}

export type Paginated<T> = {
  meta: PaginationMeta
  data: T[]
}
