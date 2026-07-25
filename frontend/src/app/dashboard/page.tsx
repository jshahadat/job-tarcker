/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import Link from "next/link";

interface Job {
  id: number;
  company: string;
  position: string;
  status: "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  location: string | null;
  salary: string | null;
  notes: string | null;
  appliedDate: string;
}

const statusColors = {
  APPLIED: "bg-blue-100 text-blue-700",
  INTERVIEW: "bg-yellow-100 text-yellow-700",
  OFFER: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchJobs();
  }, [token]);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs");
      setJobs(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this job?")) return;
    try {
      await api.delete(`/jobs/${id}`);
      setJobs(jobs.filter((job) => job.id !== id));
    } catch (error) {
      alert("Failed to delete");
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await api.patch(`/jobs/${id}`, { status });
      setJobs(jobs.map((job) => (job.id === id ? res.data : job)));
    } catch (error) {
      alert("Failed to update");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Job Tracker</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Hi, {user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              My Applications
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {jobs.length} jobs tracked
            </p>
          </div>
          <Link
            href="/jobs/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Add Job
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {(["APPLIED", "INTERVIEW", "OFFER", "REJECTED"] as const).map((s) => (
            <div key={s} className="bg-white rounded-xl p-4 border">
              <p className="text-2xl font-bold text-gray-800">
                {jobs.filter((j) => j.status === s).length}
              </p>
              <p
                className={`text-xs font-medium mt-1 ${statusColors[s].split(" ")[1]}`}
              >
                {s}
              </p>
            </div>
          ))}
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No jobs yet</p>
            <Link
              href="/jobs/new"
              className="text-blue-600 text-sm hover:underline mt-2 block"
            >
              Add your first job →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl border p-5 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {job.position}
                  </h3>
                  <p className="text-gray-500 text-sm">{job.company}</p>
                  {job.location && (
                    <p className="text-gray-400 text-xs mt-1">{job.location}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={job.status}
                    onChange={(e) => handleStatusChange(job.id, e.target.value)}
                    className={`text-xs font-medium px-3 py-1 rounded-full border-0 cursor-pointer ${statusColors[job.status]}`}
                  >
                    <option value="APPLIED">APPLIED</option>
                    <option value="INTERVIEW">INTERVIEW</option>
                    <option value="OFFER">OFFER</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>

                  <button
                    onClick={() => handleDelete(job.id)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
