export default function APIDocsPage() {
  const endpoints = [
    {
      method: "POST",
      path: "/api/auth/register",
      desc: "Register a new user",
      auth: "None",
    },
    {
      method: "POST",
      path: "/api/auth/login",
      desc: "Login and get JWT token",
      auth: "None",
    },
    {
      method: "GET",
      path: "/api/auth/profile",
      desc: "Get authenticated user profile",
      auth: "Bearer",
    },
    {
      method: "POST",
      path: "/api/chat",
      desc: "Send message to AI (anonymous or authenticated)",
      auth: "Optional",
    },
    {
      method: "GET",
      path: "/api/trips",
      desc: "List user's trips",
      auth: "Bearer",
    },
    {
      method: "POST",
      path: "/api/trips",
      desc: "Create a new trip",
      auth: "Bearer",
    },
    {
      method: "POST",
      path: "/api/trips/generate",
      desc: "AI-generate an itinerary",
      auth: "Bearer",
    },
    {
      method: "GET",
      path: "/api/external/geocode?q=Tokyo",
      desc: "Geocode a city name",
      auth: "None",
    },
    {
      method: "GET",
      path: "/api/external/weather?lat=&lng=",
      desc: "Get current weather",
      auth: "Optional",
    },
    {
      method: "GET",
      path: "/api/external/currency?from=USD&to=PKR",
      desc: "Currency conversion",
      auth: "None",
    },
    {
      method: "GET",
      path: "/api/external/places?query=&lat=&lng=",
      desc: "Search nearby places",
      auth: "Optional",
    },
    {
      method: "PUT",
      path: "/api/users/preferences",
      desc: "Update travel preferences",
      auth: "Bearer",
    },
    {
      method: "POST",
      path: "/api/groups",
      desc: "Create a group trip",
      auth: "Bearer",
    },
    {
      method: "GET",
      path: "/api/admin/stats",
      desc: "Platform statistics",
      auth: "Admin",
    },
  ];

  const methodColors = {
    GET: "#2E7D32",
    POST: "#1565C0",
    PUT: "#E65100",
    DELETE: "#C62828",
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px" }}>
      <p className="section-label">Developers</p>
      <h1
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: "#0A0A0A",
          marginTop: 8,
          marginBottom: 16,
        }}
      >
        API Reference
      </h1>
      <p style={{ fontSize: 18, color: "#6B7280", marginBottom: 12 }}>
        Base URL:{" "}
        <code
          style={{
            background: "#F5F5F5",
            padding: "2px 8px",
            borderRadius: 6,
            fontSize: 15,
          }}
        >
          https://travelfy-backend-bb5g.onrender.com
        </code>
      </p>
      <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 48 }}>
        All responses follow the format:{" "}
        <code
          style={{ background: "#F5F5F5", padding: "2px 8px", borderRadius: 6 }}
        >
          {"{ success: true, data: {...} }"}
        </code>
      </p>

      <div
        style={{
          border: "1px solid #E5E7EB",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
        >
          <thead>
            <tr
              style={{
                background: "#FAF9F7",
                borderBottom: "1px solid #E5E7EB",
              }}
            >
              <th
                style={{
                  padding: "14px 20px",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "#6B7280",
                }}
              >
                Method
              </th>
              <th
                style={{
                  padding: "14px 20px",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "#6B7280",
                }}
              >
                Endpoint
              </th>
              <th
                style={{
                  padding: "14px 20px",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "#6B7280",
                }}
              >
                Description
              </th>
              <th
                style={{
                  padding: "14px 20px",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "#6B7280",
                }}
              >
                Auth
              </th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((ep) => (
              <tr
                key={ep.path + ep.method}
                style={{ borderBottom: "1px solid #F0F0F0" }}
              >
                <td style={{ padding: "12px 20px" }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 12,
                      color: methodColors[ep.method] || "#0A0A0A",
                      fontFamily: "monospace",
                    }}
                  >
                    {ep.method}
                  </span>
                </td>
                <td
                  style={{
                    padding: "12px 20px",
                    fontFamily: "monospace",
                    fontSize: 13,
                    color: "#0A0A0A",
                  }}
                >
                  {ep.path}
                </td>
                <td style={{ padding: "12px 20px", color: "#6B7280" }}>
                  {ep.desc}
                </td>
                <td style={{ padding: "12px 20px" }}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 600,
                      background:
                        ep.auth === "None"
                          ? "#E8F5E9"
                          : ep.auth === "Admin"
                            ? "#FCE4EC"
                            : "#E3F2FD",
                      color:
                        ep.auth === "None"
                          ? "#2E7D32"
                          : ep.auth === "Admin"
                            ? "#C62828"
                            : "#1565C0",
                    }}
                  >
                    {ep.auth}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
