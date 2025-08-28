import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, usePage } from "@inertiajs/react";
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

export default function Requesting({ divisions }) {
    const { props } = usePage();
    const success = props.flash?.success;
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (success) {
            setOpen(true); // open dialog automatically if success exists
        }
    }, [success]);
    return (
        <AdminLayout
            header={"Schools Division Office - Ilagan | Requisitioning Officers"}
        >
            <Head title="Requisitioning Officers" />

            <div className="overflow-x-auto mt-4">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">
                                Division
                            </th>
                            <th className="px-6 py-3 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">
                                Current Requisitioning Officer
                            </th>
                            <th className="px-6 py-3 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {divisions && divisions.length > 0 ? (
                            divisions.map((division) => (
                                <tr key={division.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-900">
                                        {division.division}
                                    </td>
                                    <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-900">
                                        {division.active_officer
                                            ? division.active_officer.name
                                            : "No active officer assigned"}
                                    </td>
                                    <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-900">
                                        <Link
                                            href={route("admin.edit_requesting", division.id)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                        >
                                            Update Officer
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="3"
                                    className="px-6 py-4 border-b border-gray-200 text-center text-sm text-gray-500"
                                >
                                    No divisions found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
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
