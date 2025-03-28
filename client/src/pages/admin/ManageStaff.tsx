/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardSkeleton from "../../motions/skeletons/AdminDashboardSkeleton";
import Error from "../_ErrorBoundary";
import DefaultImg from "../../assets/Default_pfp.jpg";
import { fetchAllStaff, addNewStaff, manageStaff, archiveStaff } from "../../services/Admin";
import EditStaffModal, { IStaff } from "../../components/admin/EditStaffModal";
import Modal from "../../components/Modal";
import { Eye, Edit, Trash2 } from "lucide-react";

// Strict staff type
interface Staff extends IStaff {
  profile_image: string;
}

// Read-only view modal for staff details
interface ViewStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffData: Staff | null;
}

const ViewStaffModal: FC<ViewStaffModalProps> = ({ isOpen, onClose, staffData }) => {
  if (!isOpen || !staffData) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl mx-4 rounded shadow-lg relative max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="h-64 md:h-auto">
            {staffData.profile_image ? (
              <img
                loading="lazy"
                src={staffData.profile_image}
                alt={`${staffData.first_name} ${staffData.last_name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
          </div>
          <div className="p-6 flex flex-col">
            <h1 className="text-3xl font-bold mb-4">
              {staffData.first_name} {staffData.last_name}
            </h1>
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Email:</span> {staffData.email}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const buildStaffFormData = (staff: IStaff): FormData => {
  const formData = new FormData();
  formData.append("first_name", staff.first_name);
  formData.append("last_name", staff.last_name);
  formData.append("email", staff.email);
  if (staff.password) {
    formData.append("password", staff.password);
    if (staff.confirm_password) {
      formData.append("confirm_password", staff.confirm_password);
    }
  }
  if ((staff as any).profile_image instanceof File) {
    formData.append("profile_image", (staff as any).profile_image);
  }
  return formData;
};

const ManageStaff: FC = () => {
  const [search, setSearch] = useState<string>("");
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<IStaff | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteStaffId, setDeleteStaffId] = useState<number | null>(null);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [viewStaffData, setViewStaffData] = useState<Staff | null>(null);

  const queryClient = useQueryClient();

  // 1. Fetch staff data
  const { data: staffData, isLoading, error } = useQuery<Staff[]>({
    queryKey: ["staff"],
    queryFn: fetchAllStaff,
  });

  // 2. Mutations for create, update, and delete
  const createMutation = useMutation({
    mutationFn: addNewStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setShowFormModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FormData }) => manageStaff(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setShowFormModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: archiveStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setShowDeleteModal(false);
    },
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <Error />;

  const staffList: Staff[] = staffData || [];

  // Filter staff by search term
  const filteredStaff = staffList.filter((staff) => {
    const searchText = search.toLowerCase();
    return (
      staff.first_name.toLowerCase().includes(searchText) ||
      staff.last_name.toLowerCase().includes(searchText) ||
      staff.email.toLowerCase().includes(searchText)
    );
  });

  // Handlers
  const handleAddStaff = () => {
    setSelectedStaff(null);
    setShowFormModal(true);
  };

  const handleEditStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setShowFormModal(true);
  };

  const handleViewStaff = (staff: Staff) => {
    setViewStaffData(staff);
    setShowViewModal(true);
  };

  const handleDeleteStaff = (id: number) => {
    setDeleteStaffId(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteStaff = async () => {
    if (deleteStaffId !== null) {
      await deleteMutation.mutateAsync(deleteStaffId);
      setDeleteStaffId(null);
    }
  };

  const handleSaveStaff = async (staff: IStaff): Promise<void> => {
    const formData = buildStaffFormData(staff);
    if (!staff.id || staff.id === 0) {
      // Create new staff
      await createMutation.mutateAsync(formData);
    } else {
      // Update existing staff
      await updateMutation.mutateAsync({ id: staff.id, payload: formData });
    }
  };

  return (
    <div className="overflow-y-auto h-[calc(100vh-25px)]">
      <div className="p-3 container mx-auto">
        {/* Header */}
        <div className="flex flex-row items-center mb-5 justify-between">
          <h1 className="text-3xl font-semibold">Manage Staff</h1>
          <button
            onClick={handleAddStaff}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition-colors duration-300"
          >
            + Add New Staff
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search staff..."
            className="w-full p-2 border rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Staff Table */}
        {filteredStaff.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-10">
            <p className="text-5xl font-bold text-gray-700">🚫 No Staff Found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Profile</th>
                  <th className="border p-2">First Name</th>
                  <th className="border p-2">Last Name</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="border">
                    <td className="p-2 text-center">
                      <img
                        loading="lazy"
                        src={staff.profile_image || DefaultImg}
                        alt={`${staff.first_name} ${staff.last_name}`}
                        className="w-20 h-20 object-cover rounded-full mx-auto"
                      />
                    </td>
                    <td className="p-2 text-center">{staff.first_name}</td>
                    <td className="p-2 text-center">{staff.last_name}</td>
                    <td className="p-2 text-center">{staff.email}</td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleViewStaff(staff)}
                        className="bg-gray-600 hover:bg-gray-700 text-white p-3 cursor-pointer rounded-md mr-2 transition-colors duration-300"
                      >
                        <Eye size={25} />
                      </button>
                      <button
                        onClick={() => handleEditStaff(staff)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 cursor-pointer rounded-md mr-2 transition-colors duration-300"
                      >
                        <Edit size={25} />
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(staff.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-3 cursor-pointer rounded-md transition-colors duration-300"
                      >
                        <Trash2 size={25} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showFormModal && (
          <EditStaffModal
            isOpen={showFormModal}
            staffData={selectedStaff}
            onSave={handleSaveStaff}
            cancel={() => setShowFormModal(false)}
            loading={createMutation.isPending || updateMutation.isPending}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <Modal
            isOpen={showDeleteModal}
            icon="fa fa-trash"
            title="Delete Guest"
            description="Are you sure you want to delete this guest account?"
            className={`bg-red-600 text-white active:bg-red-700 font-bold uppercase px-4 py-2 cursor-pointer rounded-md shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 transition-all duration-150 ${deleteMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
            cancel={() => setShowDeleteModal(false)}
            onConfirm={confirmDeleteStaff}
            cancelText="Cancel"
            confirmText="Delete Guest"
          />
        )}

        {/* View Staff Modal */}
        <ViewStaffModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          staffData={viewStaffData}
        />
      </div>
    </div>
  );
};

export default ManageStaff;
