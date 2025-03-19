/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import DefaultImg from "../../assets/Default_pfp.jpg";
import DashboardSkeleton from "../../motions/skeletons/AdminDashboardSkeleton";
import { manageUsers } from "../../services/Admin";
import Error from "../_ErrorBoundary";

const ManageUsers = () => {
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState<string>('All');
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: manageUsers,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <Error />;

  const users = Array.isArray(data) ? data : data?.users || [];

  const filteredUsers = users.filter((user: any) => {
    const firstName = user.first_name?.toLowerCase() || "";
    const lastName = user.last_name?.toLowerCase() || "";
    const email = user.email?.toLowerCase() || "";
    const searchText = search.toLowerCase();

    const matchesSearch =
      firstName.includes(searchText) ||
      lastName.includes(searchText) ||
      email.includes(searchText)

    return matchesSearch;
  });

  return (
    <div className="overflow-y-auto h-[calc(100vh-25px)]">
      <div className="p-3 container mx-auto">
        <h1 className="text-3xl font-semibold mb-5">Manage Users</h1>
        <input
          type="text"
          placeholder="Search users..."
          className="w-full p-2 border rounded mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="w-full p-2 border rounded mb-4"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All Guests</option>
          <option value="VIP">VIP</option>
          <option value="Regular">Regular</option>
        </select>

        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-10">
            <p className="text-3xl font-bold text-gray-700">🚫 No Users Found</p>
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
                  <th className="border p-2">Age</th>
                  <th className="border p-2">Gender</th>
                  <th className="border p-2">Guest Type</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user: any) => (
                  <tr key={user.id} className="border">
                    <td className="p-2 text-center">
                      <img
                        src={user.profile_image || DefaultImg}
                        alt={user.profile_image}
                        className="w-20 h-20 object-cover rounded-full mx-auto"
                      />
                    </td>
                    <td className="p-2 text-center">{user.first_name}</td>
                    <td className="p-2 text-center">{user.last_name}</td>
                    <td className="p-2 text-center">{user.email}</td>
                    <td className="p-2 text-center">{user.age}</td>
                    <td className="p-2 text-center">{user.gender}</td>
                    <td className="p-2 text-center font-semibold uppercase">{user.guest_type}</td>
                    <td className="p-2 text-center">
                      <button className="bg-blue-500 text-white px-3 py-1 rounded-md mr-2">
                        Edit
                      </button>
                      <button className="bg-red-500 text-white px-3 py-1 rounded-md">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageUsers