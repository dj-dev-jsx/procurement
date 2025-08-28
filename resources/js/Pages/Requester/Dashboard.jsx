import RequesterLayout from "@/Layouts/RequesterLayout";
import { Head, Link, usePage } from "@inertiajs/react";

export default function Dashboard() {
    const { auth, stats, recent_prs } = usePage().props;

    return (
        <RequesterLayout
            header={"Schools Division Office - Ilagan | Dashboard"}
        >
            <Head title="Dashboard" />

            {/* Welcome Section */}
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Welcome back, {auth.user.firstname}!
                </h1>
                <p className="text-gray-600">
                    Here’s an overview of your requisitions.
                </p>
            </div>

            {/* Quick Stats */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-100 rounded-2xl p-4 shadow">
                    <h2 className="text-lg font-medium text-blue-800">Total PRs</h2>
                    <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <div className="bg-yellow-100 rounded-2xl p-4 shadow">
                    <h2 className="text-lg font-medium text-yellow-800">Pending</h2>
                    <p className="text-3xl font-bold">{stats.pending}</p>
                </div>
                <div className="bg-green-100 rounded-2xl p-4 shadow">
                    <h2 className="text-lg font-medium text-green-800">Approved</h2>
                    <p className="text-3xl font-bold">{stats.approved}</p>
                </div>
            </div> */}

            {/* Recent PRs */}
            {/* <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Recent PRs</h2>
                    <Link
                        // href={route("requester.prs.index")}
                        className="text-blue-600 hover:underline text-sm"
                    >
                        View All
                    </Link>
                </div>

                {recent_prs && recent_prs.length > 0 ? (
                    <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">PR No.</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent_prs.map((pr) => (
                                <tr key={pr.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm text-gray-800">{pr.pr_number}</td>
                                    <td className="px-4 py-2 text-sm text-gray-600">{pr.created_at}</td>
                                    <td className="px-4 py-2 text-sm">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${
                                                pr.status === "approved"
                                                    ? "bg-green-100 text-green-700"
                                                    : pr.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {pr.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-500 text-sm">No recent purchase requests.</p>
                )}
            </div> */}

            {/* Shortcut Button */}
            <div className="mt-6">
                <Link
                    href={route("requester.create")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-2xl shadow hover:bg-blue-700"
                >
                    + Create New Purchase Request
                </Link>
            </div>
        </RequesterLayout>
    );
}
