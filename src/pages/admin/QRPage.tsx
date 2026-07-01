import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { QrCode, Link, Save, Copy, Check, Trash2, ImagePlus, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { getAllSettings, updateSetting } from '../../services/settings';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { usePageTitle } from '../../hooks/usePageTitle';

const schema = z.object({
  upi_id: z.string().min(5, 'UPI ID required').regex(/^[\w.-]+@[\w]+$/, 'Invalid UPI ID format'),
  upi_qr_url: z.string().url('Valid URL required').or(z.literal('')),
  delivery_fee: z.coerce.number().min(0, 'Fee must be 0 or more'),
  gst_percent: z.coerce.number().min(0).max(100, 'GST must be 0-100%'),
  min_order_amount: z.coerce.number().min(0),
  delivery_lat: z.coerce.number().min(-90).max(90, 'Invalid latitude'),
  delivery_lng: z.coerce.number().min(-180).max(180, 'Invalid longitude'),
  delivery_radius_km: z.coerce.number().min(0.1, 'Radius must be at least 0.1 km'),
});
type FormData = z.infer<typeof schema>;

export default function QRPage() {
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({ queryKey: ['settings'], queryFn: getAllSettings });

  // Default QR image path
  const defaultQrImage = "/images/WhatsApp Image 2026-06-30 at 2.07.38 PM.jpeg";

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: {
      upi_id: settings?.upi_id ?? '',
      upi_qr_url: settings?.upi_qr_url ?? defaultQrImage,
      delivery_fee: Number(settings?.delivery_fee ?? 40),
      gst_percent: Number(settings?.gst_percent ?? 0),
      min_order_amount: Number(settings?.min_order_amount ?? 0),
      delivery_lat: Number(settings?.delivery_lat ?? 28.984),
      delivery_lng: Number(settings?.delivery_lng ?? 77.706),
      delivery_radius_km: Number(settings?.delivery_radius_km ?? 5),
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { key: string; value: string }) => {
      return updateSetting(data.key, data.value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved');
    },
    onError: () => toast.error('Failed to save'),
  });

  async function onSubmit(data: FormData) {
    await Promise.all([
      saveMutation.mutateAsync({ key: 'upi_id', value: data.upi_id }),
      saveMutation.mutateAsync({ key: 'upi_qr_url', value: data.upi_qr_url }),
      saveMutation.mutateAsync({ key: 'delivery_fee', value: String(data.delivery_fee) }),
      saveMutation.mutateAsync({ key: 'gst_percent', value: String(data.gst_percent) }),
      saveMutation.mutateAsync({ key: 'min_order_amount', value: String(data.min_order_amount) }),
      saveMutation.mutateAsync({ key: 'delivery_lat', value: String(data.delivery_lat) }),
      saveMutation.mutateAsync({ key: 'delivery_lng', value: String(data.delivery_lng) }),
      saveMutation.mutateAsync({ key: 'delivery_radius_km', value: String(data.delivery_radius_km) }),
    ]);
  }

  async function handleCopyUpi() {
    const upiId = settings?.upi_id ?? '';
    await navigator.clipboard.writeText(upiId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleFileUpload(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPEG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `qr-${Date.now()}.${ext}`;
      const filePath = `qrs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('qrs')
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('qrs').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      await saveMutation.mutateAsync({ key: 'upi_qr_url', value: publicUrl });
      setValue('upi_qr_url', publicUrl);
      toast.success('QR code uploaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload QR code. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }

  async function handleRemoveQR() {
    await saveMutation.mutateAsync({ key: 'upi_qr_url', value: '' });
    setValue('upi_qr_url', '');
    toast.success('QR code removed');
  }

  async function handleUseDefaultQR() {
    await saveMutation.mutateAsync({ key: 'upi_qr_url', value: defaultQrImage });
    setValue('upi_qr_url', defaultQrImage);
    toast.success('Default QR code set');
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-playfair text-3xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-3">
          <QrCode size={32} className="text-amber-600" /> QR & Payment Settings
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Configure UPI payment details and order fees.</p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-100 dark:border-stone-800"
          >
            <h2 className="font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
              <QrCode size={18} className="text-amber-600" /> QR Code Management
            </h2>

            <div className="space-y-4">
              {/* Upload Area */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-stone-200 dark:border-stone-700 hover:border-amber-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600 border-t-transparent" />
                    <p className="text-sm text-stone-500">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center">
                      <ImagePlus size={24} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                        Drop QR code here or click to upload
                      </p>
                      <p className="text-xs text-stone-400 mt-1">PNG, JPEG, WebP (max 5MB)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Preview */}
              <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-4 border border-stone-100 dark:border-stone-700">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide font-semibold">Preview</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleUseDefaultQR}
                      className="text-xs text-brand-primary hover:text-orange-600 flex items-center gap-1 transition-colors"
                    >
                      <ImagePlus size={12} /> Use Default QR
                    </button>
                    {settings?.upi_qr_url && (
                      <button
                        type="button"
                        onClick={handleRemoveQR}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                  </div>
                </div>
                {settings?.upi_qr_url ? (
                  <div className="flex justify-center">
                    <img
                      src={settings.upi_qr_url}
                      alt="UPI QR Code"
                      className="w-48 h-48 object-contain rounded-xl bg-white dark:bg-stone-900 p-2 shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 mx-auto bg-white dark:bg-stone-900 rounded-xl flex flex-col items-center justify-center gap-2 shadow-inner border border-stone-200 dark:border-stone-700">
                    <QrCode size={48} className="text-stone-300 dark:text-stone-600" />
                    <p className="text-xs text-stone-400 text-center">No QR uploaded yet</p>
                  </div>
                )}
              </div>

              {/* UPI ID Input */}
              <Input
                label="UPI ID"
                leftIcon={<Link size={15} />}
                error={errors.upi_id?.message}
                {...register('upi_id')}
                placeholder="your-upi@bank"
              />

              {/* Manual URL Input (fallback) */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  QR Code Image URL
                </label>
                <input
                  type="text"
                  {...register('upi_qr_url')}
                  placeholder="https://your-storage.com/qr.png"
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-500 transition-colors"
                />
                {errors.upi_qr_url && <p className="mt-1 text-xs text-red-500">{errors.upi_qr_url.message}</p>}
                <p className="text-xs text-stone-400 mt-1">
                  This auto-fills when you upload an image above, or paste a URL directly.
                </p>
              </div>

              {/* Current UPI Info */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Current UPI ID</p>
                    <p className="text-sm text-amber-700 dark:text-amber-400 font-mono">{settings?.upi_id ?? 'Not set'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    disabled={!settings?.upi_id}
                    className="text-stone-400 hover:text-amber-600 transition-colors disabled:opacity-50"
                  >
                    {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-100 dark:border-stone-800"
          >
            <h2 className="font-semibold text-stone-900 dark:text-stone-100 mb-4">Order & Fee Settings</h2>

            <div className="space-y-4">
              <Input label="Delivery Fee (₹)" type="number" step="1" error={errors.delivery_fee?.message} {...register('delivery_fee')} />
              <Input label="GST Percentage (%)" type="number" step="0.1" error={errors.gst_percent?.message} {...register('gst_percent')} />
              <Input label="Minimum Order Amount (₹)" type="number" {...register('min_order_amount')} />

              <div className="border-t border-stone-200 dark:border-stone-700 pt-4 mt-4">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                  <MapPin size={16} className="text-amber-600" /> Delivery Area
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Restaurant Latitude" type="number" step="any" error={errors.delivery_lat?.message} {...register('delivery_lat')} />
                  <Input label="Restaurant Longitude" type="number" step="any" error={errors.delivery_lng?.message} {...register('delivery_lng')} />
                </div>
                <Input label="Delivery Radius (km)" type="number" step="0.1" error={errors.delivery_radius_km?.message} {...register('delivery_radius_km')} />
              </div>

              <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-4 mt-4">
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-3">Current Calculation Example</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-600 dark:text-stone-400">Subtotal</span>
                    <span className="text-stone-900 dark:text-stone-100">₹500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600 dark:text-stone-400">Delivery Fee</span>
                    <span className="text-stone-900 dark:text-stone-100">₹{settings?.delivery_fee ?? 40}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600 dark:text-stone-400">GST ({settings?.gst_percent ?? 0}%)</span>
                    <span className="text-stone-900 dark:text-stone-100">₹{Math.round(500 * (Number(settings?.gst_percent ?? 0) / 100))}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-stone-200 dark:border-stone-700">
                    <span className="text-stone-900 dark:text-stone-100">Total</span>
                    <span className="text-amber-600 dark:text-amber-400">₹{500 + Number(settings?.delivery_fee ?? 40) + Math.round(500 * (Number(settings?.gst_percent ?? 0) / 100))}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button type="submit" isLoading={isSubmitting} disabled={!isDirty} leftIcon={<Save size={16} />} size="lg" className="w-full">
                Save Settings
              </Button>
            </div>
          </motion.div>
        </div>
      </form>
    </div>
  );
}
