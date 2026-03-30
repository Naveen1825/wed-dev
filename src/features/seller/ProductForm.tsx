import React, { useState } from 'react';
import { FiX, FiCheck, FiUpload, FiTrash2 } from 'react-icons/fi';
import { ProductService } from '@/services/api/ProductService';
import { uploadToCloudinary } from '@/services/cloudinary';
import { Input } from '@/components/ui/Input';


interface ProductFormProps {
  onClose: () => void;
  onSuccess: () => void;
  sellerId: string;
}

/**
 * Pet Listing Submission Workspace.
 * Orchestrates product entry, media management via Cloudinary, and platform synchronization.
 * Categorized and structured based on platform data-schema specifications.
 */
export const ProductForm: React.FC<ProductFormProps> = ({ onClose, onSuccess, sellerId }) => {
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    productType: 'Pets',
    productCategory: 'Dog',
    customCategory: '',
    productSubCategory: '',
    customSubCategory: '',
    productPrice: 0,
    productDob: '',
    productGender: 'Male',
    productDescription: '',
    productVaccinated: false,
    productIsPair: false,
    productImages: [] as string[],
    productVideo: '' as string
  });

  const categoryOptions: Record<string, string[]> = {
    Dog: ['Golden Retriever', 'German Shepherd', 'Labrador', 'Poodle', 'Husky', 'Other'],
    Cat: ['Persian', 'Siamese', 'Maine Coon', 'Bengal', 'Ragdoll', 'Other'],
    Bird: ['Parrot', 'Canary', 'Cockatiel', 'Lovebird', 'Finch', 'Other'],
    Fish: ['Goldfish', 'Betta', 'Guppy', 'Angelfish', 'Tetra', 'Other'],
    'Small Pets': ['Hamster', 'Guinea Pig', 'Rabbit', 'Ferret', 'Gerbil', 'Other'],
    Other: ['Other']
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: finalValue };
      // Reset sub-category if category changes
      if (name === 'productCategory') {
        updated.productSubCategory = '';
        updated.customSubCategory = '';
      }
      return updated;
    });
  };

  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }
    
    if (years === 0) return `${months} Months`;
    return `${years} Years ${months} Months`;
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
     const files = e.target.files;
     if (!files || files.length === 0) return;

     if (type === 'image' && (formData.productImages.length + files.length) > 4) {
        setError('Registry Constraint: A maximum of 4 photographic records is permitted.');
        return;
     }
     if (type === 'video' && files.length > 1) {
        setError('Registry Constraint: Only a single cinematic record (video) is permitted.');
        return;
     }

     setImageLoading(true);
     setError('');
     try {
        const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file));
        const urls = await Promise.all(uploadPromises);
        
        if (type === 'image') {
           setFormData(prev => ({ ...prev, productImages: [...prev.productImages, ...urls].slice(0, 4) }));
        } else {
           setFormData(prev => ({ ...prev, productVideo: urls[0] }));
        }
     } catch (err: any) {
        setError('Media synchronization failed: ' + err.message);
     } finally {
        setImageLoading(false);
     }
  };

  const removeImage = (index: number) => {
     setFormData(prev => ({
        ...prev,
        productImages: prev.productImages.filter((_, i) => i !== index)
     }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation Logic: Enforces strict schema requirements for marketplace integrity
    const errors = [];
    if (formData.productImages.length < 4) errors.push('Minimum requirements unmet: 4 images are mandatory.');
    if (!formData.productVideo) errors.push('Minimum requirements unmet: 1 video record is mandatory.');
    if (formData.productCategory === 'Other' && !formData.customCategory) errors.push('Identity error: Species specification required.');
    
    // Strict breed (sub-category) validation
    const subCatValue = formData.productSubCategory === 'Other' ? formData.customSubCategory : formData.productSubCategory;
    if (!subCatValue || subCatValue.trim() === '') {
      errors.push('Registry Constraint: Genetic Breed (Sub-category) cannot be empty.');
    }

    if (!formData.productDob) errors.push('Chronological error: Date of birth is mandatory.');
    if (formData.productPrice <= 0) errors.push('Valuation error: Market Price must be greater than 0.');

    if (errors.length > 0) {
       setError(errors.join(' '));
       return;
    }

    setLoading(true);
    setError('');
    
    try {
      const finalProductData = {
        productType: formData.productType, // Pets, Accessories, Toys
        productCategory: formData.productCategory === 'Other' ? formData.customCategory : formData.productCategory,
        productSubCategory: subCatValue,
        productPrice: formData.productPrice,
        productAge: calculateAge(formData.productDob),
        productGender: formData.productGender,
        productDescription: formData.productDescription,
        productVaccinated: formData.productVaccinated,
        productIsPair: formData.productIsPair,
        productMedia: [...formData.productImages, formData.productVideo],
      };

      console.log('[Product Export] Dispatching to Firestore:', {
        sellerId,
        payload: finalProductData
      });

      await ProductService.createProduct(sellerId, finalProductData as any);
      
      console.log('[Product Export] Inventory successfully synchronized.');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('[Product Export] Synchronization Failure:', err);
      setError('Platform Registry Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '4px', height: '16px', background: '#2563eb', borderRadius: '2px' }}></div>
      <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{children}</span>
    </div>
  );

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="modal-container" style={{ background: '#fff', width: '100%', maxWidth: '750px', maxHeight: '95vh', overflowY: 'auto', borderRadius: '32px', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)', position: 'relative' }}>
        
        {/* Header */}
        <div style={{ padding: '32px 40px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
           <div>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Establish Marketplace Presence</h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0', fontWeight: 500 }}>Create a high-fidelity listing for administrative approval.</p>
           </div>
           <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: '44px', height: '44px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'} onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}><FiX size={22}/></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
           
           <SectionTitle>Identity & Biological Mapping</SectionTitle>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
              <div>
                 <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Market Segment</label>
                 <select name="productType" value={formData.productType} onChange={handleInputChange} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 700, color: '#1e293b', background: '#fcfdfe' }}>
                    <option value="Pets">Pets</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Toys">Toys</option>
                 </select>
              </div>
              <div>
                 <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Species Segment</label>
                 <select name="productCategory" value={formData.productCategory} onChange={handleInputChange} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 700, color: '#1e293b', background: '#fcfdfe' }}>
                    <option value="Dog">Dogs</option>
                    <option value="Cat">Cats</option>
                    <option value="Bird">Birds</option>
                    <option value="Fish">Fish</option>
                    <option value="Small Pets">Small Pets</option>
                    <option value="Other">Other / Custom</option>
                 </select>
                 {formData.productCategory === 'Other' && (
                   <input type="text" name="customCategory" value={formData.customCategory} onChange={handleInputChange} placeholder="Enter Species..." style={{ width: '100%', marginTop: '12px', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                 )}
              </div>
              <div>
                 <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Genetic Breed</label>
                 <select name="productSubCategory" value={formData.productSubCategory} onChange={handleInputChange} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 700, color: '#1e293b', background: '#fcfdfe' }}>
                    <option value="">Select Breed</option>
                    {(categoryOptions[formData.productCategory] || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                 </select>
                 {formData.productSubCategory === 'Other' && (
                   <input type="text" name="customSubCategory" value={formData.customSubCategory} onChange={handleInputChange} placeholder="Enter Breed..." style={{ width: '100%', marginTop: '12px', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                 )}
              </div>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '40px' }}>
              <div>
                 <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Date of Birth (Registry)</label>
                 <input 
                    type="date" 
                    name="productDob" 
                    value={formData.productDob} 
                    onChange={handleInputChange} 
                    max={new Date().toISOString().split('T')[0]}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 700, color: '#1e293b' }} 
                 />
                 {formData.productDob && <div style={{ marginTop: '6px', fontSize: '12px', color: '#2563eb', fontWeight: 700 }}>Calculated Age: {calculateAge(formData.productDob)}</div>}
              </div>
              <div>
                 <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Biological Gender</label>
                 <div style={{ display: 'flex', gap: '12px' }}>
                    {['Male', 'Female'].map(g => (
                      <button key={g} type="button" onClick={() => setFormData(p => ({ ...p, productGender: g }))} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid', borderColor: formData.productGender === g ? '#2563eb' : '#e2e8f0', background: formData.productGender === g ? '#eff6ff' : '#fff', color: formData.productGender === g ? '#2563eb' : '#475569', fontWeight: 700, cursor: 'pointer' }}>{g}</button>
                    ))}
                 </div>
              </div>
           </div>

           <SectionTitle>Market Values & Specifications</SectionTitle>
           <div style={{ marginBottom: '32px' }}>
              <Input label="Market Valuation (₹) *" type="number" name="productPrice" value={formData.productPrice.toString()} onChange={(e) => setFormData(prev => ({ ...prev, productPrice: Number(e.target.value) }))} />
           </div>

           <div style={{ marginBottom: '32px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Detailed Listing Description *</label>
              <textarea 
                 name="productDescription" 
                 value={formData.productDescription} 
                 onChange={handleInputChange} 
                 rows={4} 
                 style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '15px', fontWeight: 500, lineHeight: '1.6', background: '#fcfdfe' }}
                 placeholder="Contextualize the pet heritage, temperament, and health status..."
              />
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '40px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#f8fafc', borderRadius: '14px', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                 <input type="checkbox" name="productVaccinated" checked={formData.productVaccinated} onChange={handleInputChange} style={{ width: '20px', height: '20px', accentColor: '#2563eb' }} />
                 <span style={{ fontSize: '13px', fontWeight: 700 }}>Verified Immunization</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#f8fafc', borderRadius: '14px', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                 <input type="checkbox" name="productIsPair" checked={formData.productIsPair} onChange={handleInputChange} style={{ width: '20px', height: '20px', accentColor: '#2563eb' }} />
                 <span style={{ fontSize: '13px', fontWeight: 700 }}>Bonded Identity (Pair)</span>
              </label>
           </div>

           <SectionTitle>Evidence Portfolio (4 Images, 1 Video)</SectionTitle>
           <div style={{ marginBottom: '40px' }}>
              {/* Image Grid */}
              <div style={{ marginBottom: '24px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569' }}>PHOTOGRAPHIC RECORDS</span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: formData.productImages.length === 4 ? '#10b981' : '#f59e0b' }}>{formData.productImages.length} / 4 REQUIRED</span>
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {formData.productImages.map((url, i) => (
                       <div key={i} style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', border: '2px solid #f1f5f9' }}>
                          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: '6px', right: '6px', background: '#fff', color: '#dc2626', border: 'none', borderRadius: '10px', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}><FiTrash2 size={14}/></button>
                       </div>
                    ))}
                    {formData.productImages.length < 4 && (
                       <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', aspectRatio: '1/1', border: '2px dashed #cbd5e1', borderRadius: '16px', cursor: imageLoading ? 'not-allowed' : 'pointer', background: '#f8fafc', transition: 'all 0.2s' }}>
                          <input type="file" multiple onChange={(e) => handleMediaUpload(e, 'image')} accept="image/*" style={{ display: 'none' }} disabled={imageLoading} />
                          <FiUpload size={24} color="#64748b" />
                       </label>
                    )}
                 </div>
              </div>

              {/* Video Record */}
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569' }}>CINEMATIC EVIDENCE</span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: formData.productVideo ? '#10b981' : '#f59e0b' }}>{formData.productVideo ? 1 : 0} / 1 REQUIRED</span>
                 </div>
                 {formData.productVideo ? (
                    <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '16px', overflow: 'hidden', background: '#000' }}>
                       <video src={formData.productVideo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} controls />
                       <button type="button" onClick={() => setFormData(p => ({ ...p, productVideo: '' }))} style={{ position: 'absolute', top: '10px', right: '10px', background: '#fff', color: '#dc2626', border: 'none', borderRadius: '10px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiTrash2 size={16}/></button>
                    </div>
                 ) : (
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '160px', border: '2px dashed #cbd5e1', borderRadius: '16px', cursor: imageLoading ? 'not-allowed' : 'pointer', background: '#f8fafc' }}>
                       <input type="file" onChange={(e) => handleMediaUpload(e, 'video')} accept="video/*" style={{ display: 'none' }} disabled={imageLoading} />
                       <FiUpload size={24} color="#64748b" />
                       <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginTop: '12px' }}>UPLOAD MANDATORY VIDEO</span>
                    </label>
                 )}
              </div>
           </div>

           {error && <div style={{ marginBottom: '32px', padding: '16px 20px', background: '#fef2f2', color: '#991b1b', borderRadius: '14px', fontSize: '14px', fontWeight: 700, border: '1px solid #fee2e2', animation: 'shake 0.4s ease' }}>{error}</div>}

           <div style={{ display: 'flex', gap: '16px', position: 'sticky', bottom: '-40px', background: '#fff', padding: '24px 0', borderTop: '1px solid #f1f5f9', marginTop: '20px' }}>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: '16px', background: '#f1f5f9', color: '#475569', borderRadius: '16px', border: 'none', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>Discard Listing</button>
              <button type="submit" disabled={loading || imageLoading} style={{ flex: 2, padding: '16px', background: '#2563eb', color: '#fff', borderRadius: '16px', border: 'none', fontWeight: 800, cursor: (loading || imageLoading) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}>
                 {loading ? 'Initializing Verification...' : <><FiCheck size={22} /> Commit Official Listing</>}
              </button>
           </div>
        </form>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
      `}</style>
    </div>
  );
};
