import { type Role } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      nombre: string;
      apellido: string;
      role: Role;
    };
  }

  interface User {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    role: Role;
    activo: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    nombre: string;
    apellido: string;
  }
}
