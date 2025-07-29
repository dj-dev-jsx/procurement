import RequesterLayout from "@/Layouts/RequesterLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { User, FileText, ClipboardList, Building2, UserPlus, ArrowRightCircle, SendHorizonalIcon  } from "lucide-react";
import Swal from 'sweetalert2';

export default function Create({ requestedBy }) {
    const user = usePage().props.auth.user;
    const fullName = `${user.firstname} ${user.middlename ?? ''} ${user.lastname}`.trim();
    const prNumberFromServer = usePage().props.pr_number;

    const { data, setData, post, processing, errors } = useForm({
        focal_person: user.id,
        pr_number: prNumberFromServer || '',
        purpose: '',
        division_id: user.division.id,
        requested_by: requestedBy.name || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to proceed with creating this Purchase Request?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563EB', // Tailwind blue-600
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm',
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('requester.store'));
            }
        });
    };


    return (
        <RequesterLayout header="Schools Division Office - Ilagan | Create PR">
            <Head title="Create PR" />

            <div className="mx-auto mt-6 bg-white p-8 shadow-xl rounded">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Purchase Request</h2>
                {/* Progress Bar */}
                <div className="max-w-5xl mx-auto mb-5 bg-white shadow-md border border-gray-200 rounded-xl p-6">
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                    <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: "50%" }}
                    ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 font-semibold px-1">
                    <span className="text-blue-500">Step 1: Create PR</span>
                    <span className="text-gray-600">Step 2: Add Items</span>
                </div>
                </div>


                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Focal Person */}
                    <div className="flex flex-col">
                        <label htmlFor="focal_person" className="text-sm font-medium text-gray-700 mb-2">
                            Focal Person
                        </label>
                        <div className="relative">
                            <User className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                            <input
                                id="focal_person"
                                type="text"
                                value={fullName}
                                readOnly
                                placeholder="Auto-filled"
                                className="pl-10 pr-4 py-3 border border-gray-300 bg-gray-100 rounded-lg text-sm w-full"
                            />
                        </div>
                        {errors.focal_person && <p className="text-red-600 text-sm mt-1">{errors.focal_person}</p>}
                    </div>

                    {/* PR Number */}
                    <div className="flex flex-col">
                        <label htmlFor="pr_number" className="text-sm font-medium text-gray-700 mb-2">
                            PR Number
                        </label>
                        <div className="relative">
                            <FileText className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                            <input
                                id="pr_number"
                                type="text"
                                value={data.pr_number}
                                onChange={(e) => setData('pr_number', e.target.value)}
                                placeholder="Enter PR Number"
                                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 w-full"
                            />
                        </div>
                        {errors.pr_number && <p className="text-red-600 text-sm mt-1">{errors.pr_number}</p>}
                    </div>

                    {/* Purpose */}
                    <div className="flex flex-col md:col-span-2">
                        <label htmlFor="purpose" className="text-sm font-medium text-gray-700 mb-2">
                            Purpose
                        </label>
                        <div className="relative">
                            <ClipboardList className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                            <textarea
                                id="purpose"
                                value={data.purpose}
                                onChange={(e) => setData('purpose', e.target.value)}
                                placeholder="Describe the purpose of this request..."
                                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm resize-y focus:ring-2 focus:ring-blue-500 w-full"
                                rows={4}
                            />
                        </div>
                        {errors.purpose && <p className="text-red-600 text-sm mt-1">{errors.purpose}</p>}
                    </div>

                    {/* Division */}
                    <div className="flex flex-col">
                        <label htmlFor="division" className="text-sm font-medium text-gray-700 mb-2">
                            Division
                        </label>
                        <div className="relative">
                            <Building2 className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                            <input
                                id="division"
                                type="text"
                                value={user.division.division}
                                onChange={(e) => setData('division_id', e.target.value)}
                                placeholder="Auto-filled division"
                                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 w-full"
                            />
                        </div>
                        {errors.division_id && <p className="text-red-600 text-sm mt-1">{errors.division_id}</p>}
                    </div>

                    {/* Requested By */}
                    <div className="flex flex-col">
                        <label htmlFor="requested_by" className="text-sm font-medium text-gray-700 mb-2">
                            Requested By
                        </label>
                        <div className="relative">
                            <UserPlus className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                            <input
                                id="requested_by"
                                type="text"
                                value={data.requested_by}
                                onChange={(e) => setData('requested_by', e.target.value)}
                                placeholder="Enter requestor's name"
                                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 w-full"
                            />
                        </div>
                        {errors.requested_by && <p className="text-red-600 text-sm mt-1">{errors.requested_by}</p>}
                    </div>

                    {/* Submit Button */}
                    <div className="md:col-span-2 flex justify-end mt-4 gap-5">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="bg-red-600 hover:bg-red-400 text-white font-medium px-6 py-3 rounded-lg text-base transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg text-base transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    Proceed
                                    <SendHorizonalIcon className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </RequesterLayout>
    );
}
