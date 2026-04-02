"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { adminAPI } from "@/lib/api";
import {
  Users,
  MapPin,
  BarChart3,
  Trash2,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Card, { CardBody } from "@/components/ui/Card";

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [tab, setTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [usersPagination, setUsersPagination] = useState({});
  const [tripsPagination, setTripsPagination] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      setError("Admin access required");
      setLoading(false);
      return;
    }
    fetchStats();
  }, [isAuthenticated, user]);

  const fetchStats = async () => {
    try {
      const { data } = await adminAPI.getStats();
      setStats(data.data);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to load stats");
    }
    setLoading(false);
  };

  const fetchUsers = async (page = 1) => {
    try {
      const { data } = await adminAPI.getUsers({ page, limit: 10, search });
      setUsers(data.data);
      setUsersPagination(data.pagination);
    } catch {}
  };

  const fetchTrips = async (page = 1) => {
    try {
      const { data } = await adminAPI.getTrips({ page, limit: 10 });
      setTrips(data.data);
      setTripsPagination(data.pagination);
    } catch {}
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Delete this user and all their data?")) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(users.filter((u) => u._id !== id));
    } catch {}
  };

  const handleTabChange = (t) => {
    setTab(t);
    if (t === "users") fetchUsers();
    if (t === "trips") fetchTrips();
  };

  if (error && !stats) {
    return (
      <Container className="py-16 text-center">
        <Shield className="w-16 h-16 text-error-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Access Denied
        </h1>
        <p className="text-neutral-600 mb-6">{error}</p>
        <Button variant="primary" onClick={() => router.push("/")}>
          Go Home
        </Button>
      </Container>
    );
  }

  if (loading)
    return (
      <Container className="py-16 text-center">
        <p className="text-neutral-500">Loading...</p>
      </Container>
    );

  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">Admin Panel</h1>
      <p className="text-neutral-600 mb-6">
        Manage users, trips, and view platform stats
      </p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-neutral-100 rounded-lg p-1 w-fit">
        {[
          { key: "stats", label: "Stats", icon: BarChart3 },
          { key: "users", label: "Users", icon: Users },
          { key: "trips", label: "Trips", icon: MapPin },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-white text-primary-700 shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Stats Tab */}
      {tab === "stats" && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardBody>
              <p className="text-sm text-neutral-500">Total Users</p>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.totalUsers}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-neutral-500">Total Trips</p>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.totalTrips}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-neutral-500">Total Groups</p>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.totalGroups}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-neutral-500">New Users (7d)</p>
              <p className="text-3xl font-bold text-primary-600">
                {stats.recentUsers}
              </p>
            </CardBody>
          </Card>
          {stats.tripsByStatus &&
            Object.entries(stats.tripsByStatus).length > 0 && (
              <Card className="sm:col-span-2">
                <CardBody>
                  <p className="text-sm text-neutral-500 mb-3">
                    Trips by Status
                  </p>
                  <div className="flex gap-4">
                    {Object.entries(stats.tripsByStatus).map(
                      ([status, count]) => (
                        <div key={status} className="text-center">
                          <p className="text-xl font-bold text-neutral-900">
                            {count}
                          </p>
                          <p className="text-xs text-neutral-500 capitalize">
                            {status}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </CardBody>
              </Card>
            )}
        </div>
      )}

      {/* Users Tab */}
      {tab === "users" && (
        <div>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchUsers()}>
              Search
            </Button>
          </div>
          <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">
                    Joined
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-neutral-100 hover:bg-neutral-50"
                  >
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-neutral-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${u.role === "admin" ? "bg-primary-100 text-primary-700" : "bg-neutral-100 text-neutral-600"}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="text-neutral-400 hover:text-error-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {usersPagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="ghost"
                size="sm"
                disabled={usersPagination.page <= 1}
                onClick={() => fetchUsers(usersPagination.page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-neutral-600">
                Page {usersPagination.page} of {usersPagination.pages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={usersPagination.page >= usersPagination.pages}
                onClick={() => fetchUsers(usersPagination.page + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Trips Tab */}
      {tab === "trips" && (
        <div>
          <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">
                    Destination
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">
                    User
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => (
                  <tr
                    key={t._id}
                    className="border-b border-neutral-100 hover:bg-neutral-50"
                  >
                    <td className="px-4 py-3 font-medium">{t.title}</td>
                    <td className="px-4 py-3 text-neutral-600">
                      {t.destination}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {t.user?.name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-neutral-100 text-neutral-600 capitalize">
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tripsPagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="ghost"
                size="sm"
                disabled={tripsPagination.page <= 1}
                onClick={() => fetchTrips(tripsPagination.page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-neutral-600">
                Page {tripsPagination.page} of {tripsPagination.pages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={tripsPagination.page >= tripsPagination.pages}
                onClick={() => fetchTrips(tripsPagination.page + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
