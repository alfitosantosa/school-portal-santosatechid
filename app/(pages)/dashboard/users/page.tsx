"use client";

import * as React from "react";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus, Pencil, Trash2, BookOpen, GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Import hooks
import { useGetUsers } from "@/app/hooks/Users/useUsers";
import { useGetBetterAuth } from "@/app/hooks/Users/useBetterAuth";

// Import dialog components
import { UserFormDialog, DeleteUserDialog, UserData, BetterAuthUser, DeleteUserBulkDialog } from "@/components/dialog/DialogUser";
import Image from "next/image";
import Loading from "@/components/loading";
import { useSession } from "@/lib/auth-client";
import { useGetUserByIdBetterAuth } from "@/app/hooks/Users/useUsersByIdBetterAuth";
import { unauthorized } from "next/navigation";

// Dashboard Component - Only rendered after role verification
function UserDashboard() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Filter selections
  const [roleSelection, setRoleSelection] = React.useState<string | null>(null);
  const [classSelection, setClassSelection] = React.useState<string | null>(null);
  const [majorSelection, setMajorSelection] = React.useState<string | null>(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteBulkDialogOpen, setDeleteBulkDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UserData | null>(null);

  // Fetch data with proper error handling
  const { data: usersData = [], isLoading, refetch, error } = useGetUsers();
  const { data: betterAuthUsers = [] } = useGetBetterAuth();

  // Helper function to get betterAuth user info
  const getBetterAuthUserInfo = React.useCallback(
    (userId: string): BetterAuthUser | undefined => {
      return betterAuthUsers.find((user: any) => user.id === userId);
    },
    [betterAuthUsers]
  );

  // Get unique values for filters
  const uniqueRoles = React.useMemo(() => {
    return Array.from(new Set(usersData.map((user: UserData) => user.role?.name).filter(Boolean)));
  }, [usersData]);

  const uniqueClasses = React.useMemo(() => {
    return Array.from(new Set(usersData.map((user: UserData) => user.class?.name).filter(Boolean)));
  }, [usersData]);

  const uniqueMajors = React.useMemo(() => {
    return Array.from(new Set(usersData.map((user: UserData) => user.major?.name).filter(Boolean)));
  }, [usersData]);

  // Define columns with useMemo to prevent recreation
  const columns = React.useMemo<ColumnDef<UserData>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
        cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "avatarUrl",
        header: "Avatar",
        cell: ({ row }) => {
          const avatarUrl = row.original.avatarUrl || "https://icons.veryicon.com/png/o/miscellaneous/rookie-official-icon-gallery/225-default-avatar.png";
          return <Image src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" width={40} height={40} />;
        },
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <div>{row.original.name ?? "-"}</div>,
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const role = row.original.role;
          if (!role) {
            return <Badge variant="secondary">-</Badge>;
          }
          return <Badge variant="secondary">{role.name}</Badge>;
        },
        filterFn: (row, columnId, filterValue) => {
          if (typeof filterValue === "function") {
            return filterValue(row);
          }
          if (!filterValue) return true;
          const role = row.original.role;
          return role?.name === filterValue;
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
          const email = row.getValue("email") as string;
          return <div className="lowercase">{email || "-"}</div>;
        },
      },
      {
        accessorKey: "class",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              <BookOpen className="mr-2 h-4 w-4" />
              Kelas
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const classData = row.original.class;
          return <div>{classData?.name || "-"}</div>;
        },
        filterFn: (row, columnId, filterValue) => {
          if (typeof filterValue === "function") {
            return filterValue(row);
          }
          if (!filterValue) return true;
          const classData = row.original.class;
          return classData?.name === filterValue;
        },
      },
      {
        accessorKey: "major",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              <GraduationCap className="mr-2 h-4 w-4" />
              Jurusan
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const major = row.original.major;
          return <div>{major?.name || "-"}</div>;
        },
        filterFn: (row, columnId, filterValue) => {
          if (typeof filterValue === "function") {
            return filterValue(row);
          }
          if (!filterValue) return true;
          const major = row.original.major;
          return major?.name === filterValue;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status as string;
          const getStatusVariant = (status: string) => {
            switch (status?.toLowerCase()) {
              case "active":
                return "default";
              case "inactive":
                return "secondary";
              case "graduated":
                return "outline";
              default:
                return "secondary";
            }
          };

          const getStatusLabel = (status: string) => {
            switch (status?.toLowerCase()) {
              case "active":
                return "Aktif";
              case "inactive":
                return "Tidak Aktif";
              case "graduated":
                return "Lulus";
              default:
                return status || "-";
            }
          };

          return <Badge variant={getStatusVariant(status)}>{getStatusLabel(status)}</Badge>;
        },
      },
      {
        accessorKey: "userId",
        header: "BetterAuth",
        cell: ({ row }) => {
          const userId = row.getValue("userId") as string;

          if (!userId) {
            return <Badge variant="outline">No BetterAuth</Badge>;
          }

          return (
            <div className="flex items-center space-x-2">
              <Badge variant="default">Linked</Badge>
            </div>
          );
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const userData = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(userData.id)}>Copy ID User</DropdownMenuItem>
                {userData.id && <DropdownMenuItem onClick={() => navigator.clipboard.writeText(userData.id!)}>Copy User ID</DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(userData);
                    setEditDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(userData);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [getBetterAuthUserInfo, setSelectedUser, setEditDialogOpen, setDeleteDialogOpen]
  );

  // Initialize table
  const table = useReactTable({
    data: usersData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Filter handlers
  const handleRoleFilter = React.useCallback(
    (roleName: string | null) => {
      setRoleSelection(roleName);
      if (roleName) {
        table.getColumn("role")?.setFilterValue(roleName);
      } else {
        table.getColumn("role")?.setFilterValue("");
      }
    },
    [table]
  );

  const handleClassFilter = React.useCallback(
    (className: string | null) => {
      setClassSelection(className);
      if (className) {
        table.getColumn("class")?.setFilterValue(className);
      } else {
        table.getColumn("class")?.setFilterValue("");
      }
    },
    [table]
  );

  const handleMajorFilter = React.useCallback(
    (majorName: string | null) => {
      setMajorSelection(majorName);
      if (majorName) {
        table.getColumn("major")?.setFilterValue(majorName);
      } else {
        table.getColumn("major")?.setFilterValue("");
      }
    },
    [table]
  );

  const handleSuccess = React.useCallback(async () => {
    try {
      setRowSelection({});
      setSelectedUser(null);
      await refetch();
    } catch (error) {
      console.error("Error refetching data:", error);
    }
  }, [refetch]);

  // Close dialog handlers
  const handleCloseCreateDialog = React.useCallback(() => {
    setCreateDialogOpen(false);
    setSelectedUser(null);
  }, []);

  const handleCloseEditDialog = React.useCallback(() => {
    setEditDialogOpen(false);
    setSelectedUser(null);
  }, []);

  const handleCloseDeleteDialog = React.useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  }, []);

  const handleCloseBulkDeleteDialog = React.useCallback(() => {
    setDeleteBulkDialogOpen(false);
    setRowSelection({});
  }, []);

  const handleBulkDeleteClick = React.useCallback(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length > 0) {
      setDeleteBulkDialogOpen(true);
    }
  }, [table]);

  // Loading state
  if (isLoading) {
    return <Loading />;
  }

  // Error state
  if (error) {
    return (
      <div className="w-full min-h-screen items-center justify-center h-32">
        <div className="text-center text-red-600">
          <p>Error loading users: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-7xl mx-auto my-8 p-6">
      <div className="font-bold text-3xl ">Users Menu</div>

      <div className="flex items-start justify-between py-4 gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Input placeholder="Cari nama user..." value={(table.getColumn("name")?.getFilterValue() as string) ?? ""} onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)} className="max-w-sm" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {roleSelection || "Filter Role"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleRoleFilter(null)}>Semua Role</DropdownMenuItem>
              <DropdownMenuSeparator />
              {uniqueRoles.map((roleName) => (
                <DropdownMenuItem key={String(roleName)} onClick={() => handleRoleFilter(roleName as string)}>
                  {roleName as string}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {classSelection || "Filter Kelas"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleClassFilter(null)}>Semua Kelas</DropdownMenuItem>
              <DropdownMenuSeparator />
              {uniqueClasses.map((className) => (
                <DropdownMenuItem key={String(className)} onClick={() => handleClassFilter(className as string)}>
                  {className as string}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {majorSelection || "Filter Jurusan"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleMajorFilter(null)}>Semua Jurusan</DropdownMenuItem>
              <DropdownMenuSeparator />
              {uniqueMajors.map((majorName) => (
                <DropdownMenuItem key={String(majorName)} onClick={() => handleMajorFilter(majorName as string)}>
                  {majorName as string}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Kolom <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  const getColumnLabel = (columnId: string) => {
                    const labels: Record<string, string> = {
                      avatarUrl: "Avatar",
                      BetterAuthId: "BetterAuth Status",
                      name: "Nama",
                      email: "Email",
                      role: "Role",
                      class: "Kelas",
                      major: "Jurusan",
                      status: "Status",
                      user: "BetterAuth",
                    };
                    return labels[columnId] || columnId;
                  };

                  return (
                    <DropdownMenuCheckboxItem key={column.id} className="capitalize" checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                      {getColumnLabel(column.id)}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDeleteClick} className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Hapus {table.getFilteredSelectedRowModel().rows.length} User
            </Button>
          )}

          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah User
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>;
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada data user.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} dari {table.getFilteredRowModel().rows.length} baris dipilih.
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Sebelumnya
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Selanjutnya
          </Button>
        </div>
      </div>

      <UserFormDialog open={createDialogOpen} onOpenChange={handleCloseCreateDialog} onSuccess={handleSuccess} />
      <UserFormDialog open={editDialogOpen} onOpenChange={handleCloseEditDialog} editData={selectedUser} onSuccess={handleSuccess} />
      <DeleteUserDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog} userData={selectedUser} onSuccess={handleSuccess} />
      <DeleteUserBulkDialog open={deleteBulkDialogOpen} onOpenChange={handleCloseBulkDeleteDialog} userDatas={table.getSelectedRowModel().rows.map((row) => row.original)} onSuccess={handleSuccess} />
    </div>
  );
}

// Main Component - Handles Authorization
export default function UserDataTable() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;

  const { data: userData, isLoading: isLoadingUserData } = useGetUserByIdBetterAuth(userId as string);
  const userRole = userData?.role?.name;

  // Show loading while checking authorization
  if (isPending || isLoadingUserData) {
    return <Loading />;
  }

  // Check if user is Admin
  if (userRole !== "Admin") {
    unauthorized();
    return null;
  }

  // Render dashboard only after authorization is confirmed
  return <UserDashboard />;
}