// src/pages/admin/AdminProductForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiUpload, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productAPI, uploadAPI } from '../../services/api';
import { PageLoader } from '../../components/common/index';

const CATEGORIES = ['T-Shirts','Shirts','Jeans','Hoodies','Jackets','Jerseys','Shorts','Traditional Wear','Footwear','Accessories'];
const SIZES      = ['XS','S','M','L','XL','XXL','3XL','6','7','8','9','10','11','12','Free Size'];

const EMPTY_FORM = {
  name: '', description: '', price: '', discountPrice: '',
  category: 'T-Shirts', sizes: [], stock: '', brand: '',
  images: [], isFeatured: false, tags: '',
};

export default function AdminProductForm() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const isEditing = !!id;

  const [form, setForm]           = useState(EMPTY_FORM);
  const [loading, setLoading]     = useState(isEditing);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load product data if editing
  useEffect(() => {
    if (!isEditing) return;
    productAPI.getById(id)
      .then(({ data }) => {
        const p = data.product;
        setForm({
          name: p.name, description: p.description, price: p.price,
          discountPrice: p.discountPrice || '', category: p.category,
          sizes: p.sizes, stock: p.stock, brand: p.brand || '',
          images: p.images || [], isFeatured: p.isFeatured,
          tags: p.tags?.join(', ') || '',
        });
      })
      .catch(() => toast.error('Failed to load product'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleSize = (size) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (form.images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('images', f));
      const { data } = await uploadAPI.images(fd);
      setForm((prev) => ({ ...prev, images: [...prev.images, ...data.imageUrls] }));
      toast.success(`${files.length} image(s) uploaded`);
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sizes.length) return toast.error('Select at least one size');
    if (!form.images.length) return toast.error('Upload at least one image');

    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discountPrice: Number(form.discountPrice) || 0,
        stock: Number(form.stock),
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };

      if (isEditing) {
        await productAPI.update(id, payload);
        toast.success('Product updated successfully');
      } else {
        await productAPI.create(payload);
        toast.success('Product created successfully');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/products" className="p-2 text-gray-400 hover:text-white border border-white/10 rounded-lg transition-colors">
          <FiArrowLeft size={18} />
        </Link>
        <h1 className="font-display text-2xl font-bold text-white">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-white">Basic Information</h2>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Product Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Oversized Graphic Tee" className="input" />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={4} placeholder="Detailed product description..." className="input resize-none" />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className="input">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Brand</label>
              <input name="brand" value={form.brand} onChange={handleChange} placeholder="Brand name" className="input" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Tags (comma-separated)</label>
            <input name="tags" value={form.tags} onChange={handleChange} placeholder="streetwear, casual, summer" className="input" />
          </div>
        </div>

        {/* Pricing */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-white">Pricing & Stock</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Price (₹) *</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" placeholder="999" className="input" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Discount Price (₹)</label>
              <input type="number" name="discountPrice" value={form.discountPrice} onChange={handleChange} min="0" placeholder="0 = no discount" className="input" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Stock *</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange} required min="0" placeholder="50" className="input" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="isFeatured" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="w-4 h-4 accent-primary-500 cursor-pointer" />
            <label htmlFor="isFeatured" className="text-sm text-gray-300 cursor-pointer">Feature this product on homepage</label>
          </div>
        </div>

        {/* Sizes */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4">Available Sizes *</h2>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`tag ${form.sizes.includes(size) ? 'tag-active' : 'tag-inactive'}`}
              >
                {size}
              </button>
            ))}
          </div>
          {form.sizes.length > 0 && (
            <p className="text-xs text-gray-600 mt-3">Selected: {form.sizes.join(', ')}</p>
          )}
        </div>

        {/* Images */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4">Product Images * <span className="text-xs text-gray-600 font-normal">(max 5, JPEG/PNG/WebP, 5MB each)</span></h2>

          {/* Image previews */}
          {form.images.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {form.images.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10 group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <FiX size={12} />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-0.5">Main</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {form.images.length < 5 && (
            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/15 rounded-xl cursor-pointer hover:border-primary-500/50 hover:bg-primary-500/5 transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <FiUpload size={22} className="text-gray-500 mb-2" />
              <p className="text-sm text-gray-500">
                {uploading ? 'Uploading...' : 'Click to upload images'}
              </p>
              <p className="text-xs text-gray-700 mt-1">{form.images.length}/5 uploaded</p>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <Link to="/admin/products" className="btn-ghost flex-1 text-center py-3 border border-white/10 rounded-lg">
            Cancel
          </Link>
          <button type="submit" disabled={saving || uploading} className="btn-primary flex-1 py-3">
            {saving ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
