/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, TrashIcon } from "lucide-react";
import { FC, useCallback, useState } from "react";
import { toast } from "react-toastify";
import EditUserModal, { IUser } from "../../components/admin/EditUserModal";
import withSuspense from "../../hoc/withSuspense";
import DashboardSkeleton from "../../motions/skeletons/AdminDashboardSkeleton";
import { archiveUser, fetchAllUsers, manageUser } from "../../services/Admin";

const ManageUsers: FC = () => {
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState(false);

  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery<IUser[]>({
    queryKey: ["users"],
    queryFn: fetchAllUsers,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FormData }) =>
      manageUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
      setEditModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => archiveUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User archived successfully");
      setShowDeleteModal(false);
    },
  });

  const handleEdit = useCallback((user: IUser) => {
    setSelectedUser(user);
    setEditModal(true);
  }, []);

  const handleDelete = useCallback((user: IUser) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  }, []);

  const confirmDeleteUser = useCallback(async () => {
    if (!selectedUser) return;
    try {
      await deleteMutation.mutateAsync(selectedUser.id);
    } catch (error) {
      console.error("Error archiving user:", error);
      toast.error("Failed to archive user.");
    }
  }, [deleteMutation, selectedUser]);

  const handleSaveUser = useCallback(async (user: IUser) => {
    const formData = new FormData();
    formData.append("first_name", user.first_name);
    formData.append("last_name", user.last_name);
    formData.append("email", user.email);

    // Only add password if provided
    if (user.password) {
      formData.append("password", user.password);
    }

    await updateMutation.mutateAsync({ id: user.id, payload: formData });
  }, [updateMutation]);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Manage Users</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : users && users.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-10">
          <p className="text-5xl font-bold text-gray-700">🚫 No Users Found</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users && users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.first_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 cursor-pointer rounded-md mr-2 transition-colors duration-300"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="bg-red-600 hover:bg-red-700 text-white p-3 cursor-pointer rounded-md transition-colors duration-300"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      <EditUserModal
        isOpen={editModal}
        cancel={() => {
          setEditModal(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
        userData={selectedUser}
        loading={updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 mx-4">
            <h2 className="text-xl font-semibold mb-4">Archive User</h2>
            <p className="mb-6">
              Are you sure you want to archive {selectedUser?.first_name} {selectedUser?.last_name}?
              This will deactivate their account.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300"
              >
                {deleteMutation.isPending ? "Archiving..." : "Archive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withSuspense(ManageUsers, { height: "500px" });
