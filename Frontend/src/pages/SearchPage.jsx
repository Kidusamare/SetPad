import React from 'react';
import SearchComponent from '../components/SearchComponent';

const SearchPage = () => {
    return (
        <div style={{
            background: 'var(--gradient-backdrop)',
            minHeight: '100vh',
            color: 'var(--primary-100)'
        }}>
            <SearchComponent isFullPage={true} />
        </div>
    );
};

export default SearchPage;