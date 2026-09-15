"use client";

import { useState, useEffect } from "react";
import { api, setAccessToken } from "@/lib/axios";
import { getUsers } from "@/lib/actions/user.actions";
import { IUser } from "@/lib/globalTypes";

const page = () => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);
  const [users, setUsers] = useState<IUser[]>([]);
  const [admins, setAdmins] = useState<IUser[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        ("use cache");
        const response = await getUsers({ page, limit });

        setTotalPages(response.totalPages);

        // console.log("Fetched users response:", response);
        const allUsers: IUser[] = response.users;

        const adminList = allUsers.filter((u) => u.role === "admin");
        const userList = allUsers.filter((u) => u.role !== "admin");

        setAdmins(adminList);
        setUsers(userList);
      } catch (e: any) {
        console.log("Error while fetching data : ", e.message);
      }
    };
    fetchData();
  }, [page, limit]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      const loginRes = await api.post("/auth/login", {
        email: "admin@test.com",
        password: "admin",
      });

      const token = loginRes.data.accessToken;

      setAccessToken(token);
    } catch (e: any) {
      console.log("Error occured while submit : ", e.message);
    }
  };

  const handleRegister = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/register", {
        email,
        password,
        role,
      });

      console.log("User Registered", response.data.message);
    } catch (e: any) {
      console.log("Error during registration :", e.message);
    }
  };

  return (
    <div>
      <div className="border-2 border-white justify-items-center">
        <h1>Get Users : </h1>
        <br />
        <span>Total Pages : {totalPages}</span>
        <br />
        <form onSubmit={handleSubmit} className="flex flex-3 flex-col">
          <label className="flex flex-2 gap-6">
            <span className="w-20">Page no :</span>
            <input
              className="border-white border w-10"
              type="number"
              value={page}
              onChange={(e) => {
                let num = parseInt(e.target.value);
                if (num >= 1 && num <= totalPages) {
                  setPage(parseInt(e.target.value));
                }
              }}
            />
          </label>
          <br />
          <label className="flex flex-2 gap-6">
            <span className="w-20">Limit :</span>
            <input
              className="border-white border w-10"
              type="number"
              value={limit}
              onChange={(e) => {
                let num = parseInt(e.target.value);
                if (num >= 1) {
                  setLimit(parseInt(e.target.value));
                }
              }}
            />
          </label>
          <br />
          <button>
            <input
              type="submit"
              value="Get Users"
              className="border-white rounded-md border w-30"
            />
          </button>
        </form>
        <br />
        <div>
          {users.length > 0 ? <span>Users : </span> : <></>}
          {users.map((u) => (
            <div key={u._id}>
              {u.email} - {u.status}
            </div>
          ))}
        </div>
        <br />
        <div>
          {admins.length > 0 ? <span>Admins : </span> : <></>}
          {admins.map((a) => (
            <div key={a.email}>
              {a.email} - {a.status}
            </div>
          ))}
        </div>
        <br />
      </div>
      <div className="border-2 border-white justify-items-center h-70">
        <br />
        <h1>Register new user</h1>
        <br />
        <form className="flex flex-3 flex-col" onSubmit={handleRegister}>
          <label className="flex flex-2 gap-6">
            <span className="w-20">Email : </span>
            <input
              type="email"
              id="email"
              className="border-white border w-40"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              required
            />
          </label>
          <br />
          <label className="flex flex-2 gap-6">
            <span className="w-20">Password : </span>
            <input
              type="password"
              id="password"
              className="border-white border w-40"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              required
            />
          </label>
          <br />
          <label className="flex flex-2 gap-6">
            <span className="w-20">Role : </span>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
              }}
              className="border-white border w-40 bg-gray-950 text-white text-center"
              required
            >
              <option value="" hidden disabled>
                Select Role
              </option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <br />
          <button>
            <input
              type="submit"
              value="Register"
              className="border-white rounded-md border w-30"
            />
          </button>
        </form>
      </div>
    </div>
  );
};

export default page;
