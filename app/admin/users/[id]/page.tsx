import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClientNotesForm } from "@/components/admin/client-notes-form"
import { ClientAppointmentsTable } from "@/components/admin/client-appointments-table"
import { getClientById } from "@/lib/actions/users"
import { format } from "date-fns"

type AdminUserDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function AdminUserDetailPage({
  params,
}: AdminUserDetailPageProps) {
  const { id } = await params
  const response = await getClientById(id)

  if (!response.success) {
    return <p className="text-muted-foreground">ERROR</p>
  }

  if (!response.data) {
    notFound()
  }

  const client = response.data

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" render={<Link href="/admin/users" />}>
          Back to clients
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <h1 className="font-heading text-2xl font-semibold">{client.name}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="mt-1 font-medium">{client.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="mt-1 font-medium">{client.phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Member since</dt>
                <dd className="mt-1 font-medium">
                  {format(new Date(client.createdAt), "MMMM d, yyyy")}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientNotesForm clientId={client.id} initialNotes={client.notes} />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Booking History</h2>
        <ClientAppointmentsTable
          clientId={client.id}
          initialAppointments={client.appointments}
        />
      </div>
    </div>
  )
}
