import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaTrash } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
const API_URL = import.meta.env.VITE_APP_URL ;

function User() {
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [updateUser , setUpdateUser] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    dob: "",
    gender: "",
    profile: null,
  });


const handleChange = (e) => {
  const { name, value, files } = e.target;

  if (name === "profile") {
    setFormData((prev) => ({
      ...prev,
      profile: files[0], // image file store karega
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};

  useEffect(() => {
    fetchUsers();
  }, []);

const fetchUsers = async () => {
  try {
    const res = await fetch(`${API_URL}/api/userGet`);
    const data = await res.json();
    setUsers(data);
  } catch (err) {
    console.error("Error fetching users:", err);
  }
};



const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // agar password match nhi karte to error
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // form data banate hain
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    // backend ko request bhejte hain
    const res = await fetch(`${API_URL}/api/users`, {
      method: "POST",
      body: formDataToSend,
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("User registered successfully!");
       
      setFormData({
        name: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        address: "",
        dob: "",
        gender: "",
        profile: null,
      });
      fetchUsers()
      setShowForm(false)
      setUsers([...users , formData])
    } else {
      toast.error(data.message || "Error registering user");
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  }
};

const UpdateUser = (user) => {
  setUpdateUser(true);
  setFormData({
     id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    password: "",
    confirmPassword: "",
    address: user.address,
    dob: user.dob,
    gender: user.gender,
    profile: null,
  });
};

const handleUpdateSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  const formDataToSend = new FormData();
  Object.entries(formData).forEach(([key, value]) => formDataToSend.append(key, value));

  try {
    const res = await fetch(`${API_URL}/api/updateUser/${formData.id}`, {
      method: "PUT",
      body: formDataToSend,
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("User updated successfully");

      // Update list in frontend
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === formData.id ? { ...u, ...formData } : u))
      );

      setUpdateUser(false); // popup close
    } else {
      toast.error(data.message || "Error updating user");
    }
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong");
  }
};


const DeleteUser = async (id) =>{
    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, {
      method: "delete",
    
    });
        if(res){
           toast.success("user Delete Successfully")
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
        }
    } catch (error) {
          console.log(error);
          
    }
   

    
}

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">👤 User Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all"
        >
          ➕ Add User
        </button>
      </div>

      {/* Add User Form */}
      {showForm && (
        <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">Register User</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inputs */}
            {[
              { type: "text", name: "name", placeholder: "Full Name" },
              { type: "text", name: "username", placeholder: "Username" },
              { type: "email", name: "email", placeholder: "Email Address" },
              { type: "text", name: "phone", placeholder: "Phone Number" },
              { type: "password", name: "password", placeholder: "Password" },
              { type: "password", name: "confirmPassword", placeholder: "Confirm Password" },
            ].map((input, i) => (
              <input
                key={i}
                {...input}
                value={formData[input.name] || ""}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                required
              />
            ))}

            <input
              type="date"
              name="dob"
              value={formData.dob || ""}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />

            <select
              name="gender"
              value={formData.gender || ""}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <input
              type="file"
              name="profile"
              accept="image/*"
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
            />

            <textarea
              name="address"
              placeholder="Address"
              value={formData.address || ""}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none md:col-span-2"
            />

            {/* Buttons */}
            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition"
              >
                Save User
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Registered Users</h2>

        {/* Table Header */}
        <div className="grid grid-cols-8 gap-4 bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-lg">
          <div>ID</div>
          <div>Name</div>
          <div>Username</div>
          <div>Email</div>
          <div>Phone</div>
          <div>Gender</div>
          <div className="text-center">Edit</div>
          <div className="text-center">Delete</div>
        </div>

        {/* Table Rows */}
        <div className="space-y-2 mt-2">
          {users.map((user, index) => (
            <div
              key={index}
              className="grid grid-cols-8 gap-4 items-center bg-white border rounded-lg px-4 py-3 shadow hover:shadow-md transition"
            >
              <div className="font-medium text-gray-800">{user.id}</div>
              <div className="font-medium text-gray-800">{user.name}</div>
              <div className="text-gray-600">@{user.username}</div>
              <div className="text-gray-600 truncate">{user.email}</div>
              <div className="text-gray-600">{user.phone}</div>
              <div className="capitalize">{user.gender}</div>

              {/* Edit Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => UpdateUser(user)}
                  className="text-blue-500 hover:text-blue-700 transition"
                >
                  <FaEdit size={18} />
                </button>
              </div>

              {/* Delete Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => DeleteUser(user.id)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <FaTrash size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Update User Modal */}
      {updateUser && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[600px] relative">
            <IoMdClose
              className="absolute right-4 top-4 text-gray-500 cursor-pointer hover:text-red-500"
              size={24}
              onClick={() => setUpdateUser(null)}
            />
            <h2 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">Update User</h2>

            <form onSubmit={handleUpdateSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Inputs same as add form */}
              {[
                { type: "text", name: "name", placeholder: "Full Name" },
                { type: "text", name: "username", placeholder: "Username" },
                { type: "email", name: "email", placeholder: "Email Address" },
                { type: "text", name: "phone", placeholder: "Phone Number" },
                { type: "password", name: "password", placeholder: "Password" },
                { type: "password", name: "confirmPassword", placeholder: "Confirm Password" },
              ].map((input, i) => (
                <input
                  key={i}
                  {...input}
                  value={formData[input.name] || ""}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />
              ))}

              <input
                type="date"
                name="dob"
                value={formData.dob || ""}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              />

              <select
                name="gender"
                value={formData.gender || ""}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <input
                type="file"
                name="profile"
                accept="image/*"
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />

              <textarea
                name="address"
                placeholder="Address"
                value={formData.address || ""}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none md:col-span-2"
              />

              {/* Buttons */}
              <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition"
                >
                  Update User
                </button>
                <button
                  type="button"
                  onClick={() => setUpdateUser(null)}
                  className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default User;
