import { useState } from "react";
import { Dialog } from "@headlessui/react";
export default function NewProductModal({ isOpen, onClose, onAdd, units = [], categories = [] }) {
    const [formData, setFormData] = useState({
        name: "",
        specs: "",
        unit_id: "",
        category_id: "",
        default_price: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.unit_id || !formData.category_id) {
            alert("Please fill in all required fields.");
            return;
        }

        onAdd(formData); // send data back to parent
        setFormData({ name: "", specs: "", unit_id: "", category_id: "", default_price: "" });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg">
                <h2 className="text-lg font-bold mb-4">Add New Product</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Product Name */}
                    <div>
                        <label className="block text-sm font-medium">Product Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2"
                            required
                        />
                    </div>

                    {/* Specs */}
                    <div>
                        <label className="block text-sm font-medium">Specifications</label>
                        <textarea
                            name="specs"
                            value={formData.specs}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>

                    {/* Unit */}
                    <div>
                        <label className="block text-sm font-medium">Unit</label>
                        <select
                            name="unit_id"
                            value={formData.unit_id}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2"
                            required
                        >
                            <option value="">Select Unit</option>
                            {units.map((unit) => (
                                <option key={unit.id} value={unit.id}>
                                    {unit.unit}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium">Category</label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2"
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Default Price */}
                    <div>
                        <label className="block text-sm font-medium">Default Price</label>
                        <input
                            type="number"
                            step="0.01"
                            name="default_price"
                            value={formData.default_price}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Save Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}