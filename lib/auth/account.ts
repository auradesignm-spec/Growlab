export function isAccountRestricted(status: string | null | undefined): boolean {
  return status === "banned" || status === "suspended";
}
