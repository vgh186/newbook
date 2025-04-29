import React, { useRef, useEffect } from "react";

export default function TableFilterDropdown({
  options = [],
  value = [],
  onChange,
  onClose,
  anchor,
}) {
  const ref = useRef();

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target) && (!anchor || !anchor.contains(e.target))) {
        onClose && onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose, anchor]);

  return (
    <div ref={ref} style={{
      position: 'absolute', zIndex: 99, background: '#fff', border: '1px solid #dbeafe', borderRadius: 8, boxShadow: '0 2px 10px #e0e7ef77', padding: 10, minWidth: 120, maxHeight: 280, overflowY: 'auto'
    }}>
      <div style={{fontWeight:600,marginBottom:6}}>筛选</div>
      <div>
        {options.map(opt => (
          <label key={opt} style={{display:'block',margin:'6px 0',cursor:'pointer'}}>
            <input
              type="checkbox"
              checked={value.includes(opt)}
              onChange={e => {
                if (e.target.checked) {
                  onChange([...value, opt]);
                } else {
                  onChange(value.filter(v => v !== opt));
                }
              }}
            /> {opt || <span style={{color:'#aaa'}}>(空)</span>}
          </label>
        ))}
      </div>
      <button style={{marginTop:8,width:'100%',background:'#38bdf8',color:'#fff',border:'none',borderRadius:4,padding:'6px 0',fontWeight:600}} onClick={onClose}>确定</button>
    </div>
  );
}
