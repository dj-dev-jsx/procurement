import NavLink from "@/Components/NavLink";
import RequesterLayout from "@/Layouts/RequesterLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { User, FileText, ClipboardList, Building2, UserPlus, SendHorizonalIcon } from "lucide-react";
import Swal from 'sweetalert2';
import { useState, useMemo } from "react";

function ProductTable({ products, handleProductSelect }) {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredProducts = useMemo(() => {
        return products.filter((product) =>
            `${product.name} ${product.specs}`
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [search, products]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(start, start + itemsPerPage);
    }, [filteredProducts, currentPage]);

    const handlePrev = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNext = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    return (
        <div className="flex flex-col md:col-span-2">
            {/* Header + Add Button */}
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-xl font-semibold text-gray-800">Available Products</h4>
                <NavLink
                    href="#"
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition duration-200"
                >
                    Add New Product
                </NavLink>
            </div>

            {/* Search */}
            <div className="mb-4">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1); // reset to page 1 on search
                    }}
                    placeholder="Search by item name or specifications..."
                    className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-400"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-300 rounded-lg shadow">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-3 py-2 border">Item</th>
                            <th className="px-3 py-2 border">Specifications</th>
                            <th className="px-3 py-2 border">Unit</th>
                            <th className="px-3 py-2 border">Default Price (₱)</th>
                            <th className="px-3 py-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedProducts.length > 0 ? (
                            paginatedProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 border">{product.name}</td>
                                    <td className="px-3 py-2 border">{product.specs}</td>
                                    <td className="px-3 py-2 border">{product.unit?.unit || '-'}</td>
                                    <td className="px-3 py-2 border">{Number(product.default_price).toFixed(2)}</td>
                                    <td className="px-3 py-2 border text-center">
                                        <button
                                            type="button"
                                            onClick={() => handleProductSelect(product.id)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white w-8 h-8 rounded-full text-lg font-bold transition"
                                            title="Add Product"
                                        >
                                            +
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-4 text-gray-500">
                                    No products match your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-4">
                    <button
                        onClick={handlePrev}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md ${
                            currentPage === 1
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded-md ${
                            currentPage === totalPages
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
function ProductModal({ isOpen, onClose, onConfirm, product }) {
    const [quantity, setQuantity] = useState("");

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Add Product to PR</h3>
                <div className="space-y-3 text-sm text-gray-700">
                    <p><strong>Item:</strong> {product.name}</p>
                    <p><strong>Specs:</strong> {product.specs}</p>
                    <p><strong>Unit:</strong> {product.unit?.unit || '-'}</p>
                    <p><strong>Unit Price (₱):</strong> {Number(product.default_price).toFixed(2)}</p>
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <input
                        type="number"
                        min="1"
                        step="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (quantity > 0) {
                                onConfirm(quantity);
                                setQuantity("");
                            }
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Create({ requestedBy, products }) {
    const user = usePage().props.auth.user;
    const fullName = `${user.firstname} ${user.middlename ?? ''} ${user.lastname}`.trim();
    const prNumberFromServer = usePage().props.pr_number;
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);


    const { data, setData, post, processing, errors } = useForm({
        focal_person: user.id,
        pr_number: prNumberFromServer || '',
        purpose: '',
        division_id: user.division.id,
        requested_by: requestedBy.name || "",
        products: [],
    });



const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data before submit:", data);

    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to proceed with creating this Purchase Request?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#2563EB',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirm',
    }).then((result) => {
        if (result.isConfirmed) {
            post(route('requester.store'), data, {
                preserveScroll: true,
                onSuccess: () => {
                    Swal.fire('Success!', 'PR submitted.', 'success');
                },
                onError: () => {
                    Swal.fire('Error', 'Something went wrong.', 'error');
                },
            });
        }
    });
};
const handleProductSelect = (productId) => {
    const selected = products.find(p => p.id === productId);
    if (selected) {
        setSelectedProduct(selected);
        setModalOpen(true);
    }
};
const handleConfirmProduct = (quantity) => {
    const newProduct = {
        product_id: selectedProduct.id,
        item: selectedProduct.name,
        specs: selectedProduct.specs,
        unit: selectedProduct.unit.unit,
        unit_price: Number(selectedProduct.default_price),
        total_item_price: Number(selectedProduct.default_price * quantity), // 👈 cast to number
        quantity: Number(quantity), // 👈 cast to number
        };
    console.log(newProduct);


    setData("products", [...data.products, newProduct]);

    setModalOpen(false);
    setSelectedProduct(null);
};




    return (
        <RequesterLayout header="Schools Division Office - Ilagan | Create PR">
            <Head title="Create PR" />

            <div className="mx-auto mt-6 bg-white p-8 shadow-xl rounded">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Purchase Request</h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

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
                    {/*Selected Product Preview*/}
                    <div className="flex flex-col md:col-span-2">
                        <h4 className="text-lg font-semibold mb-2 text-gray-800">Selected Products</h4>
                        <table className="w-full border border-gray-200 rounded-lg shadow text-sm mb-4">
                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="px-4 py-2 border-b">Item</th>
                                    <th className="px-4 py-2 border-b">Specs</th>
                                    <th className="px-4 py-2 border-b">Unit</th>
                                    <th className="px-4 py-2 border-b">Unit Price (₱)</th>
                                    <th className="px-4 py-2 border-b">Quantity</th>
                                    <th className="px-4 py-2 border-b">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.products.length > 0 ? data.products.map((item, index) => (
                                    <tr key={index} className="text-gray-800">
                                        <td className="px-4 py-2 border-b text-center">{item.item}</td>
                                        <td className="px-4 py-2 border-b text-center">{item.specs}</td>
                                        <td className="px-4 py-2 border-b text-center">{item.unit?.unit}</td>
                                        <td className="px-4 py-2 border-b text-center">{Number(item.unit_price).toFixed(2)}</td>
                                        <td className="px-4 py-2 border-b text-center">{item.quantity}</td>
                                        <td className="px-4 py-2 border-b text-center">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newProducts = [...data.products];
                                                    newProducts.splice(index, 1);
                                                    setData("products", newProducts);
                                                }}
                                                className="text-red-600 hover:underline text-sm"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="text-center text-gray-500 py-4">No products added yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                    </div>
                    <ProductModal
                        isOpen={modalOpen}
                        onClose={() => setModalOpen(false)}
                        onConfirm={handleConfirmProduct}
                        product={selectedProduct}
                    />

                    <ProductTable products={products} handleProductSelect={handleProductSelect} />


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
