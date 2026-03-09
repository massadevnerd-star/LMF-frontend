"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreVertical, Shield, Plus, Minus, Baby } from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";
import { adminService } from "@/app/services/adminService";


interface Role {
  id: number;
  name: string;
}

interface Child {
  id: number;
  nickname: string;
  avatar?: string;
  // Add other child fields if needed
}

interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  children?: Child[];
}

export default function AdminUsersPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push("/login?redirect=/admin/users");
        return;
      }

      const isAdmin = user.roles?.some((r: any) => r.name === "admin");

      if (!isAdmin) {
        // Handle non-admin access
      }
    }
  }, [user, isAuthLoading, router]);

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUsers();
      // Backend returns pagination object { data: [], ... }
      setUsers(data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (user?.roles?.some((r: any) => r.name === "admin")) {
      fetchUsers();
    }
  }, [user]);

  const handleAssignRole = async (userId: number, roleName: string) => {
    try {
      await adminService.assignRole(userId, roleName);
      fetchUsers();
    } catch (error) {
      console.error("Error assigning role:", error);
      alert("Failed to assign role");
    }
  };

  if (
    isAuthLoading ||
    (user && user.roles?.some((r: any) => r.name === "admin") && isLoadingUsers)
  ) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !user.roles?.some((r: any) => r.name === "admin")) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 text-center border-t-8 border-red-500">
          <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-gray-800 mb-2">
            Accesso Negato
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Non hai i permessi necessari per accedere a questa area. Questa
            pagina è riservata agli amministratori.
          </p>
          <Button
            className="font-bold w-full"
            size="lg"
            onClick={() => router.push("/")}
          >
            Torna alla Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Gestione Utenti</h1>
        <p className="text-gray-500">Gestisci ruoli e permessi degli utenti registrati.</p>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[300px]">NOME</TableHead>
              <TableHead>EMAIL</TableHead>
              <TableHead>RUOLO</TableHead>
              <TableHead className="text-right">AZIONI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <React.Fragment key={user.id}>
                <TableRow className="hover:bg-gray-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.children && user.children.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-6 w-6"
                          onClick={() => {
                            setExpandedRows(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(user.id)) newSet.delete(user.id);
                              else newSet.add(user.id);
                              return newSet;
                            });
                          }}
                        >
                          {expandedRows.has(user.id) ? (
                            <Minus className="w-4 h-4 text-gray-500" />
                          ) : (
                            <Plus className="w-4 h-4 text-gray-500" />
                          )}
                        </Button>
                      )}
                      <div className="font-bold text-gray-900">{user.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500 font-medium">{user.email}</TableCell>
                  <TableCell>
                    {user.roles.map((r) => (
                      <span
                        key={r.id}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2
                                      ${r.name === 'admin' ? 'bg-purple-100 text-purple-800' :
                            r.name === 'parent' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'}`}
                      >
                        {r.name === 'admin' ? '👑 Admin' : r.name === 'parent' ? '👨‍👩‍👧 Genitore' : '🧒 Bambino'}
                      </span>
                    ))}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAssignRole(user.id, "admin")}>
                          Assegna Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAssignRole(user.id, "parent")}>
                          Assegna Genitore
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAssignRole(user.id, "kid")}>
                          Assegna Bambino
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                {/* Children Detail Row */}
                {expandedRows.has(user.id) && user.children && (
                  <TableRow className="bg-gray-50/50">
                    <TableCell colSpan={4} className="p-4 pl-12">
                      <div className="bg-white border rounded-xl p-4 shadow-sm">
                        <h4 className="flex items-center gap-2 font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">
                          <Baby className="w-4 h-4" /> Figli Registrati ({user.children.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {user.children.map(child => (
                            <div key={child.id} className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                <img
                                  src={child.avatar?.startsWith('http') ? child.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${child.avatar || child.nickname}`}
                                  alt={child.nickname}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-bold text-gray-800">{child.nickname}</p>
                                <p className="text-xs text-gray-500 font-mono">ID: {child.id}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
