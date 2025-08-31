import SupplyOfficerLayout from "@/Layouts/SupplyOfficerLayout";
import { Head, Link } from "@inertiajs/react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Boxes,
    ClipboardList,
    Truck,
    PackageCheck,
    AlertTriangle,
    FileSpreadsheet,
    FileCheck,
    FileText,
    Layers,
} from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
} from "recharts";

export default function Dashboard() {
    // Example stats (replace with backend data later)
    const stats = [
        { label: "Total Stock Items", value: 145, icon: Boxes, color: "bg-blue-100 text-blue-600" },
        { label: "Low Stock Alerts", value: 8, icon: AlertTriangle, color: "bg-red-100 text-red-600" },
        { label: "Pending Deliveries", value: 5, icon: Truck, color: "bg-yellow-100 text-yellow-600" },
        { label: "Issued to Departments", value: 72, icon: PackageCheck, color: "bg-green-100 text-green-600" },
    ];

    // RIS, ICS, PAR, PO, Issuance quick stats
    const documents = [
        { label: "RIS (Requisition)", value: 32, icon: ClipboardList, link: "#", color: "bg-purple-100 text-purple-600" },
        { label: "ICS (High)", value: 12, icon: FileSpreadsheet, link: "#", color: "bg-pink-100 text-pink-600" },
        { label: "ICS (Low)", value: 20, icon: FileSpreadsheet, link: "#", color: "bg-indigo-100 text-indigo-600" },
        { label: "PAR", value: 18, icon: FileCheck, link: "#", color: "bg-orange-100 text-orange-600" },
        { label: "Purchase Orders", value: 10, icon: FileText, link: "#", color: "bg-teal-100 text-teal-600" },
        { label: "Issuance Logs", value: 45, icon: Layers, link: "#", color: "bg-sky-100 text-sky-600" },
    ];

    // Bar chart: Stock Levels by Category
    const stockData = [
        { category: "Office Supplies", qty: 50 },
        { category: "Electronics", qty: 30 },
        { category: "Furniture", qty: 20 },
        { category: "Cleaning", qty: 45 },
    ];

    // Pie chart: Requests Status handled by Supply Officer
    const requestStatusData = [
        { name: "Processed", value: 60, color: "#16a34a" },
        { name: "Pending", value: 10, color: "#eab308" },
        { name: "On-Hold", value: 5, color: "#dc2626" },
    ];

    const recentActivity = [
        { id: "REQ-201", action: "Issued 20 Bond Papers", status: "Processed", date: "Aug 29, 2025" },
        { id: "REQ-202", action: "Laptop Request from IT", status: "Pending", date: "Aug 30, 2025" },
        { id: "REQ-203", action: "Chairs Delivery to Admin", status: "Processed", date: "Aug 31, 2025" },
    ];

    return (
        <SupplyOfficerLayout header={"Schools Division Office - Ilagan | Dashboard"}>
            <Head title="Dashboard" />

            {/* Welcome Section */}
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Welcome Supply Officer!</h1>
                <p className="text-gray-600">
                    Manage inventory, RIS, ICS, PAR, PO, and Issuance efficiently from your dashboard.
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="rounded-2xl shadow hover:shadow-md transition">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className={`p-3 rounded-xl ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">{stat.label}</p>
                                <h3 className="text-xl font-semibold text-gray-800">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Documents Quick Links */}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Documents & Logs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {documents.map((doc, idx) => (
                    <Link href={doc.link} key={idx}>
                        <Card className="rounded-2xl shadow hover:shadow-lg transition">
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className={`p-3 rounded-xl ${doc.color}`}>
                                    <doc.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">{doc.label}</p>
                                    <h3 className="text-xl font-semibold text-gray-800">{doc.value}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Data Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Bar Chart - Stock Levels */}
                <Card className="rounded-2xl shadow">
                    <CardContent className="p-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Stock Levels by Category</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={stockData || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="qty" fill="#2563eb" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Pie Chart - Request Handling */}
                <Card className="rounded-2xl shadow">
                    <CardContent className="p-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Requests Status</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={requestStatusData || []}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                >
                                    {requestStatusData.map((entry, idx) => (
                                        <Cell key={`cell-${idx}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-6 mt-4">
                            {requestStatusData.map((s, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></span>
                                    <span className="text-sm text-gray-600">{s.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
                <table className="w-full text-sm text-left text-gray-600">
                    <thead>
                        <tr className="border-b">
                            <th className="px-4 py-2">Request ID</th>
                            <th className="px-4 py-2">Action</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentActivity.map((act, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2 font-medium text-gray-800">{act.id}</td>
                                <td className="px-4 py-2">{act.action}</td>
                                <td className="px-4 py-2">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium
                                            ${
                                                act.status === "Processed"
                                                    ? "bg-green-100 text-green-600"
                                                    : act.status === "Pending"
                                                    ? "bg-yellow-100 text-yellow-600"
                                                    : "bg-red-100 text-red-600"
                                            }
                                        `}
                                    >
                                        {act.status}
                                    </span>
                                </td>
                                <td className="px-4 py-2">{act.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </SupplyOfficerLayout>
    );
}
