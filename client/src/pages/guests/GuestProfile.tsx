import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Edit, Eye, EyeOff, Mail, MapPin, Phone, Save, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserContext } from "../../contexts/AuthContext";
import { changePassword } from "../../services/Auth";
import { getGuestDetails, updateGuestDetails } from "../../services/Guest";

interface FormFields {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
}

interface PasswordFields {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const GuestProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userDetails } = useUserContext();

  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState<FormFields>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordFields>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Fetch guest details
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ["guest", id],
    queryFn: () => getGuestDetails(id as string),
    enabled: !!id,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: FormFields) => {
      const updateData = [
        data.first_name,
        data.last_name,
        data.email,
        data.phone || '',
        data.address || ''
      ];
      return updateGuestDetails(id as string, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guest", id] });
      setEditMode(false);
    },
    onError: (error) => {
      console.error("Failed to update profile:", error);
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordFields) => {
      return changePassword(data.oldPassword, data.newPassword, data.confirmPassword);
    },
    onSuccess: () => {
      setPasswordSuccess("Password changed successfully!");
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Close modal after a delay
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(null);
      }, 2000);
    },
    onError: (error: any) => {
      setPasswordError(error.response?.data?.message || "Failed to change password. Please try again.");
    }
  });

  useEffect(() => {
    if (userDetails && (!id || id !== userDetails.id.toString())) {
      navigate(`/guest/${userDetails.id}`);
    }
  }, [userDetails, id, navigate]);

  useEffect(() => {
    if (profile?.data) {
      setFormData({
        first_name: profile.data.first_name || '',
        last_name: profile.data.last_name || '',
        email: profile.data.email || '',
        phone: profile.data.phone || '',
        address: profile.data.address || ''
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    setPasswordError(null);
  };

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleChangePassword = (e: FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New password and confirm password don't match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    changePasswordMutation.mutate(passwordData);
  };

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const guestData = profile?.data;

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800">
        <h3 className="font-bold mb-2">Error loading profile</h3>
        <p>We couldn't load your profile information. Please try again later.</p>
      </div>
    );
  }

  const formattedDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl container mx-auto">
      {/* Profile header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={guestData?.profile_image || "/default-avatar.png"}
              alt={guestData?.first_name || "Guest"}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
              <div>
                <h2 className="text-2xl font-bold">
                  {guestData?.first_name} {guestData?.last_name}
                </h2>
                <div className="flex items-center text-gray-600 mt-1">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{guestData?.email}</span>
                </div>
                {guestData?.phone && (
                  <div className="flex items-center text-gray-600 mt-1">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{guestData?.phone}</span>
                  </div>
                )}
                {guestData?.address && (
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{guestData?.address}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setEditMode(!editMode)}
                className="mt-4 md:mt-0 flex items-center bg-blue-50 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors"
              >
                {editMode ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("personal")}
          className={`px-4 py-2 font-medium ${activeTab === "personal"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          Personal Information
        </button>
        <button
          onClick={() => setActiveTab("account")}
          className={`px-4 py-2 font-medium ${activeTab === "account"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          Account Details
        </button>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === "personal" && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  disabled={!editMode}
                  className={`w-full p-2 border rounded-md ${editMode ? "bg-white" : "bg-gray-50"
                    }`}
                  value={formData.first_name}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  disabled={!editMode}
                  className={`w-full p-2 border rounded-md ${editMode ? "bg-white" : "bg-gray-50"
                    }`}
                  value={formData.last_name}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  disabled={!editMode}
                  className={`w-full p-2 border rounded-md ${editMode ? "bg-white" : "bg-gray-50"
                    }`}
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  disabled={!editMode}
                  className={`w-full p-2 border rounded-md ${editMode ? "bg-white" : "bg-gray-50"
                    }`}
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                <textarea
                  name="address"
                  disabled={!editMode}
                  rows={3}
                  className={`w-full p-2 border rounded-md ${editMode ? "bg-white" : "bg-gray-50"
                    }`}
                  value={formData.address}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>

            {editMode && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="mr-3 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        )}

        {activeTab === "account" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Account Details</h3>

            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Username</span>
                <span className="font-medium">{guestData?.username || "N/A"}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Account Created</span>
                <span className="font-medium">{formattedDate(guestData?.created_at || "")}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Last Login</span>
                <span className="font-medium">{formattedDate(guestData?.last_login || "")}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Account Status</span>
                <span className="font-medium">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  Active
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => navigate('/guest/change-password')}
                className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
              >
                <span>Change Password</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Change Password</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError(null);
                  setPasswordSuccess(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{passwordSuccess}</p>
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.old ? "text" : "password"}
                      id="oldPassword"
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => togglePasswordVisibility('old')}
                    >
                      {showPassword.old ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="mr-3 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestProfile;