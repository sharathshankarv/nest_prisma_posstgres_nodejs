export class GetAllUserDto {
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
  role: {
    id: string;
    name: string;
  };
}
