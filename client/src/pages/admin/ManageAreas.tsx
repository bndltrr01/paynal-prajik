/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import EditAreaModal, { IArea as IEditArea } from "../../components/admin/EditAreaModal";
import Modal from "../../components/Modal";
import DashboardSkeleton from "../../motions/skeletons/AdminDashboardSkeleton";
import ManageRoomLoader from "../../motions/loaders/ManageRoomLoader";
import { fetchAreas, addNewArea, editArea, deleteArea } from "../../services/Admin";
import Error from "../_ErrorBoundary";
import { MapPinOff } from "lucide-react";

interface Area {
  id: number;
  area_name: string;
  area_image: string;
  description?: string;
  capacity: number;
  price_per_hour: number;
  status: "available" | "occupied" | "maintenance";
}

interface AddAreaResponse {
  data: any;
}

const ManageAreas = () => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editAreaData, setEditAreaData] = useState<IEditArea | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [deleteAreaId, setDeleteAreaId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loaderText, setLoaderText] = useState<string>("");
  const queryClient = useQueryClient();

  // Fetch areas; API returns { data: IArea[] }
  const { data: areasData, isLoading, isError } = useQuery<{ data: Area[] }>({
    queryKey: ["areas"],
    queryFn: fetchAreas,
  });

  const areas = areasData?.data || [];

  // Mutation for adding a new area
  const addAreaMutation = useMutation<AddAreaResponse, unknown, FormData>({
    mutationFn: addNewArea,
    onMutate: () => {
      setLoading(true);
      setLoaderText("Adding area...");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      setShowFormModal(false);
    },
    onSettled: () => {
      setLoading(false);
      setLoaderText("");
    },
  });

  // Mutation for editing an area
  const editAreaMutation = useMutation<AddAreaResponse, unknown, { areaId: number; formData: FormData }>({
    mutationFn: ({ areaId, formData }) => editArea(areaId, formData),
    onMutate: () => {
      setLoading(true);
      setLoaderText("Updating area...");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      setShowFormModal(false);
    },
    onSettled: () => {
      setLoading(false);
      setLoaderText("");
    },
  });

  // Mutation for deleting an area
  const deleteAreaMutation = useMutation<any, unknown, number>({
    mutationFn: deleteArea,
    onMutate: () => {
      setLoading(true);
      setLoaderText("Deleting area...");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      setShowModal(false);
    },
    onSettled: () => {
      setLoading(false);
      setLoaderText("");
    },
  });

  // Open modal to add a new area
  const handleAddNew = () => {
    setEditAreaData(null);
    setShowFormModal(true);
  };

  // Map the API data to the modal's IEditArea shape when editing
  const handleEdit = (area: any) => {
    setEditAreaData({
      id: area.id,
      area_name: area.area_name,
      area_image:
        typeof area.area_image === "string" ? area.area_image : area.area_image,
      description: area.description || "",
      capacity: area.capacity,
      price_per_hour: area.price_per_hour,
      status: area.status,
    });
    setShowFormModal(true);
  };

  // Open delete confirmation modal
  const handleDelete = (areaId: number) => {
    setDeleteAreaId(areaId);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (deleteAreaId != null) {
      deleteAreaMutation.mutate(deleteAreaId);
    }
  };

  const cancelDelete = () => {
    setDeleteAreaId(null);
    setShowModal(false);
  };

  // When saving, convert area data to FormData
  const handleSave = async (areaData: IEditArea): Promise<void> => {
    const formData = new FormData();
    formData.append("area_name", areaData.area_name);
    formData.append("description", areaData.description);
    formData.append("capacity", areaData.capacity.toString());
    formData.append("price_per_hour", areaData.price_per_hour.toString());
    formData.append("status", areaData.status);
    if (areaData.area_image instanceof File) {
      formData.append("area_image", areaData.area_image);
    }
    if (!areaData.id) {
      await addAreaMutation.mutateAsync(formData);
    } else {
      await editAreaMutation.mutateAsync({ areaId: areaData.id, formData });
    }
  };

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <Error />;

  return (
    <div className="overflow-y-auto h-[calc(100vh-25px)]">
      <div className="p-3 container mx-auto">
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 z-[500]">
            <ManageRoomLoader size="80px" color="white" text={loaderText} />
          </div>
        )}

        <div className="flex flex-row items-center mb-5 justify-between">
          <h1 className="text-3xl font-semibold">Manage Areas</h1>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition-colors duration-300"
          >
            + Add New Area
          </button>
        </div>

        {/* Areas Grid or Empty State */}
        {areas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {areas.map((area) => (
              <div key={area.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                <img
                  src={area.area_image}
                  alt={area.area_name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 flex flex-col space-y-2">
                  <h2 className="text-xl font-bold text-gray-900">{area.area_name}</h2>
                  <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                    {area.description || "No description provided."}
                  </p>
                  <p className="text-gray-500">Capacity: {area.capacity}</p>
                  <p className="text-gray-500">
                    Price Per Hour: ₱{area.price_per_hour.toLocaleString()}
                  </p>
                  <span
                    className={`px-2 py-1 mt-2 text-sm font-semibold text-white rounded-full ${area.status === "available"
                      ? "bg-green-500"
                      : area.status === "occupied"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                      }`}
                  >
                    {area.status.charAt(0).toUpperCase() + area.status.slice(1)}
                  </span>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => handleEdit(area)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(area.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-16">
            <MapPinOff className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-2xl font-semibold">No Areas Found</p>
            <p className="mt-2 text-gray-500 text-center max-w-md">
              It looks like you haven't added any areas yet. Click the button below to create your first area.
            </p>
          </div>
        )}

        {/* Edit/Add Area Modal */}
        {showFormModal && (
          <EditAreaModal
            isOpen={showFormModal}
            cancel={() => setShowFormModal(false)}
            onSave={handleSave}
            areaData={editAreaData}
            loading={addAreaMutation.isPending || editAreaMutation.isPending}
          />
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showModal}
          icon="fas fa-trash"
          title="Delete Area"
          description="Are you sure you want to delete this area?"
          cancel={cancelDelete}
          onConfirm={confirmDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-md uppercase font-bold hover:bg-red-700 transition-all duration-300"
          cancelText="No"
          confirmText="Delete Area"
        />
      </div>
    </div>
  );
};

export default ManageAreas;
