import { getAllClients } from "@/lib/actions/users"
import { UsersList } from "@/components/admin/users-list"

export default async function AdminUsersPage() {
  const response = await getAllClients("", 1)

  if (!response.success) {
    return <p className="text-muted-foreground">ERROR</p>
  }

  return <UsersList initialData={response.data} />
}
