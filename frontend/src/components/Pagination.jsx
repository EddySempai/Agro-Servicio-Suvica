import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  // Generate page numbers
  const pages = [];
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (currentPage <= 3) {
    endPage = Math.min(totalPages, 5);
  }
  if (currentPage >= totalPages - 2) {
    startPage = Math.max(1, totalPages - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px', padding: '16px 0', borderTop: '1px solid var(--border-color)' }}>
      <button 
        onClick={handlePrev} 
        disabled={currentPage === 1}
        className="btn-icon"
        style={{ 
          background: currentPage === 1 ? 'transparent' : 'rgba(255,255,255,0.05)',
          opacity: currentPage === 1 ? 0.5 : 1,
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
        }}
      >
        <ChevronLeft size={18} />
      </button>

      {startPage > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="btn-icon" style={{ background: 'transparent', fontSize: '14px' }}>1</button>
          {startPage > 2 && <span style={{ color: 'var(--text-secondary)' }}>...</span>}
        </>
      )}

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className="btn-icon"
          style={{
            background: currentPage === page ? 'var(--accent-primary)' : 'transparent',
            color: currentPage === page ? '#fff' : 'inherit',
            fontSize: '14px',
            minWidth: '32px',
            height: '32px'
          }}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span style={{ color: 'var(--text-secondary)' }}>...</span>}
          <button onClick={() => onPageChange(totalPages)} className="btn-icon" style={{ background: 'transparent', fontSize: '14px' }}>{totalPages}</button>
        </>
      )}

      <button 
        onClick={handleNext} 
        disabled={currentPage === totalPages}
        className="btn-icon"
        style={{ 
          background: currentPage === totalPages ? 'transparent' : 'rgba(255,255,255,0.05)',
          opacity: currentPage === totalPages ? 0.5 : 1,
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
        }}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
