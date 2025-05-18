import AdminLayout from "@/Layouts/AdminLayout";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { Head } from "@inertiajs/react";

export default function Users({ users }) {
    return (
        <AdminLayout
            header={
                    'Schools Division Office - Ilagan | Users'
                
            }
        >
            <Head title="Users" />

            <div className="overflow-x-auto mt-4">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">
                                ID
                            </th>
                            <th className="px-6 py-3 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">
                                Name
                            </th>
                            <th className="px-6 py-3 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">
                                Email
                            </th>
                            <th className="px-6 py-3 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">
                                Division
                            </th>
                            <th className="px-6 py-3 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">
                                Position
                            </th>
                            <th className="px-6 py-3 border-b border-gray-200 text-center text-sm font-semibold text-gray-700">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users && users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-900">
                                        {user.id}
                                    </td>
                                    <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-900">
                                        {user.firstname} {user.middleinitial} {user.lastname}
                                    </td>
                                    <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-900">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-900">
                                        {user.division?.division || 'No division'}
                                    </td>
                                    <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-900">
                                        {user.position || 'No position'}
                                    </td>
                                    <td className="px-6 py-4 border-b border-gray-200 text-sm text-center text-gray-900 space-x-2">
                                    <button
                                        onClick={() => handleEdit(user.id)}
                                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        <PencilSquareIcon className="w-4 h-4 mr-1" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        <TrashIcon className="w-4 h-4 mr-1" />
                                        Delete
                                    </button>
                                </td>

                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="3"
                                    className="px-6 py-4 border-b border-gray-200 text-center text-sm text-gray-500"
                                >
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
