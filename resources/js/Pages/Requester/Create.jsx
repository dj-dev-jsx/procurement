    import RequesterLayout from "@/Layouts/RequesterLayout";
    import { Head, useForm, usePage } from "@inertiajs/react";
    import { useState } from "react";

    export default function Create({ requestedBy }) {
    const user = usePage().props.auth.user;
    console.log(requestedBy);
    const fullName = `${user.firstname} ${user.middlename ?? ''} ${user.lastname}`.trim();
    const prNumberFromServer = usePage().props.pr_number;

    const { data, setData, post, processing, errors } = useForm({
        focal_person: user.id,
        pr_number: prNumberFromServer || '',
        purpose: '',
        division_id: user.division.id,
        requested_by: requestedBy.name || "",
    });
    console.log(data);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('requester.store')); // Make sure this route exists
    };

    return (
    <RequesterLayout header={'Schools Division Office - Ilagan | Create PR'}>
        <Head title="Create PR" />

    <div className="max-w-4xl mx-auto mt-10 bg-white p-8 shadow-lg rounded-xl">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Focal Person */}
            <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-2">Focal Person</label>
                <input
                    type="text"
                    value={fullName}
                    readOnly
                    className="border border-gray-300 rounded-md p-3 text-base bg-gray-100"
                />
                {errors.focal_person && <p className="text-sm text-red-600 mt-1">{errors.focal_person}</p>}
            </div>

            {/* PR Number */}
            <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-2">PR Number</label>
                <input
                    type="text"
                    value={data.pr_number}
                    onChange={(e) => setData('pr_number', e.target.value)}
                    className="border border-gray-300 rounded-md p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.pr_number && <p className="text-sm text-red-600 mt-1">{errors.pr_number}</p>}
            </div>

            {/* Purpose */}
            <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-medium text-gray-600 mb-2">Purpose</label>
                <textarea
                    value={data.purpose}
                    onChange={(e) => setData('purpose', e.target.value)}
                    className="border border-gray-300 rounded-md p-3 text-base resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                />
                {errors.purpose && <p className="text-sm text-red-600 mt-1">{errors.purpose}</p>}
            </div>

            {/* Division */}
            <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-2">Division</label>
                <input
                    type="text"
                    value={user.division.division}
                    onChange={(e) => setData('division_id', e.target.value)}
                    className="border border-gray-300 rounded-md p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.division_id && <p className="text-sm text-red-600 mt-1">{errors.division_id}</p>}
            </div>

            {/* Requested By */}
            <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-2">Requested By</label>
                <input
                    type="text"
                    value={data.requested_by}
                    onChange={(e) => setData('requested_by', e.target.value)}
                    className="border border-gray-300 rounded-md p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.requested_by && <p className="text-sm text-red-600 mt-1">{errors.requested_by}</p>}
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 flex justify-center mt-4">
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-base transition disabled:opacity-50"
                >
                    {processing ? 'Creating...' : 'Create Purchase Request'}
                </button>
            </div>

        </form>
    </div>
    </RequesterLayout>




    );
    }
