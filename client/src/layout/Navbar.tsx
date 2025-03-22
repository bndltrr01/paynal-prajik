import {
  faCalendarCheck,
  faCircleUser,
  faRightToBracket,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DefaultImg from "../assets/Default_pfp.jpg";
import hotelLogo from "../assets/hotel_logo.png";
import Dropdown from "../components/Dropdown";
import LoginModal from "../components/LoginModal";
import Modal from "../components/Modal";
import Notification from "../components/Notification";
import SignupModal from "../components/SignupModal";
import { navLinks } from "../constants/Navbar";
import { useUserContext } from "../contexts/AuthContext";
import SlotNavButton from "../motions/CustomNavbar";
import { logout } from "../services/Auth";
import { getGuestDetails } from "../services/Guest";

const Navbar: FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [registerModal, setRegisterModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const location = useLocation();
  const isAvailabilityPage = location.pathname === "/availability";
  const isMyBookingPage = location.pathname === "/mybooking";

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info" | "warning";
    icon: string;
  } | null>(null);

  const navigate = useNavigate();

  const {
    isAuthenticated,
    setIsAuthenticated,
    setRole,
    profileImage,
    userDetails,
    setProfileImage,
  } = useUserContext();

  const [imageLoading, setImageLoading] = useState<boolean>(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await logout();
      if (response.status === 200) {
        setIsAuthenticated(false);
        setRole("");
        setNotification({
          message: "Logged out successfully",
          type: "success",
          icon: "fas fa-check-circle",
        });
        setIsModalOpen(false);
        navigate("/", { replace: true });
      }
      setLoading(false);
    } catch (error) {
      console.error(`Failed to logout: ${error}`);
    }
  };

  const toggleLoginModal = () => setLoginModal(!loginModal);
  const toggleRegisterModal = () => setRegisterModal(!registerModal);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (loginModal) setLoginModal(false);
        if (registerModal) setRegisterModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loginModal, registerModal]);

  useEffect(() => {
    if (isAuthenticated) {
      setLoginModal(false);
      setRegisterModal(false);
    }
  }, [isAuthenticated, setProfileImage]);

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (isAuthenticated && userDetails?.id) {
        setImageLoading(true);
        try {
          const data = await getGuestDetails(userDetails.id);
          setProfileImage(data.user.profile_image);
        } catch (err) {
          console.error(`Failed to fetch user profile for Navbar: ${err}`);
        } finally {
          setImageLoading(false);
        }
      }
    };
    fetchProfileImage();
  }, [isAuthenticated, userDetails?.id, setProfileImage]);

  return (
    <>
      {notification && (
        <Notification
          icon={notification.icon}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <nav
        className={`fixed top-0 left-0 w-full px-10 py-7 z-40 transition-all duration-75  ${
          isScrolled || isAvailabilityPage || isMyBookingPage
            ? "bg-gray-200 shadow-lg text-black"
            : "bg-transparent text-white"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center">
          {/* Left Section */}
          <div className="flex flex-1 items-center">
            <Link to="/">
              <img
                src={hotelLogo}
                alt="Hotel Logo"
                className="h-12 w-auto cursor-pointer"
              />
            </Link>
          </div>

          {/* Center Section */}
          <div className="hidden lg:flex flex-1 justify-center">
            <ul className="flex items-center space-x-8">
              {navLinks.map((link, index) => (
                <SlotNavButton
                  key={index}
                  to={link.link}
                  className={`${
                    isScrolled || isAvailabilityPage || isMyBookingPage
                      ? "text-black hover:text-purple-600"
                      : "bg-transparent text-white hover:text-purple-600"
                  }`}
                >
                  <i className={link.icon}></i> {link.text}
                </SlotNavButton>
              ))}
            </ul>
          </div>

          {/* Right Section */}
          <div className="hidden lg:flex flex-1 items-center justify-end">
            {!isAuthenticated ? (
              <>
                <button
                  className="px-4 py-2 text-lg font-bold border rounded-md hover:bg-gradient-to-r from-[#7300FF] to-[#08D3FC] transition duration-300"
                  onClick={toggleLoginModal}
                >
                  <FontAwesomeIcon icon={faRightToBracket} /> Login
                </button>
                <button
                  className="ml-8 px-4 py-2 text-lg font-bold border rounded-md hover:bg-gradient-to-r from-[#7300FF] to-[#08D3FC] transition duration-300"
                  onClick={toggleRegisterModal}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <Dropdown
                options={[
                  {
                    label: "Account",
                    onClick: () => {
                      if (userDetails && userDetails.id) {
                        navigate(`/guest/${userDetails.id}`);
                      } else {
                        console.error("User details are not available");
                      }
                    },
                    icon: <FontAwesomeIcon icon={faCircleUser} />,
                  },
                  {
                    label: "My Bookings",
                    onClick: () => navigate("/mybooking"),
                    icon: <FontAwesomeIcon icon={faCalendarCheck} />,
                  },
                  {
                    label: "Log Out",
                    onClick: () => setIsModalOpen(true),
                    icon: <FontAwesomeIcon icon={faRightToBracket} />,
                  },
                ]}
                position="bottom"
              >
                {imageLoading ? (
                  <div className="h-10 w-10 flex items-center justify-center">
                    <i className="fa fa-spinner fa-spin"></i>
                  </div>
                ) : (
                  <img
                    src={profileImage || DefaultImg}
                    alt="Profile"
                    className="h-12 w-12 rounded-full object-cover cursor-pointer"
                  />
                )}
              </Dropdown>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <button onClick={() => setMenuOpen(true)} className="text-2xl">
              <i className="fa fa-bars"></i>
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setMenuOpen(false)}
          ></div>
          <ul className="fixed top-0 right-0 w-full h-screen md:w-3/5 sm:w-4/5 bg-white shadow-md text-black z-50 flex flex-col">
            <div className="flex justify-between items-center p-7 sm:p-9 md:p-9 bg-gray-200">
              <Link to="/">
                <img
                  src={hotelLogo}
                  alt="Hotel Logo"
                  className="h-12 w-auto cursor-pointer block sm:hidden md:hidden"
                />
              </Link>
              <button onClick={() => setMenuOpen(false)}>
                <i className="fa fa-times text-3xl mr-3 sm:mr-0"></i>
              </button>
            </div>
            <li className="p-4 text-black/70">
              <i className="fa fa-bars text-black/70 mr-3"></i> Navigation
            </li>
            {navLinks.map((link, index) => (
              <li
                key={index}
                className="p-4 mx-7 hover:bg-blue-200 hover:text-blue-700 rounded-md cursor-pointer"
                onClick={() => setMenuOpen(false)}
              >
                <Link to={link.link} className="flex items-center">
                  <i className={`mr-3 ${link.icon}`}></i> {link.text}
                </Link>
              </li>
            ))}
            <li
              className="p-4 border-t-2 mt-3 mx-7 border-gray-200 hover:bg-blue-200 hover:text-blue-700 rounded-md cursor-pointer"
              onClick={toggleLoginModal}
            >
              <i className="fa-regular fa-user mr-3"></i> Login
            </li>
            <li
              className="p-4 mx-7 hover:bg-blue-200 hover:text-blue-700 rounded-md cursor-pointer"
              onClick={toggleRegisterModal}
            >
              <i className="fa fa-user-plus mr-1"></i> Sign Up
            </li>
          </ul>
        </div>
      )}

      {loginModal && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <LoginModal
            toggleLoginModal={toggleLoginModal}
            openSignupModal={toggleRegisterModal}
          />
        </div>
      )}
      {registerModal && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <SignupModal
            toggleRegisterModal={toggleRegisterModal}
            openLoginModal={toggleLoginModal}
          />
        </div>
      )}
      <Modal
        isOpen={isModalOpen}
        icon="fa fa-sign-out-alt"
        title="Log Out"
        description="Are you sure you want to log out?"
        cancel={() => setIsModalOpen(!isModalOpen)}
        onConfirm={handleLogout}
        className={`bg-red-600 text-white active:bg-red-700 font-bold uppercase px-4 py-2 cursor-pointer rounded-md shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 transition-all duration-150 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        loading={loading}
        confirmText={
          loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> Logging
              out...
            </>
          ) : (
            "Log Out"
          )
        }
        cancelText="Cancel"
      />
    </>
  );
};

export default Navbar;
