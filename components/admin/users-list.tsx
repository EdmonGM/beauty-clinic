"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { SearchIcon } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ClientPagination } from "./client-pagination"
import { getAllClients } from "@/lib/actions/users"
import { AdminClientListItem, ClientPage } from "@/types/user"
import { format } from "date-fns"

type LoadedPage = {
  query: string
  page: number
  data: ClientPage<AdminClientListItem>
}

type UsersListProps = {
  initialData: ClientPage<AdminClientListItem>
}

export function UsersList({ initialData }: UsersListProps) {
  const [loaded, setLoaded] = useState<LoadedPage>({
    query: "",
    page: 1,
    data: initialData,
  })
  const [queryInput, setQueryInput] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const loading = loaded.query !== query || loaded.page !== page

  useEffect(() => {
    const id = setTimeout(() => {
      setQuery(queryInput.trim().slice(0, 100))
      setPage(1)
    }, 350)
    return () => clearTimeout(id)
  }, [queryInput])

  useEffect(() => {
    getAllClients(query, page).then((res) => {
      if (res.success) {
        setError(null)
        setLoaded({ query, page, data: res.data })
      } else {
        setError(res.message)
      }
    })
  }, [query, page])

  const data = loaded.data

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="font-heading text-2xl font-semibold">Clients</h1>
        {data.total > 0 && <Badge variant="secondary">{data.total}</Badge>}
      </div>

      <div className="relative max-w-sm">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          placeholder="Search by name, email or phone..."
          aria-label="Search clients"
          className="pl-9"
        />
      </div>

      {error && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Error while fetching clients.
          </p>
        </div>
      )}

      {!error && loading && data.items.length === 0 && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {!error && !loading && data.items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            {query ? "No clients match your search." : "No clients yet."}
          </p>
        </div>
      )}

      {!error && data.items.length > 0 && (
        <>
          <div className="rounded-2xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Appointments</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <Link
                        href={`/admin/users/${client.id}`}
                        className="flex flex-col hover:underline"
                      >
                        <span className="font-medium">{client.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {client.email}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {client.phone || "—"}
                    </TableCell>
                    <TableCell>{client.appointmentCount}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(client.createdAt), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {data.totalPages > 1 && (
            <ClientPagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              label="clients"
              disabled={loading}
              onPageChangeAction={setPage}
            />
          )}
        </>
      )}
    </div>
  )
}
