import RequesterLayout from "@/Layouts/RequesterLayout";
import { useForm } from "@inertiajs/react";

export default function AddDetails({ prId, products, pr_number, prDetails }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        pr_number: pr_number, // string like "PR-25-05-001"
        product_id: "",
        item: "",
        specs: "",
        unit: "",
        unit_price: "",
        quantity: "",
    });

    // Update form data when a product is selected
    const handleProductSelect = (productId) => {
        if (!productId) {
            setData({
                ...data,
                product_id: "",
                item: "",
                specs: "",
                unit: "",
                unit_price: "",
            });
            return;
        }

        const selected = products.find((p) => p.id == productId);
        if (selected) {
            setData({
                ...data,
                product_id: selected.id,
                item: selected.name,
                specs: selected.specs,
                unit: selected.unit?.unit || "",
                unit_price: selected.default_price || "",
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("requester.store_details", prId), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <RequesterLayout
            header={"Schools Division Office - Ilagan | Add Details"}
        >
            <div className="max-w-7xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">
                    Purchase Request Details — <span className="text-blue-600">{pr_number}</span>
                </h2>

                {/* Current Items Table */}
                <div className="overflow-x-auto mb-10">
                    <table className="w-full min-w-[700px] table-auto border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-5 py-3 font-medium border-b border-gray-300">Item</th>
                                <th className="px-5 py-3 font-medium border-b border-gray-300">Specs</th>
                                <th className="px-5 py-3 font-medium border-b border-gray-300">Unit</th>
                                <th className="px-5 py-3 font-medium border-b border-gray-300 text-right">Quantity</th>
                                <th className="px-5 py-3 font-medium border-b border-gray-300 text-right">Unit Price (₱)</th>
                                <th className="px-5 py-3 font-medium border-b border-gray-300 text-right">Total Price (₱)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prDetails.length > 0 ? (
                                prDetails.map((detail) => (
                                    <tr key={detail.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-3 border-b border-gray-200">{detail.item}</td>
                                        <td className="px-5 py-3 border-b border-gray-200">{detail.specs}</td>
                                        <td className="px-5 py-3 border-b border-gray-200">{detail.unit}</td>
                                        <td className="px-5 py-3 border-b border-gray-200 text-right">{detail.quantity}</td>
                                        <td className="px-5 py-3 border-b border-gray-200 text-right">
                                            {Number(detail.unit_price).toFixed(2)}
                                        </td>
                                        <td className="px-5 py-3 border-b border-gray-200 text-right">
                                            {(Number(detail.unit_price) * detail.quantity).toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-6 text-gray-500">
                                        No items added yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Form Title */}
                <h3 className="text-2xl font-semibold mb-4 text-center">
                    Add Item to PR <span className="text-blue-600">{pr_number}</span>
                </h3>

                {/* Add Item Form */}
                <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
                    {/* Product Select */}
                    <div>
                        <label htmlFor="product_id" className="block mb-2 font-medium text-gray-700">
                            Select Product
                        </label>
                        <select
                            id="product_id"
                            value={data.product_id}
                            onChange={(e) => handleProductSelect(e.target.value)}
                            className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.product_id ? "border-red-500" : "border-gray-300"
                            }`}
                        >
                            <option value="">Choose a product</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                        {errors.product_id && <p className="text-red-500 mt-1 text-sm">{errors.product_id}</p>}
                    </div>

                    {/* Product Details Table */}
                    <table className="w-full table-auto border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-4 py-2 font-medium border-b border-gray-300">Item</th>
                                <th className="px-4 py-2 font-medium border-b border-gray-300">Specifications</th>
                                <th className="px-4 py-2 font-medium border-b border-gray-300">Unit</th>
                                <th className="px-4 py-2 font-medium border-b border-gray-300">Unit Price (₱)</th>
                                <th className="px-4 py-2 font-medium border-b border-gray-300">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="text-gray-800">
                                <td className="px-4 py-2 border-b border-gray-200">{data.item || "-"}</td>
                                <td className="px-4 py-2 border-b border-gray-200">{data.specs || "-"}</td>
                                <td className="px-4 py-2 border-b border-gray-200">{data.unit || "-"}</td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    {data.unit_price ? Number(data.unit_price).toFixed(2) : "-"}
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.quantity}
                                        onChange={(e) => setData("quantity", e.target.value)}
                                        className={`w-20 border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.quantity ? "border-red-500" : "border-gray-300"
                                        }`}
                                    />
                                    {errors.quantity && <p className="text-red-500 mt-1 text-sm">{errors.quantity}</p>}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Submit Button */}
                    <div className="text-center">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl transition"
                        >
                            {processing ? "Adding..." : "Add to PR"}
                        </button>
                    </div>
                </form>
            </div>
        </RequesterLayout>
    );
}
