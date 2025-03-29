import { FC, memo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserContext } from "../../contexts/AuthContext";

const GuestProfile: FC = memo(() => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { userDetails } = useUserContext();

  useEffect(() => {
    // Only navigate if necessary to prevent unnecessary re-renders
    if (userDetails) {
      if (!id) {
        navigate(`/guest/${userDetails.id}`);
      } else if (id !== userDetails.id) {
        navigate(`/guest/${userDetails.id}`);
      }
    }
  }, [id, navigate, userDetails]);

  // Don't render anything here, just handle navigation
  return null;
});

GuestProfile.displayName = "GuestProfile";

export default GuestProfile;