import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Calendar, CreditCard, Home, ImageUp, User } from "lucide-react";
import { ChangeEvent, FC, useCallback, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useUserContext } from "../../contexts/AuthContext";
import { getGuestDetails, updateProfileImage } from "../../services/Guest";

const menuItems = [
  { icon: <User size={18} />, label: "My Profile", link: "/guest/:id" },
  { icon: <Calendar size={18} />, label: "Bookings", link: "/guest/bookings" },
  { icon: <Ban size={18} />, label: "Cancellations", link: "/guest/cancellations" },
  { icon: <CreditCard size={18} />, label: "Payment History", link: "/guest/payments" },
];

interface ProfileImageProps {
  imageUrl: string | undefined;
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

const ProfileImage: FC<ProfileImageProps> = ({ imageUrl, onUpload, isUploading }) => (
  <div className="relative group flex justify-center items-center rounded-full bg-gray-200 w-24 h-24 overflow-hidden">
    <img
      loading="lazy"
      src={imageUrl}
      alt="Profile"
      className="w-full h-full object-cover"
    />
    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
      {isUploading ? (
        <span className="text-white text-xs">Uploading...</span>
      ) : (
        <>
          <ImageUp size={55} className="text-white" />
          <input
            type="file"
            accept="image/*"
            onChange={onUpload}
            className="hidden"
          />
        </>
      )}
    </label>
  </div>
);

const GuestSidebar: FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { userDetails, profileImage, setProfileImage } = useUserContext();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["guest", userDetails?.id],
    queryFn: () => getGuestDetails(userDetails?.id as string),
    enabled: !!userDetails?.id,
  });

  const mutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("profile_image", file);
      return updateProfileImage(formData);
    },
    onSuccess: (response) => {
      if (response?.data?.profile_image) {
        setProfileImage(response.data.profile_image);
      }
      queryClient.invalidateQueries({ queryKey: ["guest", userDetails?.id] });
      setUploadError(null);
    },
    onError: (error) => {
      console.error("Failed to upload image:", error);
      setUploadError("Failed to upload image. Please try again.");
    }
  });

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setUploadError("Image size should be less than 2MB");
        return;
      }
      mutation.mutate(file);
    }
  }, [mutation]);

  if (isLoading) return <div className="w-60 min-h-screen bg-white animate-pulse" />;
  if (error) return <div className="w-60 min-h-screen bg-white flex items-center justify-center text-red-500">Error loading profile</div>;

  const displayImage = profile?.data?.profile_image || profileImage || "/default-avatar.png";
  const fullName = `${profile?.data?.first_name || ''} ${profile?.data?.last_name || ''}`;

  return (
    <aside className="w-60 min-h-screen flex flex-col bg-white shadow-md border-r border-gray-200">
      {/* Go to Homepage Button */}
      <div className="px-3 py-4 border-b border-gray-200">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center space-x-2 p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200"
        >
          <Home size={25} className="mr-2" />
          <span className="text-md">Go To Homepage</span>
        </button>
      </div>

      {/* User Profile Section */}
      <div className="flex flex-col items-center border-b border-gray-200 pt-6 pb-4 px-4">
        <ProfileImage
          imageUrl={displayImage}
          onUpload={handleFileChange}
          isUploading={mutation.isPending}
        />
        <div className="mt-3 text-center">
          <h3 className="text-gray-800 font-bold text-2xl truncate max-w-[200px]">
            {fullName}
          </h3>
          {uploadError && (
            <span className="text-xs text-red-500">{uploadError}</span>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-grow overflow-y-auto py-4 px-3">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.link.replace(':id', userDetails?.id?.toString() || '')}
                end={item.link.includes(':id')}
                className={({ isActive }) => `
                  block w-full
                  ${isActive ? 'text-blue-700 font-bold' : ''}
                `}
              >
                {({ isActive }) => (
                  <div className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer ${isActive
                    ? "border-r-4 border-blue-600 bg-blue-100/80 text-blue-700 font-bold"
                    : "hover:bg-black/5"
                    }`}>
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-md">{item.label}</span>
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default GuestSidebar;