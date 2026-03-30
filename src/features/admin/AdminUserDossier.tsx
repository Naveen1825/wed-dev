import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSearchData } from '@/hooks/useSearchData';
import { Loading } from '@/components/common/Loading';
import { Badge } from '@/components/ui/Badge';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiEye, FiFileText, FiX, FiPhone } from 'react-icons/fi';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase/config';

/**
 * Dedicated Admin Dossier & KYC Verification Endpoint.
 */
const AdminUserDossier: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { users, sellers, buyers, loading } = useSearchData();
  const [activeMedia, setActiveMedia] = React.useState<string | null>(null);

  if (loading) return <Loading fullScreen={false} />;

  const user = users.find(u => u.uid === id);
  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Identity Record Not Found</h2>
        <button onClick={() => navigate('/admin/users')} className="button-base button-outline" style={{ marginTop: '20px' }}>Return to Directory</button>
      </div>
    );
  }

  const linkedSeller = sellers.find(s => s.sellerId === user.uid);
  const linkedBuyer = buyers.find(b => b.buyerId === user.uid);
  const contactPhone = linkedSeller?.sellerNumber || linkedBuyer?.phone || 'Not Shared';

  const handleApproval = async (approve: boolean) => {
    if (!linkedSeller) return;
    const actionText = approve ? 'verify and approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${actionText} storefront ${linkedSeller.shopName || 'Unknown Store'}?`)) return;
    
    try {
      const sellerRef = doc(db, 'sellers', linkedSeller.sellerId);
      await updateDoc(sellerRef, { status: approve ? 'verified' : 'rejected' });
      alert(`Seller store has been successfully ${approve ? 'verified' : 'rejected'}.`);
    } catch (error) {
      console.error(`Error attempting to ${actionText} merchant:`, error);
      alert(`Governance Pipeline Failed: Unable to ${actionText} store. Check permissions.`);
    }
  };

    const isPdf = (url: string) => url?.startsWith('data:application/pdf') || url?.toLowerCase().endsWith('.pdf') || url?.includes('/v1/pdf/');

    return (
    <div className="admin-dashboard-content" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: 0, marginBottom: '32px', fontWeight: 600, fontSize: '14px' }}
      >
        <FiArrowLeft /> Back to Directory
      </button>

      <div style={{ backgroundColor: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        
        {/* Profile Header */}
        <div style={{ padding: '40px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '32px', background: 'linear-gradient(to right, #ffffff, #f8fafc)' }}>
           <div style={{ position: 'relative' }}>
              <img src={user.photoURL || 'https://www.w3schools.com/howto/img_avatar.png'} alt="" style={{ width: '120px', height: '120px', borderRadius: '32px', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', width: '24px', height: '24px', background: '#10b981', border: '3px solid #fff', borderRadius: '50%' }} />
           </div>
           <div>
              <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.025em' }}>{user.displayName}</h1>
              <p style={{ color: '#64748b', margin: '0 0 16px 0', fontSize: '18px', fontWeight: 500 }}>{user.email}</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                 <Badge label={user.role?.toUpperCase()} variant={user.role === 'admin' ? 'primary' : 'success'} />
                 <Badge label="Active Member" variant="neutral" />
              </div>
           </div>
        </div>

        <div style={{ padding: '40px' }}>
           {/* Section 1: Identity & Credentials */}
           <div style={{ marginBottom: '48px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <div style={{ width: '4px', height: '20px', background: '#3b82f6', borderRadius: '2px' }} />
                 Administrative Metadata
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                 {[
                    { label: 'Cloud Registry ID', value: user.uid, color: '#64748b' },
                    { label: 'Security Status', value: 'Verified Auth', color: '#10b981' },
                    { label: 'Primary Contact', value: contactPhone, color: '#64748b' },
                    { label: 'Last Check-in', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'March 28, 2026', color: '#64748b' }
                 ].map((stat, i) => (
                    <div key={i} style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                       <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '8px' }}>{stat.label}</div>
                       <div style={{ fontSize: '14px', color: stat.color, fontWeight: 700, wordBreak: 'break-all' }}>{stat.value}</div>
                    </div>
                 ))}
              </div>
           </div>

           {/* KYC Hub for Merchants */}
           {(user.role === 'seller' || user.role === 'both') && linkedSeller && (
              <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #3b82f620', overflow: 'hidden' }}>
                 <div style={{ padding: '32px', background: '#3b82f608', borderBottom: '1px solid #3b82f615' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div>
                          <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>KYC Authority Dashboard</h3>
                          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Merchant Verification & Compliance Audit</p>
                       </div>
                       <Badge 
                          label={linkedSeller.status?.toUpperCase() || 'PENDING'} 
                          variant={linkedSeller.status === 'verified' ? 'success' : linkedSeller.status === 'rejected' ? 'error' : 'warning'} 
                       />
                    </div>
                 </div>

                 <div style={{ padding: '32px' }}>
                    {/* Business Details Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px', padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                       <div><div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Shop Name</div><div style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>{linkedSeller.shopName || 'N/A'}</div></div>
                       <div><div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Operating Base</div><div style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>{linkedSeller.sellerLocation || 'N/A'}</div></div>
                       <div><div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Merchant Phone</div><div style={{ fontWeight: 700, color: '#3b82f6', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}><FiPhone size={14}/> {linkedSeller.sellerNumber || 'N/A'}</div></div>
                       <div><div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Market Cap</div><div style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>{linkedSeller.analytics?.totalSales || 0} Deals</div></div>
                    </div>

                    {/* Media Evidence Workspace */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px', marginBottom: '48px' }}>
                       
                       {/* Column 1: Certificate */}
                       <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Government License</h4>
                          <div 
                             onClick={() => linkedSeller.sellerCertificateUrl && setActiveMedia(linkedSeller.sellerCertificateUrl)}
                             style={{ width: '100%', height: '240px', background: '#f1f5f9', borderRadius: '16px', border: '2px dashed #cbd5e1', overflow: 'hidden', cursor: 'pointer', position: 'relative', transition: 'all 0.2s ease' }}
                          >
                             {linkedSeller.sellerCertificateUrl ? (
                                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                   {isPdf(linkedSeller.sellerCertificateUrl) ? (
                                      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff1f2', color: '#e11d48' }}>
                                         <FiFileText size={48} />
                                         <span style={{ fontSize: '12px', fontWeight: 700, marginTop: '8px' }}>VIEW PDF DOCUMENT</span>
                                      </div>
                                   ) : (
                                      <img src={linkedSeller.sellerCertificateUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                   )}
                                   <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                                      <FiEye color="#fff" size={32} />
                                   </div>
                                </div>
                             ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>Missing Documentation</div>
                             )}
                          </div>
                       </div>

                       {/* Column 2: Gallery */}
                       <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Physical Verification Gallery</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                             {linkedSeller.shopPhotoUrls?.map((url, i) => (
                                <div 
                                   key={i} 
                                   onClick={() => setActiveMedia(url)}
                                   style={{ width: '100%', aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', position: 'relative', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                                >
                                   <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                   <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                                      <FiEye color="#fff" size={24} />
                                   </div>
                                </div>
                             ))}
                             {(!linkedSeller.shopPhotoUrls || linkedSeller.shopPhotoUrls.length === 0) && (
                                <div style={{ gridColumn: 'span 4', padding: '40px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No physical media attached</div>
                             )}
                          </div>
                       </div>
                    </div>

                    {/* Action Suite */}
                    <div style={{ display: 'flex', gap: '16px', paddingTop: '32px', borderTop: '1px solid #f1f5f9' }}>
                       <button 
                          onClick={() => handleApproval(true)}
                          disabled={linkedSeller.status === 'verified'}
                          style={{ flex: 1, padding: '16px', background: linkedSeller.status === 'verified' ? '#f1f5f9' : '#10b981', color: linkedSeller.status === 'verified' ? '#94a3b8' : '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: linkedSeller.status === 'verified' ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
                       >
                          <FiCheckCircle size={20} /> AUTHORIZE MERCHANT
                       </button>
                       <button 
                          onClick={() => handleApproval(false)}
                          disabled={linkedSeller.status === 'rejected'}
                          style={{ flex: 1, padding: '16px', background: linkedSeller.status === 'rejected' ? '#f1f5f9' : '#ef4444', color: linkedSeller.status === 'rejected' ? '#94a3b8' : '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: linkedSeller.status === 'rejected' ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
                       >
                          <FiXCircle size={20} /> REJECT CREDENTIALS
                       </button>
                    </div>
                 </div>
              </div>
           )}
        </div>
      </div>

      {/* Lightbox Implementation */}
      {activeMedia && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }} onClick={() => setActiveMedia(null)}>
           <button style={{ position: 'absolute', top: '32px', right: '32px', background: 'rgba(255,255,255,0.1)', border: 'none', width: '48px', height: '48px', borderRadius: '50%', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={24}/></button>
           <div style={{ maxWidth: '90%', maxHeight: '90%', background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
              {isPdf(activeMedia) ? (
                 <object data={activeMedia} type="application/pdf" style={{ width: '80vw', height: '80vh' }}>
                    <embed src={activeMedia} type="application/pdf" />
                 </object>
              ) : (
                 <img src={activeMedia} alt="" style={{ maxWidth: '100%', maxHeight: '85vh', display: 'block' }} />
              )}
           </div>
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
};

export default AdminUserDossier;
