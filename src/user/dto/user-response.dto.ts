export class GetUserDto {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string | null;
  role: {
    id: string;
    name: string;
  };
}
