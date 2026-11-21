type CreateGroupInput = {
  name: string;
  description: string;
  memberIds: string[];
  visibility: "private" | "public";
  approval: boolean;
  disappearing: boolean;
  adminsOnly: boolean;
};

export function createGroup(input: CreateGroupInput): Promise<{ id: string }> {
  const id = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id }), 700);
  });
}
