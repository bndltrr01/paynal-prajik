import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Calendar, CreditCard, ImageUp } from "lucide-react";
import { ChangeEvent, FC, Suspense, lazy } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useUserContext } from "../../contexts/AuthContext";
import { getGuestDetails, updateProfileImage } from "../../services/Guest";

const LoadingHydrate = lazy(() => import("../../motions/loaders/LoadingHydrate"));
const Error = lazy(() => import("../../pages/_ErrorBoundary"));

const GuestSidebar: FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { userDetails, profileImage } = useUserContext();

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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["guest", userDetails?.id] });
        },
    });

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            mutation.mutate(e.target.files[0]);
        }
    };

    if (isLoading) return <Suspense fallback={<LoadingHydrate />} />;
    if (error) return <Suspense fallback={<Error />} />;

    const menuItems = [
        { icon: <Calendar size={18} />, label: "Bookings", link: "/guest/bookings" },
        { icon: <Calendar size={18} />, label: "Reservations", link: "/guest/reservations" },
        { icon: <Ban size={18} />, label: "Cancellations", link: "/guest/cancellations" },
        { icon: <CreditCard size={18} />, label: "Payment History", link: "/guest/payments" },
    ];

    return (
        <>
            <aside className="min-h-screen flex flex-col p-4 bg-white text-black w-60">

                {/* User Profile Section */}
                <div className="flex space-x-3 items-center border-b border-b-gray-200 p-2 mb-4">
                    <div className="relative group flex justify-center items-center rounded-full bg-blue-400 w-12 h-12">
                        <img
                            loading="lazy"
                            src={profile?.data?.profile_image || profileImage}
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover"
                        />
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <ImageUp size={16} className="text-white" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                    <ul className="flex flex-col justify-center">
                        <li className="text-gray-700 font-black tracking-wide text-xl">
                            {profile?.data?.first_name} {profile?.data?.last_name}
                        </li>
                    </ul>
                </div>

                {/* Menu Items */}
                <div className="flex-grow overflow-y-auto p-2">
                    <ul className="space-y-4">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <NavLink
                                    to={item.link}
                                    end={item.link === "/guest-dashboard"}
                                    className={({ isActive }) =>
                                        `flex items-center space-x-2 p-2 rounded-md cursor-pointer ${isActive
                                            ? "border-r-3 border-blue-600 bg-blue-100/80 text-blue-700 font-bold"
                                            : "hover:bg-black/15"
                                        }`
                                    }
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="text-md">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Logout Button */}
                <div className="px-3 py-2 border-t border-gray-200 pt-4">
                    <button
                        onClick={() => navigate("/")}
                        className="w-full flex items-center space-x-3 py-2 px-3 rounded-md transition-all duration-300 text-red-600 hover:bg-black/15 cursor-pointer"
                    >
                        <h1>&larr; Go To Homepage</h1>
                    </button>
                </div>
            </aside>
        </>
    );
};

const GuestLayout: FC = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex flex-1">
                <GuestSidebar />
                <main className="flex-grow p-6 bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default GuestLayout;
