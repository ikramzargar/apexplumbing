'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, User, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import api from '@/lib/axios';

async function searchCustomersApi(query) {
  const response = await api.get(`/customers?search=${encodeURIComponent(query)}`);
  return response.data;
}

export function CustomerSearch({ onSelect, placeholder = 'Search by phone...' }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const result = await searchCustomersApi(query);
        console.log('Customer search result:', result);
        if (result.success) {
          setSuggestions(result.data || []);
        } else {
          setSuggestions([]);
          setError(result.message || 'Search failed');
        }
        setShowDropdown(true);
        setActiveIndex(-1);
      } catch (err) {
        console.error('Customer search error:', err);
        setSuggestions([]);
        setError(err.message || 'Failed to search customers');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSelect = (customer) => {
    onSelect(customer);
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          className="pl-10"
        />
        {query.length >= 2 && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--color-text-muted)]">
            Search by phone
          </span>
        )}
      </div>

      {query.length >= 2 && showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-[var(--color-border)] rounded-lg shadow-xl max-h-72 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-[var(--color-text-muted)]">Searching...</div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-red-500">{error}</div>
          ) : suggestions.length > 0 ? (
            <>
              <div className="p-2 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-surface-elevated)] bg-[var(--color-surface-elevated)] sticky top-0">
                {suggestions.length} customer{suggestions.length !== 1 ? 's' : ''} found
              </div>
              {suggestions.map((customer, index) => (
                <div
                  key={customer._id}
                  className={`px-4 py-3 cursor-pointer border-b border-[var(--color-surface-elevated)] last:border-0 transition-colors ${
                    index === activeIndex ? 'bg-blue-50' : 'hover:bg-[var(--color-surface-elevated)]'
                  }`}
                  onClick={() => handleSelect(customer)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-[var(--color-primary)]" />
                      <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                        {customer.name || 'No name'}
                      </span>
                    </div>
                    <span className="text-xs font-mono bg-[var(--color-surface-elevated)] px-2 py-1 rounded text-[var(--color-primary)]">
                      {customer.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {customer.total_visits || 1} visit{(customer.total_visits || 1) !== 1 ? 's' : ''}
                    </span>
                    {customer.last_invoice_date && (
                      <span>
                        Last: {new Date(customer.last_invoice_date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    )}
                    {customer.last_payment_method && (
                      <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px]">
                        {customer.last_payment_method}
                      </span>
                    )}
                  </div>
                  {customer.address && (
                    <div className="mt-1 text-xs text-[var(--color-text-muted)]">{customer.address}</div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="p-4 text-center text-sm text-[var(--color-text-muted)]">
              No customers found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}