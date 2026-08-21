"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

type UserData = {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt?: any;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false); // <-- heihi i error siam tu

  // Dark mode detect automatic
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Firebase atangin user la chhuak
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const userList: UserData[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as UserData[];
        setUsers(userList);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: dark ? "#121212" : "#f9f9f9",
        color: dark ? "white" : "black",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        Users List
      </h1>

      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No users found in Firestore.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {users.map((user) => (
            <div
              key={user.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: dark ? "#1e1e1e" : "white",
                padding: "12px",
                borderRadius: "8px",
                border: `1px solid ${dark ? "#333" : "#ddd"}`,
              }}
            >
              <img
                src={user.photoURL || "https://via.placeholder.com/40"}
                alt={user.name}
                style={{ width: "40px", height: "40px", borderRadius: "50%" }}
              />
              <div>
                <p style={{ fontWeight: "600" }}>{user.name || "No Name"}</p>
                <p style={{ fontSize: "14px", opacity: 0.7 }}>{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
