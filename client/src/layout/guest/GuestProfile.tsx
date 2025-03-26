import { FC, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserContext } from "../../contexts/AuthContext";

const GuestProfile: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { userDetails } = useUserContext();

  useEffect(() => {
    if (!id || id === userDetails?.id) {
      navigate(`/guest/${id}`);
    } else {
      navigate(`/guest`);
    }
  }, [id, navigate, userDetails]);

  return null;
}

export default GuestProfile;