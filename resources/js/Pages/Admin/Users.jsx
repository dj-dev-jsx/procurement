import AdminLayout from "@/Layouts/AdminLayout";
import { PencilSquareIcon, TrashIcon, UserCircleIcon } from "@heroicons/react/24/solid"; // Added UserCircleIcon
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function Users({ users, filters }) {
    const { props } = usePage();
    const success = props.flash?.success;
    const [open, setOpen] = useState(false);
    const {data, setData, get} = useForm({
        search: filters.search || "",
        division: filters.division || ""
    })
    useEffect(() => {
    const delayDebounce = setTimeout(() => {
        get(route("admin.view_users"), {
        preserveState: true,
        replace: true,
        });
    }, 300);

    return () => clearTimeout(delayDebounce);
    }, [data.search, data.division]);

    useEffect(() => {
        if (success) {
            setOpen(true); 
        }
    }, [success]);

    // Placeholder functions for actions
    const handleEdit = (userId) => {
        console.log(`Editing user with ID: ${userId}`);
        // Implement your edit logic here, e.g., redirect to an edit page
    };

    const handleDelete = (userId) => {
        console.log(`Deleting user with ID: ${userId}`);
        // Implement your delete logic here, e.g., show a confirmation dialog
    };

    return (
        <AdminLayout
            header={
                'Schools Division Office - Ilagan | Users'
            }
        >
            <Head title="Users" />
            <div className=" rounded-lg mb-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mb-4 md:mb-0">
                        <form onSubmit={(e) => e.preventDefault()} className="flex flex-wrap items-center gap-3">
                        <input
                            type="text"
                            name="search"
                            placeholder="Name..."
                            className="w-96 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={data.search}
                            onChange={(e) => setData("search", e.target.value)}
                        />
                        <select
                        value={data.division}
                        onChange={(e) => setData("division", e.target.value)}
                        className="border border-gray-300 px-10 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                        <option value="">All Divisions</option>
                        {filters.divisions.map((division) => (
                            <option key={division.id} value={division.id}>
                            {division.division}
                            </option>
                        ))}
                        </select>

                        </form>
                    </div>
                    <a
                        href={route("admin.create_user_form")}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out shadow-md hover:shadow-lg w-full md:w-auto text-center"
                    >
                        + Add User
                    </a>
                </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 border">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border">
                                ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border">
                                Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border">
                                Division
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border">
                                Position
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border">
                                Role
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.data && users.data.length > 0 ? (
                            users.data.map((user) => (
                                <tr key={user.id} className="hover:bg-blue-100 transition duration-150 ease-in-out border">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border">
                                        {user.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">
                                        <div className="flex items-center"> {/* Flex container for icon and text */}
                                            <UserCircleIcon className="w-5 h-5 text-gray-400 mr-2" /> {/* User icon */}
                                            {user.firstname} {user.middleinitial} {user.lastname}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">
                                        {user.division?.division || <span className="text-gray-500 italic">N/A</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">
                                        {user.position || <span className="text-gray-500 italic">N/A</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">
                                        {user.roles.map((role, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                            {role.name.replace(/_/g, ' ')
                                                .replace(/\b\w/g, c => c.toUpperCase())}
                                            </span>
                                        ))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium border">
                                        <button
                                            onClick={() => handleEdit(user.id)}
                                            className="inline-flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out mr-2"
                                            title="Edit User"
                                        >
                                            <PencilSquareIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="inline-flex items-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                                            title="Delete User"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {/* Pagination */}
                <div className="flex items-center justify-center space-x-1 mt-6">
                {users.links.map((link, index) => (
                    <Link
                    key={index}
                    href={link.url || "#"}
                    className={`
                        min-w-[40px] px-3 py-2 text-sm font-medium rounded-lg transition
                        ${link.active 
                        ? "bg-blue-600 text-white shadow-md" 
                        : "bg-white text-gray-700 border hover:bg-blue-50"
                        }
                        ${!link.url ? "cursor-not-allowed opacity-50" : ""}
                    `}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
                </div>

            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Success</DialogTitle>
                        <DialogDescription>
                            {success}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}