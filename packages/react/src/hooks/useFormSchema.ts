import { useEffect, useState } from 'react'
import type { FormSchema } from '@osforms/types'

interface UseFormSchemaResult {
  schema: FormSchema | null
  formName: string
  redirectUrl: string | null
  loading: boolean
  error: string | null
}

export function useFormSchema(
  formId: string,
  baseUrl = 'https://osforms.com'
): UseFormSchemaResult {
  const [schema, setSchema] = useState<FormSchema | null>(null)
  const [formName, setFormName] = useState('')
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!formId) return

    setLoading(true)
    setError(null)

    fetch(`${baseUrl}/api/v1/f/${formId}/schema`)
      .then((res) => {
        if (!res.ok) throw new Error(`Form not found (${res.status})`)
        return res.json()
      })
      .then((data) => {
        setSchema(data.schema)
        setFormName(data.formName ?? '')
        setRedirectUrl(data.redirectUrl ?? null)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load form')
      })
      .finally(() => setLoading(false))
  }, [formId, baseUrl])

  return { schema, formName, redirectUrl, loading, error }
}
