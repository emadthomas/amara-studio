import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardList,
  ImagePlus,
  User,
  Phone,
  MapPin,
  PackageCheck,
  ChevronRight,
  ChevronLeft,
  Lock,
  Upload,
  Loader2,
  Sparkles,
} from "lucide-react";
import { db, storage } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const SIZES = ["XS", "S", "M", "L", "XL"];
const ADMIN_PASSWORD = "amara2026"; // change this to your own password

// Optional starter catalog — only used if you click "Load demo products"
// in the admin panel on an empty store. Never written automatically.
const DEMO_PRODUCTS = [
  {
    name: "Draped Silk Midi Dress",
    category: "Dresses",
    price: 128,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80&auto=format&fit=crop",
    ],
  },
  {
    name: "Tailored Linen Blazer",
    category: "Outerwear",
    price: 154,
    images: ["https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&q=80&auto=format&fit=crop"],
  },
  {
    name: "Ribbed Knit Top",
    category: "Knitwear",
    price: 62,
    images: ["https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&q=80&auto=format&fit=crop"],
  },
  {
    name: "Wide-Leg Satin Trousers",
    category: "Bottoms",
    price: 96,
    images: ["https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80&auto=format&fit=crop"],
  },
  {
    name: "Wrap Front Blouse",
    category: "Tops",
    price: 74,
    images: ["https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&q=80&auto=format&fit=crop"],
  },
  {
    name: "Pleated Maxi Skirt",
    category: "Skirts",
    price: 88,
    images: ["https://images.unsplash.com/photo-1583496661160-fb5886a13d74?w=800&q=80&auto=format&fit=crop"],
  },
];

