export const ROLE_LABEL: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
};

export function canManageBilling(role: string): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canManageTeam(role: string): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canManageWorkspace(role: string): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function isOwner(role: string): boolean {
  return role === "OWNER";
}
