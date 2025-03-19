import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ImageUp } from "lucide-react";
import { ChangeEvent, FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserContext } from "../../contexts/AuthContext";
import LoadingHydrate from "../../motions/loaders/LoadingHydrate";
import Error from "../../pages/_ErrorBoundary";
import { getGuestDetails, updateProfileImage } from "../../services/Guest";

const GuestProfile: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { profileImage } = useUserContext();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["guestProfile", id],
    queryFn: () => getGuestDetails(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("profile_image", file);
      return updateProfileImage(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guestProfile", id] });
    },
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      mutation.mutate(e.target.files[0]);
    }
  };

  if (isLoading) return <LoadingHydrate />;
  if (error) return <Error />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gray-100 py-10 px-4"
    >
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <button
          onClick={() => navigate("/")}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          &larr; Back
        </button>

        <div className="flex flex-col items-center">
          <div className="relative group">
            <img
              src={profile?.user?.profile_image || profileImage}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-300 transition-transform group-hover:scale-105"
            />

            <label className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <div className="flex flex-col items-center justify-center gap-2">
                <ImageUp size={48} className="text-white" />
                <span className="text-white text-sm font-semibold">Change Profile</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            {profile?.user?.first_name} {profile?.user?.last_name}
          </h1>
          <p className="text-gray-600">{profile?.user?.email}</p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center bg-gray-100 p-4 rounded-md">
            <span className="font-semibold text-gray-700">Age:</span>
            <span className="text-gray-600">{profile?.user?.age}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-100 p-4 rounded-md">
            <span className="font-semibold text-gray-700">Guest Type:</span>
            <span className="text-gray-600">{profile?.user?.guest_type?.toUpperCase()}</span>
          </div>
        </div>

        {mutation.isPending && (
          <p className="mt-4 text-blue-600 font-semibold text-center">Updating profile picture...</p>
        )}
      </div>
    </motion.div>
  );
};

export default GuestProfile;