function moneyFmt(n) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ---------- Seal badge (signature element) ----------
function SealTag({ children, className = "" }) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-rose-900 text-rose-50 shadow-md ${className}`}
      style={{ boxShadow: "0 0 0 3px rgba(255,255,255,0.9), 0 0 0 4px rgba(136,19,55,0.5)" }}
    >
      <span className="font-serif italic text-[10px] tracking-wide px-3 py-1 text-center leading-tight">
        {children}
      </span>
    </div>
  );
}

// ---------- Product Card ----------
function ProductCard({ product, onAddToCart }) {
  const [size, setSize] = useState("M");
  const [justAdded, setJustAdded] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const images = product.images && product.images.length ? product.images : [""];

  const handleAdd = () => {
    onAddToCart(product, size);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div className="group relative bg-white border border-stone-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
      <div className="absolute top-3 left-3 z-10">
        <SealTag className="w-14 h-14">{product.category}</SealTag>
      </div>

      <div className="relative overflow-hidden aspect-[4/5] bg-stone-100">
        <img
          src={images[imgIndex]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-stone-800 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setImgIndex((i) => (i + 1) % images.length)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-stone-800 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronRight size={14} />
            </button>
            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === imgIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-4 border-t border-stone-100">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-stone-900 text-base leading-snug">{product.name}</h3>
          <span className="font-medium text-rose-900 text-sm shrink-0">${moneyFmt(product.price)}</span>
        </div>

        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1.5">Size</p>
          <div className="flex gap-1.5 flex-wrap">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`w-8 h-8 text-[11px] font-medium rounded-full border transition-all duration-150 ${
                  size === s
                    ? "bg-rose-900 text-rose-50 border-rose-900"
                    : "bg-white text-stone-500 border-stone-300 hover:border-rose-900"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleAdd}
          className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-xs uppercase tracking-widest font-medium transition-all duration-200 ${
            justAdded ? "bg-emerald-700 text-white" : "bg-stone-900 text-white hover:bg-rose-900"
          }`}
        >
          {justAdded ? (<><Check size={14} /> Added</>) : (<><ShoppingBag size={14} /> Add to Bag</>)}
        </button>
      </div>
    </div>
  );
}

// ---------- Cart Drawer ----------
function CartDrawer({ open, onClose, cart, updateQty, removeItem, total, onCheckout }) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-stone-950/50 z-40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-stone-50 z-50 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} />
            <span className="font-serif italic text-sm">Your Bag</span>
          </div>
          <button onClick={onClose} className="hover:text-rose-300 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div
          className="h-3 shrink-0"
          style={{
            backgroundImage: "radial-gradient(circle at 10px 0px, transparent 7px, #fafaf9 8px)",
            backgroundSize: "20px 6px",
            backgroundRepeat: "repeat-x",
            backgroundColor: "#1c1917",
          }}
        />

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-stone-400 gap-2">
              <ShoppingBag size={32} className="opacity-30" />
              <p className="text-xs uppercase tracking-widest">Your bag is empty</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.map((item, i) => (
                <li key={`${item.id}-${item.size}`} className="flex gap-3 border-b border-stone-200 pb-4">
                  <img
                    src={item.images ? item.images[0] : item.image}
                    alt={item.name}
                    className="w-16 h-20 object-cover bg-stone-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <p className="font-serif text-stone-900 truncate">{item.name}</p>
                      <button onClick={() => removeItem(i)} className="text-stone-400 hover:text-red-600 transition-colors shrink-0">
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-0.5">Size {item.size}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-stone-300 rounded-full overflow-hidden">
                        <button onClick={() => updateQty(i, -1)} className="w-7 h-7 flex items-center justify-center hover:bg-stone-200 transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="w-7 text-center text-xs font-medium">{item.qty}</span>
                        <button onClick={() => updateQty(i, 1)} className="w-7 h-7 flex items-center justify-center hover:bg-stone-200 transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="font-medium text-sm text-rose-900">${moneyFmt(item.price * item.qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-stone-200 px-5 py-4 bg-white">
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-xs uppercase tracking-widest text-stone-500">Total</span>
            <span className="font-serif font-bold text-xl text-stone-900">${moneyFmt(total)}</span>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={onCheckout}
            className="w-full py-3 bg-rose-900 text-white uppercase tracking-widest text-xs font-medium hover:bg-stone-900 transition-colors duration-200 disabled:opacity-30 disabled:hover:bg-rose-900 flex items-center justify-center gap-2"
          >
            Checkout <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </>
  );
}

// ---------- Checkout Modal ----------
function CheckoutModal({ open, onClose, total, onSubmit, submitting }) {
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  if (!open) return null;
  const valid = form.name.trim() && form.phone.trim() && form.address.trim();

  return (
    <div className="fixed inset-0 bg-stone-950/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md">
        <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between">
          <span className="font-serif italic text-sm">Shipping Details</span>
          <button onClick={onClose} className="hover:text-rose-300 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-stone-400 mb-1 flex items-center gap-1">
              <User size={11} /> Full Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Sara Ahmed"
              className="w-full border border-stone-300 px-3 py-2.5 text-sm focus:border-rose-900 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-stone-400 mb-1 flex items-center gap-1">
              <Phone size={11} /> Phone Number
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+20 100 000 0000"
              className="w-full border border-stone-300 px-3 py-2.5 text-sm focus:border-rose-900 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-stone-400 mb-1 flex items-center gap-1">
              <MapPin size={11} /> Shipping Address
            </label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Street, City, Governorate"
              rows={3}
              className="w-full border border-stone-300 px-3 py-2.5 text-sm focus:border-rose-900 outline-none transition-colors resize-none"
            />
          </div>

          <div className="flex justify-between items-baseline pt-2 border-t border-stone-200">
            <span className="text-xs uppercase tracking-widest text-stone-500">Total Due</span>
            <span className="font-serif font-bold text-lg">${moneyFmt(total)}</span>
          </div>

          <button
            disabled={!valid || submitting}
            onClick={() => onSubmit(form)}
            className="w-full py-3 bg-rose-900 text-white uppercase tracking-widest text-xs font-medium hover:bg-stone-900 transition-colors duration-200 disabled:opacity-30 flex items-center justify-center gap-2"
          >
            {submitting ? (<><Loader2 size={15} className="animate-spin" /> Placing Order...</>) : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Order Success ----------
function OrderSuccess({ order, onClose }) {
  if (!order) return null;
  return (
    <div className="fixed inset-0 bg-stone-950/70 z-[70] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md overflow-hidden">
        <div className="bg-rose-900 text-white px-6 py-8 flex flex-col items-center text-center">
          <CheckCircle2 size={44} className="mb-3" />
          <h2 className="font-serif text-xl">Order Placed Successfully!</h2>
          <p className="text-xs uppercase tracking-widest opacity-80 mt-1">Order #{order.id}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1 text-sm">
            <p><span className="text-stone-400 text-xs uppercase tracking-widest">Name: </span><span className="font-medium">{order.name}</span></p>
            <p><span className="text-stone-400 text-xs uppercase tracking-widest">Phone: </span><span className="font-medium">{order.phone}</span></p>
            <p><span className="text-stone-400 text-xs uppercase tracking-widest">Address: </span><span className="font-medium">{order.address}</span></p>
          </div>
          <ul className="border-t border-stone-200 pt-3 space-y-1.5">
            {order.items.map((it, i) => (
              <li key={i} className="flex justify-between text-xs text-stone-600">
                <span>{it.qty}x {it.name} ({it.size})</span>
                <span>${moneyFmt(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-baseline border-t border-stone-200 pt-3">
            <span className="text-xs uppercase tracking-widest text-stone-500">Total Paid</span>
            <span className="font-serif font-bold text-lg">${moneyFmt(order.total)}</span>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-stone-900 text-white uppercase tracking-widest text-xs font-medium hover:bg-rose-900 transition-colors duration-200"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Admin Password Gate ----------
function AdminGate({ onUnlock, onCancel }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  const submit = () => {
    if (pw === ADMIN_PASSWORD) {
      onUnlock();
    } else {
      setError(true);
      setPw("");
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-950/70 z-[80] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-900 text-white flex items-center justify-center mx-auto mb-4">
          <Lock size={20} />
        </div>
        <h2 className="font-serif text-lg text-stone-900 mb-1">Admin Access</h2>
        <p className="text-xs text-stone-400 mb-6">Enter the password to manage products and orders.</p>
        <input
          type="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setError(false); }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Password"
          autoFocus
          className={`w-full border px-3 py-2.5 text-sm text-center outline-none transition-colors mb-2 ${
            error ? "border-red-500" : "border-stone-300 focus:border-rose-900"
          }`}
        />
        {error && <p className="text-red-600 text-xs mb-3">Incorrect password. Try again.</p>}
        <button
          onClick={submit}
          className="w-full py-2.5 bg-rose-900 text-white uppercase tracking-widest text-xs font-medium hover:bg-stone-900 transition-colors duration-200 mt-2"
        >
          Unlock
        </button>
        <button
          onClick={onCancel}
          className="w-full py-2 text-stone-400 text-xs uppercase tracking-widest mt-2 hover:text-stone-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------- Admin View ----------
function AdminView({ products, onAddProduct, orders, onToggleOrderStatus, onRemoveOrder, onLock, onLoadDemo }) {
  const [tab, setTab] = useState("orders");
  const [form, setForm] = useState({ name: "", price: "", category: "", imageFiles: [] });
  const [previews, setPreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const fileInputRef = useRef(null);

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setForm((prev) => ({ ...prev, imageFiles: [...prev.imageFiles, ...files] }));
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeImage = (idx) => {
    setForm((prev) => ({ ...prev, imageFiles: prev.imageFiles.filter((_, i) => i !== idx) }));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = async () => {
    if (!form.name.trim() || !form.price || !form.category.trim() || form.imageFiles.length === 0) return;
    setSaving(true);
    try {
      await onAddProduct(form);
      setForm({ name: "", price: "", category: "", imageFiles: [] });
      setPreviews([]);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    } catch (err) {
      alert("Couldn't save the product. Check your Firebase setup in src/firebase.js — see the console for details.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8 border-b border-stone-300 flex-wrap gap-2">
        <div className="flex gap-1">
          <button
            onClick={() => setTab("orders")}
            className={`px-4 py-2.5 text-xs uppercase tracking-widest font-medium flex items-center gap-2 border-b-2 transition-colors ${
              tab === "orders" ? "border-rose-900 text-stone-900" : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            <ClipboardList size={14} /> Orders
            {pendingCount > 0 && (
              <span className="bg-rose-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("add")}
            className={`px-4 py-2.5 text-xs uppercase tracking-widest font-medium flex items-center gap-2 border-b-2 transition-colors ${
              tab === "add" ? "border-rose-900 text-stone-900" : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            <ImagePlus size={14} /> Add Product
          </button>
        </div>
        <button
          onClick={onLock}
          className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-2.5 py-1.5 text-stone-500 hover:text-rose-900 transition-colors mb-2"
        >
          <Lock size={13} /> Lock
        </button>
      </div>

      {tab === "add" && (
        <div className="bg-white border border-stone-200 p-6 max-w-lg">
          <h2 className="font-serif text-lg text-stone-900 mb-1">New Product</h2>
          <p className="text-xs text-stone-400 mb-6">
            Add an item — it's saved to your live database and appears for every visitor immediately.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-stone-400 mb-1 block">Product Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Satin Slip Dress"
                className="w-full border border-stone-300 px-3 py-2.5 text-sm focus:border-rose-900 outline-none transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-stone-400 mb-1 block">Price ($)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="89"
                  className="w-full border border-stone-300 px-3 py-2.5 text-sm focus:border-rose-900 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-stone-400 mb-1 block">Category</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Dresses"
                  className="w-full border border-stone-300 px-3 py-2.5 text-sm focus:border-rose-900 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-stone-400 mb-1 block">Product Photos</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-dashed border-stone-300 py-4 flex flex-col items-center gap-1.5 text-stone-500 hover:border-rose-900 hover:text-rose-900 transition-colors"
              >
                <Upload size={18} />
                <span className="text-xs">Tap to upload photos from your phone</span>
              </button>

              {previews.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {previews.map((img, i) => (
                    <div key={i} className="relative w-16 h-20">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute -top-1.5 -right-1.5 bg-stone-900 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={submit}
              disabled={saving}
              className={`w-full py-3 uppercase tracking-widest text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60 ${
                justAdded ? "bg-emerald-700 text-white" : "bg-stone-900 text-white hover:bg-rose-900"
              }`}
            >
              {saving ? (
                <><Loader2 size={15} className="animate-spin" /> Uploading...</>
              ) : justAdded ? (
                <><Check size={15} /> Added to Catalog</>
              ) : (
                <><Plus size={15} /> Add Product</>
              )}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-stone-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] uppercase tracking-widest text-stone-400">Catalog ({products.length} items)</p>
              {products.length === 0 && (
                <button
                  onClick={onLoadDemo}
                  className="text-[10px] uppercase tracking-widest text-rose-900 hover:text-stone-900 transition-colors flex items-center gap-1"
                >
                  <Sparkles size={12} /> Load demo products
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {products.map((p) => (
                <span key={p.id} className="text-[11px] bg-stone-100 px-2 py-1 border border-stone-200">
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div>
          {orders.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <PackageCheck size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-xs uppercase tracking-widest">No orders yet</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => (
                <li key={order.id} className="bg-white border border-stone-200">
                  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-stone-50 border-b border-stone-200">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-xs uppercase tracking-widest">#{order.displayId}</span>
                      <span
                        className={`text-[10px] font-medium uppercase tracking-widest px-2 py-0.5 ${
                          order.status === "done" ? "bg-emerald-700 text-white" : "bg-rose-900 text-white"
                        }`}
                      >
                        {order.status === "done" ? "Fulfilled" : "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleOrderStatus(order.id, order.status)}
                        className="text-[10px] font-medium uppercase tracking-widest border border-stone-300 px-2.5 py-1 hover:border-rose-900 transition-colors flex items-center gap-1"
                      >
                        <Check size={12} /> {order.status === "done" ? "Mark Pending" : "Mark Done"}
                      </button>
                      <button
                        onClick={() => onRemoveOrder(order.id)}
                        className="text-stone-400 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="px-5 py-4 grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1 text-sm">
                      <p><span className="text-stone-400 text-[10px] uppercase tracking-widest">Name: </span><span className="font-medium">{order.name}</span></p>
                      <p><span className="text-stone-400 text-[10px] uppercase tracking-widest">Phone: </span><span className="font-medium">{order.phone}</span></p>
                      <p><span className="text-stone-400 text-[10px] uppercase tracking-widest">Address: </span><span className="font-medium">{order.address}</span></p>
                    </div>
                    <div>
                      <ul className="space-y-1">
                        {order.items.map((it, i) => (
                          <li key={i} className="flex justify-between text-xs text-stone-600">
                            <span>{it.qty}x {it.name} ({it.size})</span>
                            <span>${moneyFmt(it.price * it.qty)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex justify-between font-medium text-sm mt-2 pt-2 border-t border-stone-200">
                        <span>Total</span>
                        <span>${moneyFmt(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Main App ----------
export default function App() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [view, setView] = useState("store");
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  // Live subscription to the products collection — every visitor sees updates instantly.
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingProducts(false);
        setConnectionError(false);
      },
      (err) => {
        console.error(err);
        setLoadingProducts(false);
        setConnectionError(true);
      }
    );
    return unsub;
  }, []);

  // Live subscription to orders — the admin panel updates in real time too.
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(
        snap.docs.map((d) => ({
          id: d.id,
          displayId: d.id.slice(-5).toUpperCase(),
          ...d.data(),
        }))
      );
    });
    return unsub;
  }, []);

  const addToCart = (product, size) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.id === product.id && i.size === size);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, { ...product, size, qty: 1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (index, delta) => {
    setCart((prev) => {
      const copy = [...prev];
      const newQty = copy[index].qty + delta;
      if (newQty <= 0) return copy.filter((_, i) => i !== index);
      copy[index] = { ...copy[index], qty: newQty };
      return copy;
    });
  };

  const removeItem = (index) => setCart((prev) => prev.filter((_, i) => i !== index));

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  // Upload each photo to Firebase Storage and return their public URLs.
  const uploadImages = async (files) => {
    const urls = [];
    for (const file of files) {
      const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }
    return urls;
  };

  const addProduct = async (form) => {
    const images = await uploadImages(form.imageFiles);
    await addDoc(collection(db, "products"), {
      name: form.name.trim(),
      category: form.category.trim(),
      price: parseFloat(form.price),
      images,
      createdAt: serverTimestamp(),
    });
  };

  const loadDemoProducts = async () => {
    for (const p of DEMO_PRODUCTS) {
      await addDoc(collection(db, "products"), { ...p, createdAt: serverTimestamp() });
    }
  };

  const handleCheckoutSubmit = async (form) => {
    setPlacingOrder(true);
    try {
      const docRef = await addDoc(collection(db, "orders"), {
        ...form,
        items: cart,
        total: cartTotal,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setCompletedOrder({
        id: docRef.id.slice(-5).toUpperCase(),
        ...form,
        items: cart,
        total: cartTotal,
      });
      setCart([]);
      setCheckoutOpen(false);
      setCartOpen(false);
    } catch (err) {
      alert("Couldn't place the order. Please check your connection and try again.");
      console.error(err);
    } finally {
      setPlacingOrder(false);
    }
  };

  const toggleOrderStatus = async (id, currentStatus) => {
    await updateDoc(doc(db, "orders", id), { status: currentStatus === "done" ? "pending" : "done" });
  };

  const removeOrder = async (id) => {
    await deleteDoc(doc(db, "orders", id));
  };

  const goToAdmin = () => {
    if (adminAuthed) {
      setView("admin");
    } else {
      setShowGate(true);
    }
  };

  const lockAdmin = () => {
    setAdminAuthed(false);
    setView("store");
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <header className="sticky top-0 z-30 bg-stone-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-4">
          <button onClick={() => setView("store")} className="font-serif italic text-xl shrink-0">
            Amara <span className="text-rose-400 not-italic">Studio</span>
          </button>

          {view === "store" && (
            <div className="hidden sm:flex items-center flex-1 max-w-xs bg-stone-800 px-3 py-2 gap-2 rounded-full">
              <Search size={15} className="text-stone-500 shrink-0" />
              <input
                placeholder="Search products..."
                className="bg-transparent outline-none text-sm w-full placeholder:text-stone-500"
              />
            </div>
          )}

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => (view === "store" ? goToAdmin() : setView("store"))}
              className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-2.5 py-1.5 border border-stone-700 hover:border-rose-400 transition-colors rounded-full"
            >
              {view === "store" ? <Lock size={13} /> : <ArrowLeft size={14} />}
              <span className="hidden sm:inline">{view === "store" ? "Admin" : "Back to Store"}</span>
            </button>

            {view === "store" && (
              <button onClick={() => setCartOpen(true)} className="relative p-2 hover:text-rose-400 transition-colors">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {connectionError && (
        <div className="bg-amber-100 text-amber-900 text-xs px-4 py-2 text-center">
          Couldn't connect to the database. Make sure you've added your project keys to <code>src/firebase.js</code> and enabled Firestore + Storage in the Firebase console.
        </div>
      )}

      {view === "store" ? (
        <>
          <section className="bg-stone-900 text-white px-4 sm:px-6 pt-14 pb-16 relative overflow-hidden">
            <div className="max-w-6xl mx-auto relative z-10">
              <SealTag className="w-16 h-16 mb-5">New Season</SealTag>
              <h1 className="font-serif italic text-5xl sm:text-7xl leading-[1.05] max-w-2xl">
                Softness,<br />tailored.
              </h1>
              <p className="mt-5 text-stone-400 max-w-md">
                Considered pieces for women who dress with intention — soft fabrics, clean lines, made to be worn often.
              </p>
            </div>
            <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full border border-stone-700" />
            <div className="absolute top-16 right-24 w-20 h-20 rounded-full border border-stone-700 hidden sm:block" />
          </section>

          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="font-serif text-2xl text-stone-900">The Collection</h2>
              <span className="text-xs uppercase tracking-widest text-stone-400">{products.length} items</span>
            </div>

            {loadingProducts ? (
              <div className="py-24 flex flex-col items-center gap-2 text-stone-400">
                <Loader2 size={24} className="animate-spin" />
                <p className="text-xs uppercase tracking-widest">Loading collection...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-24 text-center text-stone-400">
                <p className="text-xs uppercase tracking-widest">No products yet — add some from the Admin panel.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
                ))}
              </div>
            )}
          </main>

          <footer className="bg-stone-900 text-stone-500 mt-8 py-8 px-4 sm:px-6 text-center text-[11px] uppercase tracking-widest">
            Amara Studio — Considered clothing, made to last.
          </footer>
        </>
      ) : (
        <AdminView
          products={products}
          onAddProduct={addProduct}
          orders={orders}
          onToggleOrderStatus={toggleOrderStatus}
          onRemoveOrder={removeOrder}
          onLock={lockAdmin}
          onLoadDemo={loadDemoProducts}
        />
      )}

      {showGate && (
        <AdminGate
          onUnlock={() => {
            setAdminAuthed(true);
            setShowGate(false);
            setView("admin");
          }}
          onCancel={() => setShowGate(false)}
        />
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        updateQty={updateQty}
        removeItem={removeItem}
        total={cartTotal}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        total={cartTotal}
        onSubmit={handleCheckoutSubmit}
        submitting={placingOrder}
      />

      <OrderSuccess order={completedOrder} onClose={() => setCompletedOrder(null)} />
    </div>
  );
}
