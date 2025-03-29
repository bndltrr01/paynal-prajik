import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Calendar, CreditCard, ImageUp, User } from "lucide-react";
import { ChangeEvent, FC, ReactNode, Suspense, lazy, memo, useCallback, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useUserContext } from "../../contexts/AuthContext";
import { getGuestDetails, updateProfileImage } from "../../services/Guest";

const LoadingHydrate = lazy(() => import("../../motions/loaders/LoadingHydrate"));
const Error = lazy(() => import("../../pages/_ErrorBoundary"));

// Memoize menu items to prevent recreating them on each render
const menuItems = [
  { icon: <Calendar size={18} />, label: "Bookings", link: "/guest/bookings" },
  { icon: <Ban size={18} />, label: "Cancellations", link: "/guest/cancellations" },
  { icon: <CreditCard size={18} />, label: "Payment History", link: "/guest/payments" },
];

// Memoize the MenuItem component for better performance
const MenuItem = memo(({ item, isActive }: {
  item: { icon: ReactNode; label: string; link: string; };
  isActive: boolean;
}) => (
  <div className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer ${isActive
    ? "border-r-4 border-blue-600 bg-blue-100/80 text-blue-700 font-bold"
    : "hover:bg-black/5"
    }`}>
    <span className="text-lg">{item.icon}</span>
    <span className="text-md">{item.label}</span>
  </div>
));

MenuItem.displayName = "MenuItem";

const ProfileImage = memo(({ imageUrl, onUpload }: {
  imageUrl: string | undefined;
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="relative group flex justify-center items-center rounded-full bg-gray-200 w-16 h-16 overflow-hidden">
    <img
      loading="lazy"
      src={imageUrl}
      alt="Profile"
      className="w-full h-full object-cover"
    />
    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
      <ImageUp size={16} className="text-white" />
      <input
        type="file"
        accept="image/*"
        onChange={onUpload}
        className="hidden"
      />
    </label>
  </div>
));

ProfileImage.displayName = "ProfileImage";

const GuestSidebar: FC = memo(() => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userDetails, profileImage, setProfileImage } = useUserContext();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["guest", userDetails?.id],
    queryFn: () => getGuestDetails(userDetails?.id as string),
    enabled: !!userDetails?.id,
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes to reduce API calls
  });

  const mutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("profile_image", file);
      return updateProfileImage(formData);
    },
    onSuccess: (response) => {
      // Update the profile image in the context to avoid refetching the entire profile
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
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setUploadError("Image size should be less than 2MB");
        return;
      }
      mutation.mutate(file);
    }
  }, [mutation]);

  const handleNavigateHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  if (isLoading) return <Suspense fallback={<LoadingHydrate />} />;
  if (error) return <Suspense fallback={<Error />} />;

  const displayImage = profile?.data?.profile_image || profileImage || "/default-avatar.png";
  const fullName = `${profile?.data?.first_name || ''} ${profile?.data?.last_name || ''}`;

  return (
    <aside className="w-60 min-h-screen flex flex-col bg-white shadow-md border-r border-gray-200">
      {/* User Profile Section */}
      <div className="flex flex-col items-center border-b border-gray-200 pt-6 pb-4 px-4">
        <ProfileImage imageUrl={displayImage} onUpload={handleFileChange} />
        <div className="mt-3 text-center">
          <h3 className="text-gray-800 font-bold text-lg truncate max-w-[200px]">
            {fullName}
          </h3>
          {mutation.isPending && (
            <span className="text-xs text-blue-500">Uploading...</span>
          )}
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
                to={item.link}
                end={item.link === "/guest-dashboard"}
                className="block w-full"
              >
                {({ isActive }) => (
                  <MenuItem item={item} isActive={isActive} />
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-gray-200 pt-4 pb-4 px-3 mt-auto">
        <button
          onClick={() => navigate("/guest/profile")}
          className="w-full flex items-center py-2 px-3 rounded-md transition-all duration-300 text-blue-600 hover:bg-blue-50 cursor-pointer mb-2"
        >
          <User className="mr-2 h-5 w-5" />
          <span>My Profile</span>
        </button>
        <button
          onClick={handleNavigateHome}
          className="w-full flex items-center py-2 px-3 rounded-md transition-all duration-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
        >
          <span>&larr; Go To Homepage</span>
        </button>
      </div>
    </aside>
  );
});

GuestSidebar.displayName = "GuestSidebar";

export default GuestSidebar;